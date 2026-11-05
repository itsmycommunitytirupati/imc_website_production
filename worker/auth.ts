// Passwordless sign-in for "My bookings": a 6-digit code by email, then an HttpOnly session
// cookie. Only hashes of codes and session tokens are stored.
import type { Env } from "./env";
import { json, readJson, sha256, str } from "./http";
import { rateLimited } from "./guardrails";
import { emailEnabled, sendEmail } from "./email";

const COOKIE = "imc_session";
const SESSION_DAYS = 30;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

export const normEmail = (v: unknown) => str(v, 254).toLowerCase();
export const isEmail = (s: string) => EMAIL.test(s);
const utc = (msFromNow: number) => new Date(Date.now() + msFromNow).toISOString().replace("T", " ").slice(0, 19);

/** The signed-in email for this request, or null. */
export async function sessionEmail(request: Request, env: Env): Promise<string | null> {
  const raw = request.headers.get("cookie")?.match(new RegExp(`${COOKIE}=([a-f0-9]{64})`))?.[1];
  if (!raw) return null;
  const row = await env.DB.prepare("SELECT email FROM sessions WHERE token_hash = ? AND expires_at > datetime('now')").bind(await sha256(raw)).first<{ email: string }>();
  return row?.email ?? null;
}

function randomHex(bytes: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleAuth(request: Request, env: Env, path: string): Promise<Response | null> {
  const ip = request.headers.get("cf-connecting-ip") ?? "anon";

  if (request.method === "POST" && path === "/api/auth/start") {
    const body = await readJson(request);
    const email = normEmail(body?.email);
    if (!isEmail(email)) return json({ error: "invalid", fields: { email: "Enter your email address." } }, 422);
    if (rateLimited(`${ip}:login`, 6) || rateLimited(`login:${email}`, 4)) return json({ error: "rate_limited" }, 429);
    if (!emailEnabled(env) && env.EMAIL_DEV_ECHO !== "1") return json({ error: "email_unavailable" }, 503);
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    await env.DB.prepare(
      "INSERT INTO login_codes (email, code_hash, attempts, expires_at) VALUES (?, ?, 0, ?) ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at",
    )
      .bind(email, await sha256(`${email}:${code}`), utc(10 * 60_000))
      .run();
    const sent = await sendEmail(env, {
      to: email,
      subject: `${code} is your IMC Tirupati code`,
      text: `Your sign-in code is ${code}\n\nIt works for 10 minutes. If you didn't ask for it, you can ignore this email.`,
    });
    if (!sent) return json({ error: "email_failed" }, 502);
    return json({ ok: true, ...(env.EMAIL_DEV_ECHO === "1" && !emailEnabled(env) ? { dev_code: code } : {}) });
  }

  if (request.method === "POST" && path === "/api/auth/verify") {
    const body = await readJson(request);
    const email = normEmail(body?.email);
    const code = str(body?.code, 6);
    if (rateLimited(`${ip}:verify`, 20)) return json({ error: "rate_limited" }, 429);
    const row = await env.DB.prepare("SELECT code_hash, attempts FROM login_codes WHERE email = ? AND expires_at > datetime('now')").bind(email).first<{ code_hash: string; attempts: number }>();
    if (!row || row.attempts >= 5) return json({ error: "invalid", fields: { code: "That code has expired. Ask for a new one." } }, 422);
    if (row.code_hash !== (await sha256(`${email}:${code}`))) {
      await env.DB.prepare("UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?").bind(email).run();
      return json({ error: "invalid", fields: { code: "That code doesn't match. Check the email and try again." } }, 422);
    }
    const tokenValue = randomHex(32);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM login_codes WHERE email = ?").bind(email),
      env.DB.prepare("INSERT INTO sessions (token_hash, email, expires_at) VALUES (?, ?, ?)").bind(await sha256(tokenValue), email, utc(SESSION_DAYS * 86_400_000)),
    ]);
    return json({ ok: true, email }, 200, {
      "set-cookie": `${COOKIE}=${tokenValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86_400}`,
    });
  }

  if (request.method === "POST" && path === "/api/auth/logout") {
    const raw = request.headers.get("cookie")?.match(new RegExp(`${COOKIE}=([a-f0-9]{64})`))?.[1];
    if (raw) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(raw)).run();
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }

  return null;
}
