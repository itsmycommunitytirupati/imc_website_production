// Client for the Worker's community API (worker/community.ts).
import { useCallback, useEffect, useState } from "react";
import { IMC_PHOTOS } from "../content/photos";

export interface EventItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  start_at: string;
  end_at: string;
  venue: string;
  area: string;
  price_inr: number;
  price_note: string;
  capacity: number;
  organizer_name: string;
  image: string;
  beginner_friendly: number;
  status: "scheduled" | "cancelled" | "completed";
  is_sample: number;
  group_slug: string | null;
  group_name: string | null;
  seats_left: number | null;
  // detail only
  description?: string;
  address?: string;
  first_timer_note?: string;
  age_note?: string;
  accessibility_note?: string;
  cancellation_terms?: string;
}

export interface GroupItem {
  id?: number;
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  interests: string[];
  owner_name: string;
  owner_role: string;
  status: "active" | "forming" | "paused";
  image: string;
  joining_note?: string;
  is_sample: number;
  next_event?: { slug: string; title: string; start_at: string } | null;
}

export interface StoryItem {
  slug: string;
  title: string;
  summary: string;
  body?: string;
  photos: string[];
  event_date: string;
  is_sample: number;
  group_name?: string | null;
  group_slug?: string | null;
}

export interface Opportunity {
  id: number;
  title: string;
  kind: "paid" | "volunteer" | "collab" | "internship";
  compensation: string;
  eligibility: string;
  deadline: string;
  description: string;
  how_to_apply: string;
  posted_by: string;
  is_sample: number;
}

export interface AddaPost {
  id: number;
  kind: "question" | "idea" | "poll" | "recommendation";
  title: string;
  body: string;
  category: string;
  author_name: string;
  poll_options: string[];
  votes: number[];
  status: string;
  admin_note: string;
  closed: number;
  is_sample: number;
  created_at: string;
}

export interface GalleryPhoto {
  id: number;
  image: string;
  caption: string;
  alt: string;
  taken_on: string;
  group_slug: string | null;
  group_name: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  kind: "core" | "captain" | "host" | "volunteer";
  photo: string;
  bio: string;
  instagram: string;
  group_slug: string | null;
  group_name: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields: Record<string, string> = {},
  ) {
    super(code);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  } catch {
    throw new ApiError(0, "offline");
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(res.status, String(data.error ?? "error"), (data.fields as Record<string, string>) ?? {});
  return data as T;
}

export const post = <T>(path: string, body: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(body) });

/** Loads JSON with loading and error states; `reload` retries. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: ApiError | null }>({ data: null, loading: Boolean(path), error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api<T>(path)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error: ApiError) => alive && setState({ data: null, loading: false, error }));
    return () => {
      alive = false;
    };
  }, [path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

// Team portraits bundled with the site (assets/team, made by scripts/import-team.mjs).
const TEAM_FILES = import.meta.glob("../../assets/team/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

/** Database image values: "photo:<IMC photo key>", "team:<slug>", "media:<uploaded key>" or a full URL. */
export function imageUrl(value: string | undefined | null, fallback = IMC_PHOTOS.meetup) {
  if (!value) return fallback;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  if (value.startsWith("media:")) return `/media/${value.slice(6)}`;
  if (value.startsWith("team:")) return TEAM_FILES[`../../assets/team/${value.slice(5)}.webp`] ?? fallback;
  const key = value.replace(/^photo:/, "") as keyof typeof IMC_PHOTOS;
  return IMC_PHOTOS[key] ?? fallback;
}

export function photoUrl(key: string) {
  return imageUrl(key.includes(":") || key.startsWith("http") ? key : `photo:${key}`);
}

/** Shrinks a photo in the browser (longest side `max`, WebP) so uploads stay small. */
export async function shrinkImage(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // Browsers without WebP encoding fall back to JPEG.
  if (blob && blob.type === "image/webp") return blob;
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", quality));
}

/** Uploads a photo through the admin API; returns the value to store (e.g. "media:2026-10/abc.webp"). */
export async function uploadImage(file: File): Promise<string> {
  const blob = await shrinkImage(file);
  const res = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": blob.type }, body: blob });
  const data = (await res.json().catch(() => ({}))) as { image?: string; error?: string };
  if (!res.ok || !data.image) throw new ApiError(res.status, data.error ?? "upload_failed");
  return data.image;
}

// Dates are stored as Tirupati local time ("YYYY-MM-DDTHH:MM").
export function eventDate(iso: string) {
  return new Date(`${iso}:00+05:30`);
}

export function formatWhen(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return eventDate(iso).toLocaleDateString("en-IN", { ...opts, timeZone: "Asia/Kolkata" });
}

export function formatTime(iso: string) {
  return eventDate(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

export function priceLabel(e: Pick<EventItem, "price_inr">) {
  return e.price_inr > 0 ? `₹${e.price_inr.toLocaleString("en-IN")}` : "Free";
}

/** Tirupati "today" and date helpers for filters. */
export function istToday() {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
export function addDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function weekendRange() {
  const today = istToday();
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat
  if (dow === 0) return { from: today, to: today };
  const sat = addDays(today, (6 - dow + 7) % 7);
  return { from: dow === 6 ? today : sat, to: addDays(sat, 1) };
}
