// Small helpers shared by the community and admin APIs.
import type { Env } from "./env";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export type Fields = Record<string, string>;

/** 422 with field-level messages, so forms can show errors next to each field. */
export function invalid(fields: Fields) {
  return json({ error: "invalid", fields }, 422);
}

export async function readJson<T = Record<string, unknown>>(request: Request, max = 20_000): Promise<T | null> {
  const text = await request.text();
  if (text.length > max) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const int = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

const PHONE = /^(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

/** A name and one way to reach the person (Indian mobile or email); nothing else is required. */
export function checkPerson(name: string, contact: string, fields: Fields) {
  if (name.length < 2) fields.name = "Please tell us your name.";
  if (!PHONE.test(contact) && !EMAIL.test(contact)) fields.contact = "Enter a 10-digit mobile number or an email address.";
}

export function today() {
  // Tirupati date (IST) as YYYY-MM-DD.
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export function nowLocal() {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 16);
}

/** Cloudflare Turnstile. Until a secret is configured, forms rely on the honeypot and rate limits. */
export async function humanCheck(env: Env, request: Request, token: unknown, honeypot: unknown) {
  if (typeof honeypot === "string" && honeypot.trim()) return false;
  if (!env.TURNSTILE_SECRET) return true;
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function randomRef(prefix = "IMC") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}
