// Photos uploaded from the admin live in the MEDIA KV namespace and are served at /media/<key>.
// Keys are random and never reused, so responses can be cached for a year at the edge.
import type { Env, ExecutionContext } from "./env";

const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export const MAX_UPLOAD = 4 * 1024 * 1024;

export async function storeMedia(env: Env, body: ArrayBuffer, type: string): Promise<string | null> {
  const ext = TYPES[type];
  if (!ext || body.byteLength === 0 || body.byteLength > MAX_UPLOAD) return null;
  const key = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}.${ext}`;
  await env.MEDIA.put(key, body, { metadata: { type } });
  return key;
}

export async function serveMedia(request: Request, env: Env, ctx: ExecutionContext, key: string): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  if (!/^[\w-]+\/[a-f0-9]{16}\.(webp|jpg|png)$/.test(key)) return new Response("Not found", { status: 404 });
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  const { value, metadata } = await env.MEDIA.getWithMetadata<{ type?: string }>(key, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  const res = new Response(value, {
    headers: { "content-type": metadata?.type ?? "image/webp", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
  ctx.waitUntil(cache.put(request, res.clone()));
  return res;
}
