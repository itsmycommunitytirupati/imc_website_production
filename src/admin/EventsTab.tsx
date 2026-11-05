// Admin → Events: a month calendar to pick dates, and a composer that turns a photo, a few lines
// and a date into a published event. Paid events take payment through PhonePe automatically
// whenever payments are switched on (worker/payments.ts); free events take RSVPs.
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, IndianRupee, Plus, Sparkles, Upload, X } from "lucide-react";
import { ApiError, api, formatTime, formatWhen, imageUrl, istToday, uploadImage, useApi, type EventItem } from "../lib/api";
import { EventTicket } from "../site/PosterDeck";
import { uploadError } from "./photoFields";
import { usePublicLink } from "../site/kit";

type Row = Record<string, unknown> & { id: number };

const CATEGORIES = [
  ["meetups", "Meetup"],
  ["music", "Music"],
  ["nature", "Nature outing"],
  ["culture", "Culture & creativity"],
  ["food", "Food walk"],
  ["sports", "Sports & fitness"],
  ["startup", "Startups & careers"],
] as const;

// A community's interests suggest the event category, so most events need no extra choice.
const CATEGORY_FOR: Record<string, string> = { music: "music", sports: "sports", cycling: "sports", wellness: "sports", nature: "nature", food: "food", startups: "startup", careers: "startup", art: "culture", culture: "culture", creators: "culture", photography: "culture", books: "culture", dance: "culture" };

const DEFAULT_TERMS = "If IMC cancels, you choose IMC credit or a full refund.";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (n: number) => String(n).padStart(2, "0");

export default function EventsTab({ onChange }: { onChange?: () => void }) {
  const events = useApi<{ rows: Row[] }>("/api/admin/events");
  const groups = useApi<{ rows: Row[] }>("/api/admin/groups");
  const config = useApi<{ payments: boolean }>("/api/config");
  const [month, setMonth] = useState(() => istToday().slice(0, 7));
  const [editing, setEditing] = useState<{ row: Row | null; date?: string } | null>(null);
  const [toast, setToast] = useState("");
  const publicLink = usePublicLink();

  const byDay = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of events.data?.rows ?? []) {
      const day = String(r.start_at).slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), r].sort((a, b) => String(a.start_at).localeCompare(String(b.start_at))));
    }
    return map;
  }, [events.data]);

  const today = istToday();
  const upcoming = (events.data?.rows ?? []).filter((r) => String(r.start_at).slice(0, 10) >= today).sort((a, b) => String(a.start_at).localeCompare(String(b.start_at)));
  const saved = (msg: string) => {
    setEditing(null);
    events.reload();
    onChange?.();
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Events</h1>
          <p className="mt-1 max-w-2xl text-muted">Pick a date on the calendar, add a photo and a few lines, and publish. Paid events take payment through PhonePe automatically; free events take RSVPs.</p>
        </div>
        <button onClick={() => setEditing({ row: null })} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add event
        </button>
      </div>
      <PaymentBanner on={config.data?.payments} />

      <Calendar month={month} setMonth={setMonth} byDay={byDay} today={today} onDay={(date) => setEditing({ row: null, date })} onEvent={(row) => setEditing({ row })} />

      <h2 className="mt-10 font-display text-xl font-extrabold">Coming up</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
        {events.loading ? (
          <p className="p-6 text-muted">Loading…</p>
        ) : !upcoming.length ? (
          <p className="p-6 text-muted">No upcoming events. Pick a date above to add one.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-stone-50 text-left text-muted">
              <tr>{["Event", "When", "Price", "Booked", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {upcoming.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{String(r.title)} {Number(r.is_sample) === 1 && <Tag tone="amber">Sample</Tag>}</td>
                  <td className="px-4 py-3">{formatWhen(String(r.start_at))}, {formatTime(String(r.start_at))}</td>
                  <td className="px-4 py-3">{Number(r.price_inr) > 0 ? `₹${r.price_inr}` : "Free"}</td>
                  <td className="px-4 py-3">{String(r.booked ?? 0)}{Number(r.capacity) ? ` / ${r.capacity}` : ""}</td>
                  <td className="px-4 py-3">
                    <Tag tone={r.status === "cancelled" ? "red" : Number(r.published) ? "green" : "stone"}>{r.status === "cancelled" ? "cancelled" : Number(r.published) ? "published" : "draft"}</Tag>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <a href={publicLink(`/events/${r.slug}`)} target="_blank" rel="noopener noreferrer" className="mr-2 inline-flex rounded-lg p-1.5 text-muted hover:bg-stone-100" aria-label="View on site"><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => setEditing({ row: r })} className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-brand/50 hover:text-brand">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Composer
          row={editing.row}
          date={editing.date}
          groups={groups.data?.rows ?? []}
          areas={[...new Set((events.data?.rows ?? []).map((r) => String(r.area)).filter(Boolean))].sort()}
          payments={Boolean(config.data?.payments)}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </>
  );
}

function Tag({ tone, children }: { tone: "green" | "amber" | "red" | "stone"; children: ReactNode }) {
  const cls = { green: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-700", stone: "bg-stone-100 text-stone-700" }[tone];
  return <span className={`ml-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

function PaymentBanner({ on }: { on?: boolean }) {
  if (on === undefined) return null;
  return (
    <p className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${on ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
      <IndianRupee className="mt-0.5 h-4 w-4 shrink-0" />
      {on
        ? "PhonePe is connected: any event with a price takes payment online, and bookings confirm automatically once paid."
        : "PhonePe isn't connected yet: people RSVP to paid events and pay at the venue. As soon as it's connected, every paid event takes payment online, with no change needed here."}
    </p>
  );
}

/* ------------------------------------------------------------------ calendar */

function Calendar({ month, setMonth, byDay, today, onDay, onEvent }: { month: string; setMonth: (m: string) => void; byDay: Map<string, Row[]>; today: string; onDay: (date: string) => void; onEvent: (r: Row) => void }) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  const shift = (d: number) => {
    const dt = new Date(Date.UTC(y, m - 1 + d, 1));
    setMonth(`${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}`);
  };
  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-lg p-2 hover:bg-stone-100"><ChevronLeft className="h-5 w-5" /></button>
        <p className="font-display text-lg font-extrabold">{first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
        <button onClick={() => shift(1)} aria-label="Next month" className="rounded-lg p-2 hover:bg-stone-100"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
        {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) =>
          date ? (
            <div key={date} className={`group min-h-[92px] rounded-lg border p-1.5 text-left ${date === today ? "border-brand" : "border-line"} ${date < today ? "bg-stone-50" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${date === today ? "text-brand" : date < today ? "text-muted" : ""}`}>{Number(date.slice(8))}</span>
                {date >= today && (
                  <button onClick={() => onDay(date)} aria-label={`Add event on ${date}`} className="rounded p-0.5 text-muted opacity-60 hover:bg-brand-soft hover:text-brand group-hover:opacity-100">
                    <CalendarPlus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {(byDay.get(date) ?? []).slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onEvent(r)}
                    className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium ${r.status === "cancelled" ? "bg-red-50 text-red-700 line-through" : Number(r.published) ? "bg-brand-soft text-brand-dark" : "bg-stone-100 text-stone-600"}`}
                    title={String(r.title)}
                  >
                    {String(r.start_at).slice(11, 16)} {String(r.title)}
                  </button>
                ))}
                {(byDay.get(date)?.length ?? 0) > 3 && <p className="text-[11px] text-muted">+{(byDay.get(date)?.length ?? 0) - 3} more</p>}
              </div>
            </div>
          ) : (
            <div key={`x${i}`} />
          ),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ composer */

interface Draft {
  image: string;
  title: string;
  description: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  area: string;
  address: string;
  group_id: string;
  category: string;
  price_inr: string;
  capacity: string;
  beginner_friendly: boolean;
  summary: string;
  organizer_name: string;
  first_timer_note: string;
  age_note: string;
  accessibility_note: string;
  cancellation_terms: string;
  is_sample: boolean;
}

function toDraft(row: Row | null, date?: string): Draft {
  const s = String(row?.start_at ?? "");
  const e = String(row?.end_at ?? "");
  return {
    image: String(row?.image ?? ""),
    title: String(row?.title ?? ""),
    description: String(row?.description ?? ""),
    date: s.slice(0, 10) || date || "",
    start: s.slice(11, 16) || "18:00",
    end: e.slice(11, 16) || "",
    venue: String(row?.venue ?? ""),
    area: String(row?.area ?? ""),
    address: String(row?.address ?? ""),
    group_id: row?.group_id ? String(row.group_id) : "",
    category: String(row?.category ?? "meetups"),
    price_inr: row ? String(row.price_inr ?? 0) : "0",
    capacity: row ? String(row.capacity ?? 0) : "30",
    beginner_friendly: row ? Number(row.beginner_friendly) === 1 : true,
    summary: String(row?.summary ?? ""),
    organizer_name: String(row?.organizer_name ?? ""),
    first_timer_note: String(row?.first_timer_note ?? ""),
    age_note: String(row?.age_note ?? ""),
    accessibility_note: String(row?.accessibility_note ?? ""),
    cancellation_terms: String(row?.cancellation_terms ?? DEFAULT_TERMS),
    is_sample: Number(row?.is_sample) === 1,
  };
}

const firstSentence = (text: string) => (text.split(/(?<=[.!?])\s/)[0] ?? "").trim().slice(0, 140);

function Composer({ row, date, groups, areas, payments, onClose, onSaved }: { row: Row | null; date?: string; groups: Row[]; areas: string[]; payments: boolean; onClose: () => void; onSaved: (msg: string) => void }) {
  const [d, setD] = useState<Draft>(() => toDraft(row, date));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<"" | "publish" | "draft" | "cancel">("");
  const [more, setMore] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const group = groups.find((g) => String(g.id) === d.group_id);

  // Picking a community suggests the category and host name.
  const pickGroup = (id: string) => {
    const g = groups.find((x) => String(x.id) === id);
    let interests: string[] = [];
    try {
      interests = JSON.parse(String(g?.interests ?? "[]"));
    } catch {
      interests = [];
    }
    const cat = interests.map((i) => CATEGORY_FOR[i]).find(Boolean);
    setD((x) => ({ ...x, group_id: id, category: cat ?? x.category }));
  };

  const preview: EventItem = {
    id: 0,
    slug: "preview",
    title: d.title || "Your event title",
    category: d.category,
    summary: d.summary || firstSentence(d.description),
    start_at: `${d.date || istToday()}T${d.start || "18:00"}`,
    end_at: d.end ? `${d.date}T${d.end}` : "",
    venue: d.venue || "Venue",
    area: d.area,
    price_inr: Number(d.price_inr) || 0,
    price_note: "",
    capacity: Number(d.capacity) || 0,
    organizer_name: d.organizer_name,
    image: d.image,
    beginner_friendly: d.beginner_friendly ? 1 : 0,
    status: "scheduled",
    is_sample: d.is_sample ? 1 : 0,
    group_slug: group ? String(group.slug) : null,
    group_name: group ? String(group.name) : null,
    seats_left: Number(d.capacity) || null,
  };

  const save = async (mode: "publish" | "draft" | "cancel") => {
    const errs: Record<string, string> = {};
    if (d.title.trim().length < 3) errs.title = "Give the event a name.";
    if (!d.date) errs.date = "Pick a date.";
    if (!d.start) errs.start = "Pick a start time.";
    if (d.end && d.end <= d.start) errs.end = "Ends before it starts.";
    if (!d.venue.trim()) errs.venue = "Where is it?";
    if (mode === "publish" && !d.image) errs.image = "Add a photo so the event card looks right.";
    if (Number(d.price_inr) < 0) errs.price_inr = "Price can't be negative.";
    setErrors(errs);
    if (Object.keys(errs).length && mode !== "cancel") return;
    setBusy(mode);
    setFormError("");
    const body = {
      title: d.title.trim(),
      description: d.description.trim(),
      summary: (d.summary || firstSentence(d.description)).trim(),
      start_at: `${d.date}T${d.start}`,
      end_at: d.end ? `${d.date}T${d.end}` : "",
      venue: d.venue.trim(),
      area: d.area.trim(),
      address: d.address.trim(),
      group_id: d.group_id ? Number(d.group_id) : null,
      category: d.category,
      price_inr: Math.round(Number(d.price_inr) || 0),
      price_note: row ? String(row.price_note ?? "") : "",
      capacity: Math.max(0, Math.round(Number(d.capacity) || 0)),
      organizer_name: d.organizer_name.trim() || (group ? String(group.name) : "IMC Tirupati"),
      image: d.image,
      beginner_friendly: d.beginner_friendly ? 1 : 0,
      first_timer_note: d.first_timer_note.trim(),
      age_note: d.age_note.trim(),
      accessibility_note: d.accessibility_note.trim(),
      cancellation_terms: d.cancellation_terms.trim(),
      is_sample: d.is_sample ? 1 : 0,
      published: mode === "draft" ? 0 : 1,
      status: mode === "cancel" ? "cancelled" : row?.status === "cancelled" ? "cancelled" : "scheduled",
    };
    try {
      if (row) await api(`/api/admin/events/${row.id}`, { method: "PUT", body: JSON.stringify(body) });
      else await api("/api/admin/events", { method: "POST", body: JSON.stringify(body) });
      if (mode === "cancel" && Number(row?.price_inr) > 0 && confirm("Event cancelled. Email everyone who paid a one-tap choice of IMC credit or a refund?")) {
        await api(`/api/admin/events/${row!.id}/notify-payers`, { method: "POST", body: "{}" }).catch(() => null);
      }
      onSaved(mode === "publish" ? (row ? "Event updated" : "Event published") : mode === "draft" ? "Saved as draft" : "Event cancelled");
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      setFormError(err.code === "invalid" ? "Please fix the highlighted fields." : `Couldn't save (${err.code}).`);
      setBusy("");
    }
  };

  const input = "mt-1 w-full rounded-lg border border-line px-3 py-2";
  const err = (k: string) => (errors[k] ? <span className="mt-1 block text-xs text-red-700">{errors[k]}</span> : null);
  const paid = Number(d.price_inr) > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <form
        onSubmit={(ev: FormEvent) => {
          ev.preventDefault();
          save("publish");
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="font-display text-xl font-extrabold">{row ? "Edit event" : "New event"}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-stone-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 gap-8 overflow-y-auto p-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <PhotoDrop value={d.image} onChange={(v) => set("image", v)} error={errors.image} />
            <label className="block">
              <span className="text-sm font-semibold">Event name</span>
              <input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Sunday sketch walk at Swarnamukhi" className={`${input} text-lg font-semibold`} />
              {err("title")}
            </label>
            <label className="block">
              <span className="text-sm font-semibold">What happens</span>
              <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="A few lines: what people will do, what to bring, who it's for." className={input} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold">Date</span>
                <input type="date" value={d.date} min={row ? undefined : istToday()} onChange={(e) => set("date", e.target.value)} className={input} />
                {err("date")}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Starts</span>
                <input type="time" value={d.start} onChange={(e) => set("start", e.target.value)} className={input} />
                {err("start")}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Ends (optional)</span>
                <input type="time" value={d.end} onChange={(e) => set("end", e.target.value)} className={input} />
                {err("end")}
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Venue</span>
                <input value={d.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Banyan Courtyard Café" className={input} />
                {err("venue")}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Area</span>
                <input list="imc-areas" value={d.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Tilak Road" className={input} />
                <datalist id="imc-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Community</span>
                <select value={d.group_id} onChange={(e) => pickGroup(e.target.value)} className={input}>
                  <option value="">IMC (no specific community)</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{String(g.name)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Type</span>
                <select value={d.category} onChange={(e) => set("category", e.target.value)} className={input}>
                  {CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Price per person (₹)</span>
                <input type="number" min={0} step={1} value={d.price_inr} onChange={(e) => set("price_inr", e.target.value)} className={input} />
                <span className="mt-1 block text-xs text-muted">0 = free. {paid ? (payments ? "Paid online with PhonePe when people book." : "People RSVP and pay at the venue until PhonePe is connected.") : "People RSVP for free."}</span>
                {err("price_inr")}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Seats</span>
                <input type="number" min={0} step={1} value={d.capacity} onChange={(e) => set("capacity", e.target.value)} className={input} />
                <span className="mt-1 block text-xs text-muted">0 = no limit. Bookings stop when it's full.</span>
              </label>
            </div>
            <label className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm">
              <input type="checkbox" checked={d.beginner_friendly} onChange={(e) => set("beginner_friendly", e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
              <span><Sparkles className="mr-1 inline h-4 w-4 text-emerald-700" /> Good for first-timers ("Solo No More" badge)</span>
            </label>

            <button type="button" onClick={() => setMore((m) => !m)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand" aria-expanded={more}>
              <ChevronDown className={`h-4 w-4 transition ${more ? "rotate-180" : ""}`} /> More details (optional)
            </button>
            {more && (
              <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
                <Field label="One-line summary" hint="Shown on cards. Left empty, the first sentence of 'What happens' is used." wide>
                  <input value={d.summary} onChange={(e) => set("summary", e.target.value)} className={input} />
                </Field>
                <Field label="Full address" wide>
                  <input value={d.address} onChange={(e) => set("address", e.target.value)} className={input} />
                </Field>
                <Field label="Host shown on the page" hint="Defaults to the community name.">
                  <input value={d.organizer_name} onChange={(e) => set("organizer_name", e.target.value)} className={input} />
                </Field>
                <Field label="Age">
                  <input value={d.age_note} onChange={(e) => set("age_note", e.target.value)} placeholder="e.g. All ages; under-12s with an adult" className={input} />
                </Field>
                <Field label="Note for first-timers" wide>
                  <input value={d.first_timer_note} onChange={(e) => set("first_timer_note", e.target.value)} placeholder="e.g. A host meets you at the entrance." className={input} />
                </Field>
                <Field label="Accessibility" wide>
                  <input value={d.accessibility_note} onChange={(e) => set("accessibility_note", e.target.value)} placeholder="e.g. Ground floor, step-free entry" className={input} />
                </Field>
                <Field label="Cancellation terms" wide>
                  <input value={d.cancellation_terms} onChange={(e) => set("cancellation_terms", e.target.value)} className={input} />
                </Field>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={d.is_sample} onChange={(e) => set("is_sample", e.target.checked)} className="h-4 w-4 accent-brand" />
                  Sample listing (shows a Sample badge; untick for a real event)
                </label>
              </div>
            )}
          </div>

          <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Preview</p>
            <div className="rounded-2xl bg-cream p-4">
              <EventTicket e={preview} asLink={false} className="mx-auto h-[350px] w-[246px]" />
            </div>
            <p className="text-xs text-muted">
              {formatWhen(preview.start_at, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(preview.start_at)}
              {preview.end_at ? `–${formatTime(preview.end_at)}` : ""} · {paid ? `₹${d.price_inr}` : "Free"}
              {Number(d.capacity) ? ` · ${d.capacity} seats` : ""}
            </p>
            {row && <p className="text-xs text-muted">{String(row.booked ?? 0)} booked so far.</p>}
          </aside>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4">
          {formError && <p className="mr-auto text-sm text-red-700">{formError}</p>}
          {row && row.status !== "cancelled" && (
            <button type="button" disabled={Boolean(busy)} onClick={() => confirm(`Cancel "${d.title}"? People who booked will see it as cancelled.`) && save("cancel")} className="mr-auto rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
              {busy === "cancel" ? "Cancelling…" : "Cancel event"}
            </button>
          )}
          <button type="button" disabled={Boolean(busy)} onClick={() => save("draft")} className="rounded-lg px-4 py-2 font-semibold ring-1 ring-line">{busy === "draft" ? "Saving…" : "Save as draft"}</button>
          <button type="submit" disabled={Boolean(busy)} className="rounded-lg bg-brand px-5 py-2 font-semibold text-white disabled:opacity-60">{busy === "publish" ? "Publishing…" : row ? "Save and publish" : "Publish event"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Big drop zone for the cover photo: drag a file in, or click to choose. */
function PhotoDrop({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => setMsg(error ?? ""), [error]);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg("That isn't a photo.");
    setBusy(true);
    setMsg("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setMsg(uploadError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => {
        upload(e.target.files?.[0]);
        e.target.value = "";
      }} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${over ? "border-brand bg-brand-soft" : "border-line bg-stone-50 hover:border-brand/50"}`}
      >
        {value ? (
          <>
            <img src={imageUrl(value)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold shadow"><Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Change photo"}</span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 text-muted">
            <ImagePlus className="h-8 w-8" />
            <span className="font-semibold text-ink">{busy ? "Uploading…" : "Add a cover photo"}</span>
            <span className="text-xs">Drag it here or click. Phone photos are fine; they're resized for the web.</span>
          </span>
        )}
      </button>
      {msg && <p className="mt-1 text-xs text-red-700">{msg}</p>}
    </div>
  );
}
