// Cloudflare Worker: serves the site's static files and the guide API.
//   POST /api/guide   { messages: [{role, content}], lang }  →  { answer, meta }
//   GET  /api/health  →  which model and search backend are configured
import { DEFAULT_MODEL, type Env, type ExecutionContext } from "./env";
import { runGuide } from "./agent";
import { MAX_QUESTION, isUnsafe, looksLikeInjection, rateLimited } from "./guardrails";
import type { Message } from "./llm";
import { handleCommunity } from "./community";
import { handleAdmin } from "./admin";
import { withShareMeta } from "./meta";
import { serveMedia } from "./media";

const LANGS = new Set(["en", "te", "ta", "hi"]);
const CACHE_SECONDS = 6 * 60 * 60;

const REFUSALS: Record<string, string> = {
  en: "I can only help with visiting Tirupati and Tirumala. Ask me about darshan, stays, transport or food.",
  te: "నేను తిరుపతి, తిరుమల యాత్ర గురించి మాత్రమే సహాయం చేయగలను. దర్శనం, బస, రవాణా లేదా భోజనం గురించి అడగండి.",
  ta: "திருப்பதி, திருமலைப் பயணம் பற்றி மட்டுமே என்னால் உதவ முடியும். தரிசனம், தங்குமிடம், போக்குவரத்து அல்லது உணவு பற்றிக் கேளுங்கள்.",
  hi: "मैं केवल तिरुपति और तिरुमला यात्रा में मदद कर सकता हूँ। दर्शन, ठहरने, परिवहन या भोजन के बारे में पूछें।",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}

function refusal(lang: string) {
  return json({ answer: { title: REFUSALS[lang] ?? REFUSALS.en, points: [], sources: [], suggestions: [], outOfScope: true }, meta: { tools: [], verified: true } });
}

async function handleGuide(request: Request, env: Env, ctx: ExecutionContext) {
  if (request.method !== "POST") return json({ error: "method" }, 405);
  const ip = request.headers.get("cf-connecting-ip") ?? "anon";
  if (rateLimited(ip)) return json({ error: "rate_limited" }, 429);

  let body: { messages?: { role?: string; content?: string }[]; lang?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const lang = LANGS.has(body.lang ?? "") ? (body.lang as string) : "en";
  const history: Message[] = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-6)
    .map((m) => ({ role: m.role as "user" | "assistant", content: (m.content as string).slice(0, 800) }));
  const question = [...history].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
  if (!question) return json({ error: "empty" }, 400);
  if (question.length > MAX_QUESTION) return json({ error: "too_long" }, 413);

  // Input guardrails.
  if (looksLikeInjection(question)) return refusal(lang);
  if (await isUnsafe(env, question)) return refusal(lang);

  // First questions are cached for a few hours so popular questions cost nothing.
  const cacheable = history.filter((m) => m.role === "user").length === 1 && request.headers.get("x-guide-no-cache") !== "1";
  const cacheKey = new Request(`https://guide-cache.internal/${lang}/${encodeURIComponent(question.toLowerCase().replace(/\s+/g, " "))}`);
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  if (cacheable) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const data = (await hit.json()) as { answer: unknown; meta: Record<string, unknown> };
      return json({ ...data, meta: { ...data.meta, cached: true } });
    }
  }

  try {
    const result = await runGuide(env, history, lang);
    const payload = { answer: result.answer, meta: { tools: result.tools, verified: result.verified, model: env.GUIDE_MODEL || DEFAULT_MODEL } };
    if (cacheable && !result.answer.outOfScope) {
      ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(payload), { headers: { "cache-control": `max-age=${CACHE_SECONDS}` } })));
    }
    return json(payload);
  } catch (err) {
    // The site falls back to IMC's curated answers when the agent can't ground a reply.
    console.error("guide failed", err instanceof Error ? err.message : err);
    return json({ error: "unavailable" }, 503);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/guide") return handleGuide(request, env, ctx);
    if (pathname.startsWith("/media/")) return serveMedia(request, env, ctx, pathname.slice(7));
    if (pathname === "/api/health") return json({ ok: true, model: env.GUIDE_MODEL || DEFAULT_MODEL, search: env.TAVILY_API_KEY ? "tavily" : "wikipedia" });
    try {
      if (pathname.startsWith("/api/admin/")) return await handleAdmin(request, env, pathname);
      if (pathname.startsWith("/api/")) return (await handleCommunity(request, env, pathname)) ?? json({ error: "not_found" }, 404);
    } catch (err) {
      console.error("api error", pathname, err instanceof Error ? err.message : err);
      return json({ error: "server_error" }, 500);
    }
    // Event, community and story pages get real share previews.
    const share = pathname.match(/^\/(events|communities|stories)\/([a-z0-9-]+)\/?$/);
    if (share) return withShareMeta(request, env, share[1], share[2]);
    return env.ASSETS.fetch(request);
  },
};
