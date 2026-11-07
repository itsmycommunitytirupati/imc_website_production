// Paid RSVPs: seat hold → (IMC credit and/or PhonePe) → booking confirmed only after the gateway's
// Order Status API says COMPLETED. Also "My bookings", cancellation choices (credit or refund),
// the PhonePe webhook, and the scheduled reconcile job.
import type { Env } from "./env";
import { rateLimited } from "./guardrails";
import { humanCheck, int, json, nowLocal, randomRef, readJson, seatsTakenSql, sha256, str, type Fields } from "./http";
import { isEmail, normEmail, sessionEmail } from "./auth";
import { createOrder, gatewayMode, orderStatus, refund, refundStatus, webhookAuthorized } from "./phonepe";
import { rupees, sendEmail } from "./email";

const HOLD_MINUTES = 15;
const PHONE = /^(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;

interface Payment {
  id: number;
  merchant_order_id: string;
  event_id: number;
  ref: string;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  note: string;
  total_paise: number;
  credit_paise: number;
  gateway_paise: number;
  state: string;
  resolution: string;
  expires_at: string;
}

const utc = (msFromNow: number) => new Date(Date.now() + msFromNow).toISOString().replace("T", " ").slice(0, 19);
const randomHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

export function siteUrl(env: Env) {
  return (env.SITE_URL ?? "").replace(/\/$/, "");
}

/** Where PhonePe sends the person back: the site they paid from, if it's one of ours. */
function returnOrigin(env: Env, request: Request) {
  const origin = request.headers.get("origin") ?? "";
  try {
    const host = new URL(origin).hostname;
    const ours = host === "imctirupati.com" || host.endsWith(".imctirupati.com") || host.endsWith("itsmycommunity-tirupati.workers.dev");
    const local = env.ADMIN_DEV_BYPASS === "1" && (host === "127.0.0.1" || host === "localhost");
    if (ours || local) return origin;
  } catch {
    // Missing or malformed Origin: fall back to the configured site.
  }
  return siteUrl(env);
}

export async function creditBalance(env: Env, email: string) {
  const row = await env.DB.prepare("SELECT COALESCE(SUM(amount_paise), 0) AS b FROM credit_ledger WHERE email = ?").bind(email).first<{ b: number }>();
  return Number(row?.b ?? 0);
}

async function eventInfo(env: Env, id: number) {
  return env.DB.prepare("SELECT title, slug, start_at, venue FROM events WHERE id = ?").bind(id).first<{ title: string; slug: string; start_at: string; venue: string }>();
}

// ------------------------------------------------------------------ settle a payment

/** Marks a payment completed and creates its booking. Safe to call any number of times. */
async function complete(env: Env, p: Payment, status?: { paymentMode: string; transactionId: string }) {
  const prev = await env.DB.prepare("SELECT state FROM payments WHERE id = ?").bind(p.id).first<{ state: string }>();
  const res = await env.DB.prepare(
    "UPDATE payments SET state = 'completed', payment_mode = COALESCE(?, payment_mode), transaction_id = COALESCE(?, transaction_id), updated_at = datetime('now') WHERE id = ? AND state != 'completed'",
  )
    .bind(status?.paymentMode ?? null, status?.transactionId ?? null, p.id)
    .run();
  if (res.meta.changes !== 1) return false;
  // A late success after the hold expired: the credit returned on expiry is spent again.
  if (prev?.state === "expired" && p.credit_paise > 0)
    await env.DB.prepare("INSERT INTO credit_ledger (email, amount_paise, reason, payment_id) VALUES (?, ?, 'spent', ?)").bind(p.email, -p.credit_paise, p.id).run();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO rsvps (event_id, ref, name, contact, email, party_size, note, status, payment_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)",
  )
    .bind(p.event_id, p.ref, p.name, p.phone || p.email, p.email, p.party_size, p.note, p.id)
    .run();
  const e = await eventInfo(env, p.event_id);
  if (e) {
    const when = new Date(`${e.start_at}:00+05:30`).toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const paid = [p.gateway_paise ? `${rupees(p.gateway_paise)} via PhonePe` : "", p.credit_paise ? `${rupees(p.credit_paise)} from IMC credit` : ""].filter(Boolean).join(" + ");
    await sendEmail(env, {
      to: p.email,
      subject: `You're in: ${e.title} (${p.ref})`,
      text: `Hi ${p.name},\n\nYour spot is confirmed.\n\n${e.title}\n${when}\n${e.venue}\n${p.party_size} ${p.party_size > 1 ? "people" : "person"} · Paid ${paid}\nReference: ${p.ref}\n\nSee your bookings any time: ${siteUrl(env)}/bookings\n\nCan't make it? Reply to IMC on WhatsApp with your reference.`,
    });
  }
  return true;
}

/** Marks a payment failed or expired, frees its seats and returns any credit it used. */
async function release(env: Env, p: Payment, state: "failed" | "expired") {
  const res = await env.DB.prepare("UPDATE payments SET state = ?, updated_at = datetime('now') WHERE id = ? AND state IN ('created', 'pending')").bind(state, p.id).run();
  if (res.meta.changes === 1 && p.credit_paise > 0) {
    await env.DB.prepare("INSERT INTO credit_ledger (email, amount_paise, reason, payment_id) VALUES (?, ?, 'spend_reversed', ?)").bind(p.email, p.credit_paise, p.id).run();
  }
}

/** Asks PhonePe for the truth and settles the payment accordingly. */
export async function reconcile(env: Env, p: Payment) {
  if (p.state === "completed" || p.state === "failed") return p.state;
  if (p.gateway_paise === 0) return p.state;
  const status = await orderStatus(env, p.merchant_order_id);
  if (status?.state === "COMPLETED") {
    await complete(env, p, status);
    return "completed";
  }
  if (status?.state === "FAILED") {
    await release(env, p, "failed");
    return "failed";
  }
  if (status?.state === "PENDING" && p.state === "created") {
    await env.DB.prepare("UPDATE payments SET state = 'pending', updated_at = datetime('now') WHERE id = ? AND state = 'created'").bind(p.id).run();
    return "pending";
  }
  return p.state;
}

const byOrder = (env: Env, merchantOrderId: string) => env.DB.prepare("SELECT * FROM payments WHERE merchant_order_id = ?").bind(merchantOrderId).first<Payment>();

// ------------------------------------------------------------------ credit or refund

/** Cancels a paid booking and returns the money as IMC credit or to the original account. */
export async function resolvePayment(env: Env, paymentId: number, to: "credit" | "refund", by: string) {
  const p = await env.DB.prepare("SELECT * FROM payments WHERE id = ?").bind(paymentId).first<Payment>();
  if (!p || p.state !== "completed") return { error: "not_paid" };
  // Claim the payment first so two clicks can't refund twice.
  const claim = await env.DB.prepare("UPDATE payments SET resolution = ?, claim_token_hash = '', updated_at = datetime('now') WHERE id = ? AND resolution = ''").bind(to, p.id).run();
  if (claim.meta.changes !== 1) return { error: "already_resolved" };
  await env.DB.prepare("UPDATE rsvps SET status = 'cancelled' WHERE payment_id = ?").bind(p.id).run();
  const toCredit = to === "credit" ? p.total_paise : p.credit_paise;
  if (toCredit > 0) {
    await env.DB.prepare("INSERT INTO credit_ledger (email, amount_paise, reason, payment_id, note) VALUES (?, ?, 'cancelled_event', ?, ?)")
      .bind(p.email, toCredit, p.id, `by ${by}`)
      .run();
  }
  if (to === "refund" && p.gateway_paise > 0) {
    const merchantRefundId = `R${p.merchant_order_id}`.slice(0, 63);
    await env.DB.prepare("INSERT OR IGNORE INTO refunds (merchant_refund_id, payment_id, amount_paise, requested_by) VALUES (?, ?, ?, ?)").bind(merchantRefundId, p.id, p.gateway_paise, by).run();
    try {
      const r = await refund(env, { merchantRefundId, merchantOrderId: p.merchant_order_id, amountPaise: p.gateway_paise });
      await env.DB.prepare("UPDATE refunds SET phonepe_refund_id = ?, state = ?, updated_at = datetime('now') WHERE merchant_refund_id = ?")
        .bind(r.refundId, r.state === "COMPLETED" ? "completed" : r.state === "FAILED" ? "failed" : "pending", merchantRefundId)
        .run();
    } catch (err) {
      // Left as pending; the scheduled job and the admin can retry.
      console.error("refund failed", merchantRefundId, err instanceof Error ? err.message : err);
    }
  }
  const e = await eventInfo(env, p.event_id);
  await sendEmail(env, {
    to: p.email,
    subject: to === "credit" ? `${rupees(toCredit)} IMC credit added (${p.ref})` : `Refund started for ${p.ref}`,
    text:
      to === "credit"
        ? `Hi ${p.name},\n\n${rupees(toCredit)} is now IMC credit for your next event${e ? ` (for ${e.title})` : ""}. It's used automatically when you pay with this email.\n\nSee your credit: ${siteUrl(env)}/bookings`
        : `Hi ${p.name},\n\nWe've started a refund of ${rupees(p.gateway_paise)} to the account you paid from${e ? ` for ${e.title}` : ""}. Banks usually show it within a few working days.${p.credit_paise ? `\n\nThe ${rupees(p.credit_paise)} you paid with IMC credit is back as credit.` : ""}\n\nReference: ${p.ref}`,
  });
  return { ok: true, credited: toCredit, refunded: to === "refund" ? p.gateway_paise : 0 };
}

/** After IMC cancels an event: email each payer a one-tap choice between credit and refund. */
export async function notifyPayers(env: Env, eventId: number) {
  const e = await eventInfo(env, eventId);
  const { results } = await env.DB.prepare("SELECT * FROM payments WHERE event_id = ? AND state = 'completed' AND resolution = '' AND claim_sent_at = ''").bind(eventId).all<Payment>();
  let sent = 0;
  for (const p of results) {
    const tokenValue = randomHex(24);
    await env.DB.prepare("UPDATE payments SET claim_token_hash = ?, claim_sent_at = datetime('now') WHERE id = ?").bind(await sha256(tokenValue), p.id).run();
    const ok = await sendEmail(env, {
      to: p.email,
      subject: `${e?.title ?? "Your IMC event"} is cancelled: credit or refund?`,
      text: `Hi ${p.name},\n\nSorry, ${e?.title ?? "your event"} has been cancelled.\n\nYou paid ${rupees(p.total_paise)} (reference ${p.ref}). Choose what you'd like:\n\n${siteUrl(env)}/bookings/choose?t=${tokenValue}\n\nKeep it as IMC credit (instant, use it for any IMC event) or get a refund to the account you paid from.`,
    });
    if (ok) sent++;
  }
  return { payers: results.length, sent };
}

// ------------------------------------------------------------------ scheduled job

/** Settles open payments whose webhook or return visit never came, and checks pending refunds. */
export async function reconcileAll(env: Env) {
  if (!gatewayMode(env)) return;
  const { results } = await env.DB.prepare(
    "SELECT * FROM payments WHERE state IN ('created', 'pending') AND created_at < datetime('now', '-2 minutes') AND created_at > datetime('now', '-3 days') ORDER BY id LIMIT 50",
  ).all<Payment>();
  for (const p of results) {
    const state = await reconcile(env, p).catch(() => p.state);
    // Nothing from PhonePe well after the hold ended: free the seats.
    if ((state === "created" || state === "pending") && p.expires_at < utc(-30 * 60_000)) await release(env, p, "expired");
  }
  const refunds = await env.DB.prepare("SELECT merchant_refund_id FROM refunds WHERE state = 'pending' ORDER BY id LIMIT 20").all<{ merchant_refund_id: string }>();
  for (const r of refunds.results) {
    const s = await refundStatus(env, r.merchant_refund_id).catch(() => null);
    if (s?.state === "COMPLETED" || s?.state === "FAILED")
      await env.DB.prepare("UPDATE refunds SET state = ?, updated_at = datetime('now') WHERE merchant_refund_id = ?").bind(s.state.toLowerCase(), r.merchant_refund_id).run();
  }
}

// ------------------------------------------------------------------ routes

export async function handlePayments(request: Request, env: Env, path: string): Promise<Response | null> {
  const method = request.method;
  const ip = request.headers.get("cf-connecting-ip") ?? "anon";

  if (method === "POST" && path === "/api/pay/start") {
    if (rateLimited(`${ip}:pay`, 30)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const name = str(body.name, 80);
    const email = normEmail(body.email);
    const phone = str(body.phone, 20);
    const party = Math.min(Math.max(int(body.party_size, 1), 1), 6);
    const fields: Fields = {};
    if (name.length < 2) fields.name = "Please tell us your name.";
    if (!isEmail(email)) fields.email = "Enter your email address.";
    if (!PHONE.test(phone)) fields.phone = "Enter a 10-digit mobile number.";
    if (Object.keys(fields).length) return json({ error: "invalid", fields }, 422);

    const event = await env.DB.prepare("SELECT id, title, slug, status, start_at, capacity, price_inr, published, is_sample FROM events WHERE slug = ?").bind(str(body.slug, 80)).first<{
      id: number;
      title: string;
      slug: string;
      status: string;
      start_at: string;
      capacity: number;
      price_inr: number;
      published: number;
      is_sample: number;
    }>();
    if (!event || !event.published) return json({ error: "not_found" }, 404);
    if (event.status === "cancelled") return json({ error: "cancelled" }, 410);
    if (event.start_at < nowLocal()) return json({ error: "past" }, 410);
    if (!(event.price_inr > 0)) return json({ error: "free_event" }, 400);
    // Sample listings are fictitious: they never take real money, even with live payments on.
    if (event.is_sample === 1) return json({ error: "sample_event" }, 400);

    // Same email already booked: show the existing booking instead of charging twice.
    const existing = await env.DB.prepare("SELECT ref FROM rsvps WHERE event_id = ? AND email = ? AND status = 'confirmed'").bind(event.id, email).first<{ ref: string }>();
    if (existing) return json({ ok: true, status: "confirmed", ref: existing.ref, repeat: true });

    const total = event.price_inr * 100 * party;
    // Credit is spent only by a signed-in owner of that email.
    const signedIn = await sessionEmail(request, env);
    const wantsCredit = body.use_credit === true && signedIn === email;
    const balance = wantsCredit ? await creditBalance(env, email) : 0;
    const credit = Math.min(balance, total);
    let gateway = total - credit;
    if (gateway > 0 && gateway < 100) gateway = 100; // PhonePe's minimum is ₹1
    const creditUsed = total - gateway;
    if (gateway > 0 && !gatewayMode(env)) return json({ error: "payments_unavailable" }, 503);

    const ref = randomRef();
    const merchantOrderId = `IMC${Date.now().toString(36)}${randomHex(4)}`.toUpperCase();
    // Hold the seats in one statement, so two people can't take the last one.
    const hold = await env.DB.prepare(
      `INSERT INTO payments (merchant_order_id, event_id, ref, name, email, phone, party_size, note, total_paise, credit_paise, gateway_paise, state, expires_at)
       SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'created', ?12
       WHERE (SELECT capacity FROM events WHERE id = ?2) = 0 OR ${seatsTakenSql("?2")} + ?7 <= (SELECT capacity FROM events WHERE id = ?2)`,
    )
      .bind(merchantOrderId, event.id, ref, name, email, phone, party, str(body.note, 300), total, creditUsed, gateway, utc(HOLD_MINUTES * 60_000))
      .run();
    if (hold.meta.changes !== 1) return json({ error: "sold_out" }, 409);
    const p = await byOrder(env, merchantOrderId);
    if (!p) return json({ error: "server_error" }, 500);

    if (creditUsed > 0) {
      const spend = await env.DB.prepare(
        "INSERT INTO credit_ledger (email, amount_paise, reason, payment_id) SELECT ?1, -?2, 'spent', ?3 WHERE (SELECT COALESCE(SUM(amount_paise), 0) FROM credit_ledger WHERE email = ?1) >= ?2",
      )
        .bind(email, creditUsed, p.id)
        .run();
      if (spend.meta.changes !== 1) {
        await env.DB.prepare("UPDATE payments SET state = 'failed', credit_paise = 0 WHERE id = ?").bind(p.id).run();
        return json({ error: "credit_changed" }, 409);
      }
    }
    if (gateway === 0) {
      await complete(env, p);
      return json({ ok: true, status: "confirmed", ref, paid_with: "credit" });
    }
    try {
      const order = await createOrder(env, {
        merchantOrderId,
        amountPaise: gateway,
        expireAfter: HOLD_MINUTES * 60,
        redirectUrl: `${returnOrigin(env, request)}/pay/return?o=${merchantOrderId}`,
        event: event.slug,
        ref,
      });
      await env.DB.prepare("UPDATE payments SET phonepe_order_id = ? WHERE id = ?").bind(order.orderId, p.id).run();
      return json({ ok: true, status: "redirect", url: order.checkoutUrl, order: merchantOrderId });
    } catch (err) {
      console.error("create order failed", err instanceof Error ? err.message : err);
      await release(env, p, "failed");
      return json({ error: "gateway_error" }, 502);
    }
  }

  if (method === "GET" && path === "/api/pay/status") {
    const o = str(new URL(request.url).searchParams.get("o"), 63);
    if (rateLimited(`${ip}:paystatus`, 120)) return json({ error: "rate_limited" }, 429);
    let p = o ? await byOrder(env, o) : null;
    if (!p) return json({ error: "not_found" }, 404);
    if (p.state === "created" || p.state === "pending") {
      await reconcile(env, p).catch(() => null);
      p = (await byOrder(env, o))!;
    }
    const e = await eventInfo(env, p.event_id);
    return json({
      state: p.state,
      ref: p.state === "completed" ? p.ref : null,
      party_size: p.party_size,
      total_paise: p.total_paise,
      event: e ? { title: e.title, slug: e.slug, start_at: e.start_at, venue: e.venue } : null,
    });
  }

  if (method === "POST" && path === "/api/pay/webhook") {
    const authorized = await webhookAuthorized(env, request.headers.get("authorization"));
    if (!authorized) {
      console.warn("phonepe webhook: authorization mismatch");
      return json({ error: "unauthorized" }, 401);
    }
    const body = (await readJson<{ event?: string; payload?: Record<string, unknown> } & Record<string, unknown>>(request, 100_000)) ?? {};
    const payload = (body.payload ?? body) as Record<string, unknown>;
    const orderId = str(payload.merchantOrderId ?? payload.originalMerchantOrderId, 63);
    // The payload only says which order to look at; the Status API decides what happened.
    if (orderId) {
      const p = await byOrder(env, orderId);
      if (p) await reconcile(env, p).catch(() => null);
    }
    const refundId = str(payload.merchantRefundId, 63);
    if (refundId) {
      const s = await refundStatus(env, refundId).catch(() => null);
      if (s?.state === "COMPLETED" || s?.state === "FAILED")
        await env.DB.prepare("UPDATE refunds SET state = ?, updated_at = datetime('now') WHERE merchant_refund_id = ?").bind(s.state.toLowerCase(), refundId).run();
    }
    return json({ ok: true });
  }

  if (method === "GET" && path === "/api/pay/claim") {
    const tokenValue = str(new URL(request.url).searchParams.get("t"), 64);
    if (rateLimited(`${ip}:claim`, 30)) return json({ error: "rate_limited" }, 429);
    if (!/^[a-f0-9]{48}$/.test(tokenValue)) return json({ error: "not_found" }, 404);
    const p = await env.DB.prepare("SELECT * FROM payments WHERE claim_token_hash = ?").bind(await sha256(tokenValue)).first<Payment>();
    if (!p) return json({ error: "not_found" }, 404);
    const e = await eventInfo(env, p.event_id);
    return json({ ref: p.ref, name: p.name, total_paise: p.total_paise, gateway_paise: p.gateway_paise, credit_paise: p.credit_paise, event: e?.title ?? "", resolution: p.resolution });
  }

  if (method === "POST" && path === "/api/pay/choose") {
    const body = await readJson(request);
    const tokenValue = str(body?.t, 64);
    const choice = body?.choice === "refund" ? "refund" : body?.choice === "credit" ? "credit" : null;
    if (rateLimited(`${ip}:claim`, 30)) return json({ error: "rate_limited" }, 429);
    if (!choice || !/^[a-f0-9]{48}$/.test(tokenValue)) return json({ error: "bad_request" }, 400);
    const p = await env.DB.prepare("SELECT id FROM payments WHERE claim_token_hash = ?").bind(await sha256(tokenValue)).first<{ id: number }>();
    if (!p) return json({ error: "not_found" }, 404);
    const res = await resolvePayment(env, p.id, choice, "payer");
    return "error" in res ? json(res, 409) : json(res);
  }

  if (method === "GET" && path === "/api/me") {
    const email = await sessionEmail(request, env);
    if (!email) return json({ error: "signed_out" }, 401);
    const [credit, bookings] = await Promise.all([
      creditBalance(env, email),
      env.DB.prepare(
        `SELECT r.ref, r.party_size, r.status, e.title, e.slug, e.start_at, e.venue, e.status AS event_status, p.total_paise, p.resolution
         FROM rsvps r JOIN events e ON e.id = r.event_id LEFT JOIN payments p ON p.id = r.payment_id
         WHERE r.email = ? OR r.contact = ? ORDER BY e.start_at DESC LIMIT 100`,
      )
        .bind(email, email)
        .all(),
    ]);
    return json({ email, credit_paise: credit, bookings: bookings.results });
  }

  // Local testing only: the mock checkout page reports its outcome here.
  if (method === "POST" && path === "/api/pay/mock") {
    if (gatewayMode(env) !== "mock") return json({ error: "not_found" }, 404);
    const body = await readJson(request);
    const outcome = body?.outcome === "fail" ? "MOCK_FAILED" : "MOCK_COMPLETED";
    await env.DB.prepare("UPDATE payments SET payment_mode = ? WHERE merchant_order_id = ?").bind(outcome, str(body?.o, 63)).run();
    return json({ ok: true });
  }

  return null;
}
