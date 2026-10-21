// Guardrails around the guide agent: before (input), and after (output) the model.
import { GUARD_MODEL, type Env } from "./env";
import type { Evidence } from "./tools";

export const MAX_QUESTION = 500;

// Cheap first line of defence against prompt injection and role-play attempts.
const INJECTION = /(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+)?(previous|above|prior|earlier)\s+(instructions|rules|prompts?)|system\s*prompt|developer\s*mode|jailbreak|you\s+are\s+now\s+|act\s+as\s+(an?\s+)?(unfiltered|dan)|reveal\s+(your\s+)?(prompt|instructions)/i;

export function looksLikeInjection(text: string) {
  return INJECTION.test(text);
}

// Llama Guard 3 screens the visitor's message for unsafe content.
export async function isUnsafe(env: Env, text: string): Promise<boolean> {
  try {
    const r = (await env.AI.run(GUARD_MODEL, { messages: [{ role: "user", content: text }] })) as { response?: unknown } | string;
    const resp = typeof r === "string" ? r : r.response;
    if (resp && typeof resp === "object" && "safe" in resp) return (resp as { safe: boolean }).safe === false;
    return typeof resp === "string" && /\bunsafe\b/i.test(resp);
  } catch {
    return false; // Never block a visitor because the screen itself failed.
  }
}

// Every number in an answer (prices, phone numbers, distances, times) must
// appear in the evidence; otherwise the point is dropped. This stops the model
// from inventing figures even if the fact checker misses one.
export function numbersSupported(point: string, evidence: Evidence[]): boolean {
  const corpus = evidence.map((e) => `${e.title} ${e.text}`).join(" ").replace(/,/g, "");
  const nums = point.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) ?? [];
  return nums.every((n) => n.length < 2 || corpus.includes(n));
}

export function clean(text: string, max = 360) {
  const t = text
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*|__|`|^#+\s*/g, "")
    // Evidence labels like "(Source: E1)" or "[E2, E3]" belong in the sources list, not the text.
    .replace(/\s*[([]\s*(?:sources?\s*:?\s*)?E\d+(?:\s*,\s*E\d+)*\s*[)\]]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  // Trim at a sentence end rather than mid-word.
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("। "));
  return end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

// Simple per-isolate rate limit: enough to stop runaway loops and scripted abuse.
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimited(key: string, limit = 20, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  h.n++;
  return h.n > limit;
}
