// Tools the guide agent can call. Every result becomes numbered evidence
// ([E1], [E2]…) that the answer must cite and the fact checker verifies against.
import type { Env } from "./env";
import { filterPlaces, searchChunks, type Chunk } from "./kb";

export interface Evidence {
  id: string;
  title: string;
  text: string;
  url: string;
  label: string;
  kind: "imc" | "official" | "directory" | "web";
}

// Only these sites may be fetched directly, so the agent can't be steered to arbitrary URLs.
const OFFICIAL_HOSTS = [
  "tirumala.org",
  "www.tirumala.org",
  "tirupatibalaji.ap.gov.in",
  "ttdevasthanams.ap.gov.in",
  "apsrtconline.in",
  "www.apsrtconline.in",
  "tourism.ap.gov.in",
  "irctctourism.com",
  "www.irctctourism.com",
];

export const TOOL_NAMES = ["search_local_guide", "search_places", "web_search", "fetch_official_page"] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

type Item = Omit<Evidence, "id">;

function fromChunk(c: Chunk): Item {
  return { title: c.title, text: c.text, url: c.source.url, label: c.source.label, kind: c.kind };
}

export async function runTool(env: Env, name: ToolName, args: Record<string, unknown>): Promise<Item[]> {
  const str = (k: string) => (typeof args[k] === "string" ? (args[k] as string).slice(0, 200) : "");
  switch (name) {
    case "search_local_guide":
      return searchChunks(str("query")).map(fromChunk);
    case "search_places":
      return filterPlaces(str("kind"), str("budget") || undefined).map(fromChunk);
    case "web_search":
      return webSearch(env, str("query"));
    case "fetch_official_page":
      return fetchOfficial(str("url"));
  }
}

async function webSearch(env: Env, raw: string): Promise<Item[]> {
  if (!raw) return [];
  // Keep searches about Tirupati even if the model forgets to say so.
  const query = /tirupati|tirumala/i.test(raw) ? raw : `${raw} Tirupati`;
  if (env.TAVILY_API_KEY) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.TAVILY_API_KEY}` },
      body: JSON.stringify({ query, search_depth: "basic", max_results: 5, include_answer: false }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { results?: { title: string; url: string; content: string }[] };
      return (data.results ?? []).map((r) => ({ title: r.title, text: r.content.slice(0, 1200), url: r.url, label: hostOf(r.url), kind: "web" as const }));
    }
  }
  return wikipedia(query);
}

// No-key fallback: Wikipedia is reliable for places, history and distances, not for prices.
async function wikipedia(query: string): Promise<Item[]> {
  const headers = { "user-agent": "IMC-Tirupati-Guide/1.0 (https://imctirupati.com)" };
  const search = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=3&srsearch=${encodeURIComponent(query)}`,
    { headers, signal: AbortSignal.timeout(6000) },
  );
  if (!search.ok) return [];
  const hits = ((await search.json()) as { query?: { search?: { pageid: number; title: string }[] } }).query?.search ?? [];
  if (!hits.length) return [];
  const ids = hits.map((h) => h.pageid).join("|");
  const ex = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&format=json&pageids=${ids}`,
    { headers, signal: AbortSignal.timeout(6000) },
  );
  if (!ex.ok) return [];
  const pages = ((await ex.json()) as { query?: { pages?: Record<string, { title: string; extract?: string }> } }).query?.pages ?? {};
  return Object.values(pages)
    .filter((p) => p.extract)
    .map((p) => ({
      title: p.title,
      text: p.extract!.slice(0, 1200),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
      label: "Wikipedia",
      kind: "web" as const,
    }));
}

async function fetchOfficial(url: string): Promise<Item[]> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [];
  }
  if (parsed.protocol !== "https:" || !OFFICIAL_HOSTS.includes(parsed.hostname)) return [];
  const res = await fetch(parsed.toString(), { headers: { "user-agent": "IMC-Tirupati-Guide/1.0" }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
  return text ? [{ title: `Official page: ${parsed.hostname}${parsed.pathname}`, text, url: parsed.toString(), label: "Official TTD / government page", kind: "official" }] : [];
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}
