// Admin API: Cloudflare Access sign-in, then create / edit / moderate community content.
// Writes are refused until ACCESS_TEAM_DOMAIN and ACCESS_AUD are configured (except on localhost).
import type { Env } from "./env";
import { int, json, readJson, slugify, str } from "./http";

// ------------------------------------------------------------------ auth

let jwks: { keys: JsonWebKey[]; fetched: number; team: string } | null = null;

function b64urlToBytes(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function teamHost(team: string) {
  const t = team.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return t.includes(".") ? t : `${t}.cloudflareaccess.com`;
}

async function verifyAccessJwt(token: string, env: Env): Promise<string | null> {
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) return null;
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h))) as { kid?: string; alg?: string };
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p))) as { aud?: string | string[]; exp?: number; iss?: string; email?: string };
  if (header.alg !== "RS256") return null;
  const host = teamHost(env.ACCESS_TEAM_DOMAIN!);
  if (!jwks || jwks.team !== host || Date.now() - jwks.fetched > 10 * 60_000) {
    const res = await fetch(`https://${host}/cdn-cgi/access/certs`);
    if (!res.ok) return null;
    jwks = { keys: ((await res.json()) as { keys: JsonWebKey[] }).keys, fetched: Date.now(), team: host };
  }
  const jwk = jwks.keys.find((k) => (k as { kid?: string }).kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(env.ACCESS_AUD)) return null;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  if (payload.iss !== `https://${host}`) return null;
  return payload.email?.toLowerCase() ?? null;
}

type Auth = { email: string } | { error: string; status: number };

async function authenticate(request: Request, env: Env): Promise<Auth> {
  const host = new URL(request.url).hostname;
  if (host === "localhost" || host === "127.0.0.1") return { email: "dev@localhost" };
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return { error: "not_configured", status: 503 };
  const cookie = request.headers.get("cookie")?.match(/CF_Authorization=([^;]+)/)?.[1];
  const token = request.headers.get("cf-access-jwt-assertion") ?? cookie;
  if (!token) return { error: "signed_out", status: 401 };
  const email = await verifyAccessJwt(token, env).catch(() => null);
  const allowed = (env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (!email || !allowed.includes(email)) return { error: "forbidden", status: 403 };
  return { email };
}

// ------------------------------------------------------------------ tables

interface TableSpec {
  columns: string[]; // editable
  required?: string[];
  ints?: string[];
  jsonCols?: string[];
  order: string;
  create?: boolean;
  slugFrom?: string;
}

const TABLES: Record<string, TableSpec> = {
  events: {
    columns: ["slug", "title", "group_id", "category", "summary", "description", "start_at", "end_at", "venue", "address", "area", "price_inr", "price_note", "capacity", "organizer_name", "image", "beginner_friendly", "first_timer_note", "age_note", "accessibility_note", "cancellation_terms", "status", "is_sample", "published"],
    required: ["title", "start_at", "venue"],
    ints: ["group_id", "price_inr", "capacity", "beginner_friendly", "is_sample", "published"],
    order: "start_at DESC",
    create: true,
    slugFrom: "title",
  },
  groups: {
    columns: ["slug", "name", "tagline", "description", "interests", "owner_name", "owner_role", "status", "image", "joining_note", "is_sample", "published", "sort"],
    required: ["name", "owner_name"],
    ints: ["is_sample", "published", "sort"],
    jsonCols: ["interests"],
    order: "sort, name",
    create: true,
    slugFrom: "name",
  },
  stories: {
    columns: ["slug", "title", "summary", "body", "photos", "group_id", "event_date", "consent_confirmed", "status", "is_sample"],
    required: ["title"],
    ints: ["group_id", "consent_confirmed", "is_sample"],
    jsonCols: ["photos"],
    order: "event_date DESC",
    create: true,
    slugFrom: "title",
  },
  opportunities: {
    columns: ["title", "kind", "compensation", "eligibility", "deadline", "description", "how_to_apply", "posted_by", "contact", "status", "is_sample"],
    required: ["title", "kind", "compensation", "how_to_apply"],
    ints: ["is_sample"],
    order: "created_at DESC",
    create: true,
  },
  adda_posts: {
    columns: ["kind", "title", "body", "category", "author_name", "poll_options", "status", "admin_note", "published", "closed", "is_sample"],
    required: ["kind", "title"],
    ints: ["published", "closed", "is_sample"],
    jsonCols: ["poll_options"],
    order: "published, created_at DESC",
    create: true,
  },
  submissions: { columns: ["status", "admin_note"], order: "created_at DESC" },
  members: { columns: ["status"], order: "created_at DESC" },
  rsvps: { columns: ["status"], ints: [], order: "created_at DESC" },
};

const HAS_UPDATED_AT = new Set(["events", "groups", "stories", "opportunities", "adda_posts", "submissions"]);

function coerce(spec: TableSpec, body: Record<string, unknown>, onlyPresent: boolean) {
  const out: Record<string, unknown> = {};
  for (const col of spec.columns) {
    if (onlyPresent && !(col in body)) continue;
    const v = body[col];
    if (spec.ints?.includes(col)) out[col] = v === null || v === "" ? (col === "group_id" ? null : 0) : int(v);
    else if (spec.jsonCols?.includes(col)) out[col] = JSON.stringify(Array.isArray(v) ? v : []);
    else out[col] = str(v, 4000);
  }
  return out;
}

function check(table: string, row: Record<string, unknown>, spec: TableSpec, creating: boolean) {
  const fields: Record<string, string> = {};
  if (creating) for (const r of spec.required ?? []) if (!row[r]) fields[r] = "Required.";
  if (table === "events" && row.start_at && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(row.start_at))) fields.start_at = "Use date and time.";
  if (table === "stories" && row.status === "published" && Number(row.consent_confirmed) !== 1)
    fields.consent_confirmed = "Confirm consent from everyone identifiable before publishing.";
  return fields;
}

// ------------------------------------------------------------------ handler

export async function handleAdmin(request: Request, env: Env, path: string): Promise<Response> {
  const auth = await authenticate(request, env);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  const seg = path.split("/").filter(Boolean); // api admin <table> <id>
  const method = request.method;

  if (method === "GET" && seg[2] === "me") return json({ email: auth.email });

  if (method === "GET" && seg[2] === "overview") {
    const q = (sql: string) => env.DB.prepare(sql);
    const [members, rsvps, adda, opps, subs, stories, upcoming] = await env.DB.batch([
      q("SELECT COUNT(*) AS n FROM members WHERE status = 'new'"),
      q("SELECT COUNT(*) AS n FROM rsvps WHERE created_at >= datetime('now', '-7 days') AND ref != 'SAMPLE-FULL'"),
      q("SELECT COUNT(*) AS n FROM adda_posts WHERE published = 0 AND status != 'not_proceeding'"),
      q("SELECT COUNT(*) AS n FROM opportunities WHERE status = 'pending'"),
      q("SELECT COUNT(*) AS n FROM submissions WHERE status IN ('received', 'reviewing')"),
      q("SELECT COUNT(*) AS n FROM stories WHERE status = 'draft'"),
      q("SELECT COUNT(*) AS n FROM events WHERE published = 1 AND status = 'scheduled' AND start_at >= datetime('now', '+330 minutes')"),
    ]);
    const n = (r: { results: Record<string, unknown>[] }) => Number(r.results[0]?.n ?? 0);
    return json({
      newMembers: n(members),
      rsvps7d: n(rsvps),
      pendingAdda: n(adda),
      pendingOpportunities: n(opps),
      openSubmissions: n(subs),
      draftStories: n(stories),
      upcomingEvents: n(upcoming),
    });
  }

  if (seg[2] === "stats") {
    if (method === "GET") {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'stats'").first<{ value: string }>();
      return json({ stats: row ? JSON.parse(row.value) : null });
    }
    if (method === "PUT") {
      const body = (await readJson(request)) ?? {};
      const items = Array.isArray(body.items) ? body.items : [];
      const clean = items
        .map((i: { label?: unknown; value?: unknown }) => ({ label: str(i.label, 60), value: str(i.value, 20) }))
        .filter((i: { label: string; value: string }) => i.label && i.value)
        .slice(0, 4);
      if (clean.length) {
        await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('stats', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
          .bind(JSON.stringify({ items: clean, verified_by: auth.email, verified_on: new Date().toISOString().slice(0, 10) }))
          .run();
      } else await env.DB.prepare("DELETE FROM settings WHERE key = 'stats'").run();
      return json({ ok: true });
    }
  }

  const table = seg[2];
  const spec = TABLES[table];
  if (!spec) return json({ error: "not_found" }, 404);
  const id = seg[3] ? int(seg[3], -1) : null;

  if (method === "GET" && id === null) {
    const url = new URL(request.url);
    if (table === "rsvps") {
      const eventId = int(url.searchParams.get("event_id"), 0);
      const { results } = await env.DB.prepare(
        `SELECT r.*, e.title AS event_title, e.start_at FROM rsvps r JOIN events e ON e.id = r.event_id ${eventId ? "WHERE r.event_id = ?" : ""} ORDER BY r.created_at DESC LIMIT 500`,
      )
        .bind(...(eventId ? [eventId] : []))
        .all();
      return json({ rows: results });
    }
    if (table === "members") {
      const { results } = await env.DB.prepare("SELECT m.*, g.name AS group_name FROM members m LEFT JOIN groups g ON g.id = m.group_id ORDER BY m.created_at DESC LIMIT 500").all();
      return json({ rows: results });
    }
    if (table === "events") {
      const { results } = await env.DB.prepare(
        "SELECT e.*, (SELECT COALESCE(SUM(party_size),0) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'confirmed') AS booked FROM events e ORDER BY start_at DESC LIMIT 300",
      ).all();
      return json({ rows: results });
    }
    if (table === "adda_posts") {
      const { results } = await env.DB.prepare(
        "SELECT p.*, (SELECT COUNT(*) FROM poll_votes v WHERE v.post_id = p.id) AS vote_count FROM adda_posts p ORDER BY p.published, p.created_at DESC LIMIT 300",
      ).all();
      return json({ rows: results });
    }
    const { results } = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY ${spec.order} LIMIT 500`).all();
    return json({ rows: results });
  }

  if (method === "POST" && id === null) {
    if (!spec.create) return json({ error: "not_allowed" }, 405);
    const body = (await readJson(request)) ?? {};
    const row = coerce(spec, body, false);
    if (spec.slugFrom && !row.slug) row.slug = slugify(String(row[spec.slugFrom] ?? ""));
    const fields = check(table, row, spec, true);
    if (Object.keys(fields).length) return json({ error: "invalid", fields }, 422);
    const cols = Object.keys(row);
    try {
      const res = await env.DB.prepare(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
        .bind(...cols.map((c) => row[c]))
        .run();
      return json({ ok: true, id: res.meta.last_row_id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("UNIQUE")) return json({ error: "invalid", fields: { slug: "That web address is already used." } }, 422);
      throw e;
    }
  }

  if (method === "PUT" && id !== null && id > 0) {
    const body = (await readJson(request)) ?? {};
    const row = coerce(spec, body, true);
    if (table === "stories" && row.status === "published" && !("consent_confirmed" in row)) {
      const current = await env.DB.prepare("SELECT consent_confirmed FROM stories WHERE id = ?").bind(id).first<{ consent_confirmed: number }>();
      row.consent_confirmed = current?.consent_confirmed ?? 0;
    }
    const fields = check(table, row, spec, false);
    if (Object.keys(fields).length) return json({ error: "invalid", fields }, 422);
    const cols = Object.keys(row);
    if (!cols.length) return json({ ok: true });
    const set = cols.map((c) => `${c} = ?`).join(", ") + (HAS_UPDATED_AT.has(table) ? ", updated_at = datetime('now')" : "");
    await env.DB.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`)
      .bind(...cols.map((c) => row[c]), id)
      .run();
    return json({ ok: true });
  }

  return json({ error: "not_found" }, 404);
}
