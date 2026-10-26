// Share previews: event, community and story pages are a single-page app, so WhatsApp and
// Instagram would only see the generic site title. For those URLs the Worker fills in the
// page title, description and image from the database before returning index.html.
import type { Env } from "./env";

declare class HTMLRewriter {
  on(selector: string, handlers: { element?(el: { setAttribute(name: string, value: string): void; setInnerContent(content: string): void }): void }): HTMLRewriter;
  transform(response: Response): Response;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1741003412854-bd4b264c4af3?auto=format&fit=crop&w=1200&h=630&q=80";

const QUERIES: Record<string, string> = {
  events: "SELECT title, summary AS description, image, start_at, venue, is_sample FROM events WHERE slug = ? AND published = 1",
  communities: "SELECT name AS title, tagline AS description, image, is_sample FROM groups WHERE slug = ? AND published = 1",
  stories: "SELECT title, summary AS description, photos AS image, is_sample FROM stories WHERE slug = ? AND status = 'published'",
};

export async function withShareMeta(request: Request, env: Env, kind: string, slug: string): Promise<Response> {
  const page = await env.ASSETS.fetch(request);
  const sql = QUERIES[kind];
  if (!sql || !slug || request.method !== "GET") return page;
  const row = await env.DB.prepare(sql).bind(slug).first<Record<string, string | number>>().catch(() => null);
  if (!row) return page;

  let description = String(row.description ?? "");
  if (row.start_at) {
    const when = new Date(`${row.start_at}:00+05:30`).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
    description = `${when} · ${row.venue}. ${description}`;
  }
  if (Number(row.is_sample)) description = `Sample listing. ${description}`;
  const image = typeof row.image === "string" && row.image.startsWith("http") ? row.image : DEFAULT_IMAGE;
  const title = `${row.title} | IMC Tirupati`;

  const meta = (name: string, attr: "name" | "property") => ({
    element(el: { setAttribute(n: string, v: string): void }) {
      el.setAttribute("content", name.endsWith("image") ? image : name.endsWith("title") ? title : description);
      void attr;
    },
  });
  return new HTMLRewriter()
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[name="description"]', meta("description", "name"))
    .on('meta[property="og:title"]', meta("og:title", "property"))
    .on('meta[property="og:description"]', meta("og:description", "property"))
    .on('meta[property="og:image"]', meta("og:image", "property"))
    .on('meta[name="twitter:title"]', meta("twitter:title", "name"))
    .on('meta[name="twitter:description"]', meta("twitter:description", "name"))
    .transform(page);
}
