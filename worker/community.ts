// Public community API: events + RSVP, groups + join, Adda, opportunities, stories, submissions.
import type { Env } from "./env";
import { rateLimited } from "./guardrails";
import { checkPerson, humanCheck, int, invalid, json, nowLocal, parseList, randomRef, readJson, sha256, str, today, type Fields } from "./http";

const EVENT_COLS = `e.id, e.slug, e.title, e.category, e.summary, e.start_at, e.end_at, e.venue, e.area, e.price_inr, e.price_note,
  e.capacity, e.organizer_name, e.image, e.beginner_friendly, e.status, e.is_sample, g.slug AS group_slug, g.name AS group_name,
  (SELECT COALESCE(SUM(party_size), 0) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'confirmed') AS booked`;

type Row = Record<string, unknown>;

function withSeats(e: Row) {
  const capacity = Number(e.capacity) || 0;
  const booked = Number(e.booked) || 0;
  const { booked: _b, ...rest } = e;
  return { ...rest, seats_left: capacity ? Math.max(capacity - booked, 0) : null };
}

export async function handleCommunity(request: Request, env: Env, path: string): Promise<Response | null> {
  const url = new URL(request.url);
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const method = request.method;
  const seg = path.split("/").filter(Boolean); // ["api", "events", "slug"]

  if (method === "GET" && path === "/api/config") {
    return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || "", humanCheck: Boolean(env.TURNSTILE_SECRET) });
  }

  if (method === "GET" && path === "/api/stats") {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'stats'").first<{ value: string }>();
    return json({ stats: row ? JSON.parse(row.value) : null });
  }

  // ---------------------------------------------------------------- events
  if (method === "GET" && path === "/api/events") {
    const where = ["e.published = 1", "e.status != 'completed'"];
    const binds: unknown[] = [];
    const from = str(url.searchParams.get("from"), 10) || today();
    const to = str(url.searchParams.get("to"), 10);
    where.push("substr(e.start_at, 1, 10) >= ?");
    binds.push(from);
    if (to) {
      where.push("substr(e.start_at, 1, 10) <= ?");
      binds.push(to);
    }
    const category = str(url.searchParams.get("category"), 30);
    if (category) {
      where.push("e.category = ?");
      binds.push(category);
    }
    const price = url.searchParams.get("price");
    if (price === "free") where.push("e.price_inr = 0");
    if (price === "paid") where.push("e.price_inr > 0");
    const area = str(url.searchParams.get("area"), 60);
    if (area) {
      where.push("e.area = ?");
      binds.push(area);
    }
    const group = str(url.searchParams.get("group"), 60);
    if (group) {
      where.push("g.slug = ?");
      binds.push(group);
    }
    if (url.searchParams.get("beginner") === "1") where.push("e.beginner_friendly = 1");
    const limit = Math.min(int(url.searchParams.get("limit"), 60), 100);
    const { results } = await env.DB.prepare(
      `SELECT ${EVENT_COLS} FROM events e LEFT JOIN groups g ON g.id = e.group_id WHERE ${where.join(" AND ")} ORDER BY e.start_at LIMIT ${limit}`,
    )
      .bind(...binds)
      .all();
    const areas = await env.DB.prepare("SELECT DISTINCT area FROM events WHERE published = 1 AND area != '' ORDER BY area").all<{ area: string }>();
    return json({ events: results.map(withSeats), areas: areas.results.map((a) => a.area) });
  }

  if (method === "GET" && seg[1] === "events" && seg[2] && seg.length === 3) {
    const e = await env.DB.prepare(
      `SELECT ${EVENT_COLS}, e.description, e.address, e.first_timer_note, e.age_note, e.accessibility_note, e.cancellation_terms, e.group_id
       FROM events e LEFT JOIN groups g ON g.id = e.group_id WHERE e.slug = ? AND e.published = 1`,
    )
      .bind(seg[2])
      .first();
    if (!e) return json({ error: "not_found" }, 404);
    const related = e.group_id
      ? (
          await env.DB.prepare(
            `SELECT ${EVENT_COLS} FROM events e LEFT JOIN groups g ON g.id = e.group_id
             WHERE e.group_id = ? AND e.id != ? AND e.published = 1 AND e.status = 'scheduled' AND e.start_at >= ? ORDER BY e.start_at LIMIT 3`,
          )
            .bind(e.group_id, e.id, nowLocal())
            .all()
        ).results.map(withSeats)
      : [];
    return json({ event: withSeats(e), related });
  }

  if (method === "POST" && path === "/api/rsvp") {
    if (rateLimited(`${ip}:form`, 12)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const name = str(body.name, 80);
    const contact = str(body.contact, 120);
    const party = Math.min(Math.max(int(body.party_size, 1), 1), 6);
    const fields: Fields = {};
    checkPerson(name, contact, fields);
    if (Object.keys(fields).length) return invalid(fields);

    const event = await env.DB.prepare("SELECT id, title, status, start_at, capacity, published FROM events WHERE slug = ?").bind(str(body.slug, 80)).first<{
      id: number;
      title: string;
      status: string;
      start_at: string;
      capacity: number;
      published: number;
    }>();
    if (!event || !event.published) return json({ error: "not_found" }, 404);
    if (event.status === "cancelled") return json({ error: "cancelled" }, 410);
    if (event.start_at < nowLocal()) return json({ error: "past" }, 410);

    // Same person, same event: return the booking they already have.
    const existing = await env.DB.prepare("SELECT ref, status, party_size FROM rsvps WHERE event_id = ? AND contact = ? AND status != 'cancelled'")
      .bind(event.id, contact)
      .first<{ ref: string; status: string; party_size: number }>();
    if (existing) return json({ ok: true, ref: existing.ref, status: existing.status, party_size: existing.party_size, repeat: true });

    const ref = randomRef();
    // Capacity is enforced inside one statement, so two people can't take the last seat.
    const res = await env.DB.prepare(
      `INSERT INTO rsvps (event_id, ref, name, contact, party_size, note, status)
       SELECT ?, ?, ?, ?, ?, ?, 'confirmed'
       WHERE (SELECT capacity FROM events WHERE id = ?) = 0
          OR (SELECT COALESCE(SUM(party_size), 0) FROM rsvps WHERE event_id = ? AND status = 'confirmed') + ? <= (SELECT capacity FROM events WHERE id = ?)`,
    )
      .bind(event.id, ref, name, contact, party, str(body.note, 300), event.id, event.id, party, event.id)
      .run();
    if (res.meta.changes === 1) return json({ ok: true, ref, status: "confirmed", party_size: party });

    if (body.waitlist === true) {
      await env.DB.prepare("INSERT INTO rsvps (event_id, ref, name, contact, party_size, note, status) VALUES (?, ?, ?, ?, ?, ?, 'waitlist')")
        .bind(event.id, ref, name, contact, party, str(body.note, 300))
        .run();
      return json({ ok: true, ref, status: "waitlist", party_size: party });
    }
    return json({ error: "sold_out" }, 409);
  }

  // ---------------------------------------------------------------- groups
  if (method === "GET" && path === "/api/groups") {
    const { results } = await env.DB.prepare(
      `SELECT g.slug, g.name, g.tagline, g.interests, g.owner_name, g.owner_role, g.status, g.image, g.is_sample,
        (SELECT json_object('slug', e.slug, 'title', e.title, 'start_at', e.start_at) FROM events e
          WHERE e.group_id = g.id AND e.published = 1 AND e.status = 'scheduled' AND e.start_at >= ? ORDER BY e.start_at LIMIT 1) AS next_event
       FROM groups g WHERE g.published = 1 ORDER BY g.sort, g.name`,
    )
      .bind(nowLocal())
      .all();
    return json({ groups: results.map((g) => ({ ...g, interests: parseList(g.interests), next_event: g.next_event ? JSON.parse(String(g.next_event)) : null })) });
  }

  if (method === "GET" && seg[1] === "groups" && seg[2] && seg.length === 3) {
    const g = await env.DB.prepare("SELECT * FROM groups WHERE slug = ? AND published = 1").bind(seg[2]).first();
    if (!g) return json({ error: "not_found" }, 404);
    const [events, stories] = await env.DB.batch([
      env.DB.prepare(
        `SELECT ${EVENT_COLS} FROM events e LEFT JOIN groups g ON g.id = e.group_id
         WHERE e.group_id = ? AND e.published = 1 AND e.status != 'completed' AND e.start_at >= ? ORDER BY e.start_at LIMIT 6`,
      ).bind(g.id, nowLocal()),
      env.DB.prepare("SELECT slug, title, summary, photos, event_date, is_sample FROM stories WHERE group_id = ? AND status = 'published' ORDER BY event_date DESC LIMIT 3").bind(g.id),
    ]);
    return json({
      group: { ...g, interests: parseList(g.interests) },
      events: events.results.map(withSeats),
      stories: stories.results.map((s) => ({ ...s, photos: parseList(s.photos) })),
    });
  }

  if (method === "POST" && path === "/api/join") {
    if (rateLimited(`${ip}:form`, 12)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const name = str(body.name, 80);
    const contact = str(body.contact, 120);
    const fields: Fields = {};
    checkPerson(name, contact, fields);
    if (Object.keys(fields).length) return invalid(fields);
    const interests = parseList(body.interests).slice(0, 12).map((s) => s.slice(0, 30));
    const group = str(body.group, 60) ? await env.DB.prepare("SELECT id, name FROM groups WHERE slug = ?").bind(str(body.group, 60)).first<{ id: number; name: string }>() : null;
    await env.DB.prepare("INSERT INTO members (name, contact, interests, group_id, updates_ok) VALUES (?, ?, ?, ?, ?)")
      .bind(name, contact, JSON.stringify(interests), group?.id ?? null, body.updates_ok === true ? 1 : 0)
      .run();
    // Recommend one first action: the next event in their group, or matching their interests.
    const next = await env.DB.prepare(
      `SELECT ${EVENT_COLS} FROM events e LEFT JOIN groups g ON g.id = e.group_id
       WHERE e.published = 1 AND e.status = 'scheduled' AND e.start_at >= ? ${group ? "AND e.group_id = ?" : ""}
       ORDER BY e.beginner_friendly DESC, e.start_at LIMIT 3`,
    )
      .bind(...(group ? [nowLocal(), group.id] : [nowLocal()]))
      .all();
    return json({ ok: true, group: group?.name ?? null, suggestions: next.results.map(withSeats) });
  }

  // ---------------------------------------------------------------- Adda
  if (method === "GET" && path === "/api/adda") {
    const { results } = await env.DB.prepare(
      "SELECT id, kind, title, body, category, author_name, poll_options, status, admin_note, closed, is_sample, created_at FROM adda_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 50",
    ).all();
    const votes = await env.DB.prepare("SELECT post_id, option_index, COUNT(*) AS n FROM poll_votes GROUP BY post_id, option_index").all<{ post_id: number; option_index: number; n: number }>();
    return json({
      posts: results.map((p) => {
        const options = parseList(p.poll_options);
        const counts = options.map((_, i) => votes.results.find((v) => v.post_id === p.id && v.option_index === i)?.n ?? 0);
        return { ...p, poll_options: options, votes: counts };
      }),
    });
  }

  if (method === "POST" && path === "/api/adda") {
    if (rateLimited(`${ip}:form`, 12)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const kind = ["question", "idea", "poll", "recommendation"].includes(String(body.kind)) ? String(body.kind) : "";
    const title = str(body.title, 140);
    const options = parseList(body.poll_options).map((o) => o.trim().slice(0, 60)).filter(Boolean).slice(0, 5);
    const fields: Fields = {};
    if (!kind) fields.kind = "Choose what you're posting.";
    if (title.length < 6) fields.title = "Add a short title (at least 6 characters).";
    if (kind === "poll" && options.length < 2) fields.poll_options = "A poll needs at least two options.";
    const contact = str(body.contact, 120);
    if (contact) checkPerson(str(body.name, 80) || "--", contact, fields);
    if (Object.keys(fields).length) return invalid(fields);
    await env.DB.prepare("INSERT INTO adda_posts (kind, title, body, category, author_name, contact, poll_options) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(kind, title, str(body.body, 1000), str(body.category, 30) || "general", str(body.name, 80), contact, JSON.stringify(options))
      .run();
    return json({ ok: true, status: "received" });
  }

  if (method === "POST" && seg[1] === "adda" && seg[3] === "vote") {
    if (rateLimited(`${ip}:vote`, 30)) return json({ error: "rate_limited" }, 429);
    const body = await readJson<{ option?: number }>(request);
    const post = await env.DB.prepare("SELECT id, poll_options, closed FROM adda_posts WHERE id = ? AND published = 1 AND kind = 'poll'").bind(int(seg[2])).first<{
      id: number;
      poll_options: string;
      closed: number;
    }>();
    if (!post) return json({ error: "not_found" }, 404);
    if (post.closed) return json({ error: "closed" }, 410);
    const option = int(body?.option, -1);
    if (option < 0 || option >= parseList(post.poll_options).length) return invalid({ option: "Pick an option." });
    // One vote per device and network; stored only as a hash.
    const voter = await sha256(`${ip}|${request.headers.get("user-agent") ?? ""}|imc-poll`);
    await env.DB.prepare("INSERT OR REPLACE INTO poll_votes (post_id, option_index, voter) VALUES (?, ?, ?)").bind(post.id, option, voter).run();
    return json({ ok: true });
  }

  // ---------------------------------------------------------------- opportunities
  if (method === "GET" && path === "/api/opportunities") {
    const { results } = await env.DB.prepare(
      `SELECT id, title, kind, compensation, eligibility, deadline, description, how_to_apply, posted_by, is_sample
       FROM opportunities WHERE status = 'published' AND (deadline = '' OR deadline >= ?) ORDER BY deadline = '', deadline LIMIT 50`,
    )
      .bind(today())
      .all();
    return json({ opportunities: results });
  }

  if (method === "POST" && path === "/api/opportunities") {
    if (rateLimited(`${ip}:form`, 12)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const fields: Fields = {};
    const title = str(body.title, 140);
    const kind = ["paid", "volunteer", "collab", "internship"].includes(String(body.kind)) ? String(body.kind) : "";
    if (title.length < 6) fields.title = "Add a clear title.";
    if (!kind) fields.kind = "Is it paid, voluntary, a collaboration or an internship?";
    if (!str(body.compensation, 120)) fields.compensation = "Say what it pays, or that it's voluntary.";
    if (!str(body.how_to_apply, 300)) fields.how_to_apply = "Explain how people should apply.";
    checkPerson(str(body.posted_by, 80), str(body.contact, 120), fields);
    if (fields.name) {
      fields.posted_by = fields.name;
      delete fields.name;
    }
    if (Object.keys(fields).length) return invalid(fields);
    await env.DB.prepare(
      "INSERT INTO opportunities (title, kind, compensation, eligibility, deadline, description, how_to_apply, posted_by, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(title, kind, str(body.compensation, 120), str(body.eligibility, 200), str(body.deadline, 10), str(body.description, 1500), str(body.how_to_apply, 300), str(body.posted_by, 80), str(body.contact, 120))
      .run();
    return json({ ok: true, status: "pending" });
  }

  // ---------------------------------------------------------------- stories
  if (method === "GET" && path === "/api/stories") {
    const { results } = await env.DB.prepare(
      "SELECT s.slug, s.title, s.summary, s.photos, s.event_date, s.is_sample, g.name AS group_name FROM stories s LEFT JOIN groups g ON g.id = s.group_id WHERE s.status = 'published' ORDER BY s.event_date DESC LIMIT 60",
    ).all();
    return json({ stories: results.map((s) => ({ ...s, photos: parseList(s.photos) })) });
  }

  if (method === "GET" && seg[1] === "stories" && seg[2] && seg.length === 3) {
    const s = await env.DB.prepare(
      "SELECT s.*, g.slug AS group_slug, g.name AS group_name FROM stories s LEFT JOIN groups g ON g.id = s.group_id WHERE s.slug = ? AND s.status = 'published'",
    )
      .bind(seg[2])
      .first();
    if (!s) return json({ error: "not_found" }, 404);
    const next = await env.DB.prepare(
      `SELECT ${EVENT_COLS} FROM events e LEFT JOIN groups g ON g.id = e.group_id
       WHERE e.published = 1 AND e.status = 'scheduled' AND e.start_at >= ? ${s.group_id ? "AND e.group_id = ?" : ""} ORDER BY e.start_at LIMIT 2`,
    )
      .bind(...(s.group_id ? [nowLocal(), s.group_id] : [nowLocal()]))
      .all();
    return json({ story: { ...s, photos: parseList(s.photos) }, next: next.results.map(withSeats) });
  }

  // ---------------------------------------------------------------- submissions
  if (method === "POST" && path === "/api/submissions") {
    if (rateLimited(`${ip}:form`, 12)) return json({ error: "rate_limited" }, 429);
    const body = await readJson(request);
    if (!body) return json({ error: "bad_request" }, 400);
    if (!(await humanCheck(env, request, body.turnstile, body.website))) return json({ error: "human_check" }, 403);
    const kind = ["event_proposal", "photo_removal", "report"].includes(String(body.kind)) ? String(body.kind) : "";
    const name = str(body.name, 80);
    const contact = str(body.contact, 120);
    const fields: Fields = {};
    if (!kind) return json({ error: "bad_request" }, 400);
    // Reports can be anonymous; everything else needs a way to reply.
    if (kind !== "report") checkPerson(name, contact, fields);
    const details = (body.details && typeof body.details === "object" ? body.details : {}) as Record<string, unknown>;
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(details).slice(0, 15)) clean[k.slice(0, 40)] = str(v, 1500);
    if (kind === "event_proposal" && !clean.event_title) fields.event_title = "What's the event called?";
    if (kind !== "event_proposal" && !(clean.what ?? "").trim()) fields.what = "Tell us what this is about.";
    if (Object.keys(fields).length) return invalid(fields);
    await env.DB.prepare("INSERT INTO submissions (kind, name, contact, details) VALUES (?, ?, ?, ?)").bind(kind, name, contact, JSON.stringify(clean)).run();
    return json({ ok: true, status: "received" });
  }

  return null;
}
