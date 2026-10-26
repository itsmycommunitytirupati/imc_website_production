import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { addDays, istToday, useApi, weekendRange, type EventItem } from "../lib/api";
import { track } from "../lib/analytics";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, EventCard, LoadingCards } from "./kit";

export const EVENT_CATEGORIES = [
  { id: "meetups", label: "Meetups", emoji: "☕" },
  { id: "music", label: "Music", emoji: "🎸" },
  { id: "nature", label: "Nature outings", emoji: "⛰️" },
  { id: "culture", label: "Culture & creativity", emoji: "🎨" },
  { id: "food", label: "Food walks", emoji: "🥞" },
  { id: "sports", label: "Sports & fitness", emoji: "🏃" },
  { id: "startup", label: "Startups & careers", emoji: "💡" },
];

type When = "any" | "today" | "weekend" | "date";
interface Filters {
  when: When;
  date: string;
  category: string;
  price: "" | "free" | "paid";
  area: string;
  beginner: boolean;
}

function readFilters(): Filters {
  const q = new URLSearchParams(window.location.search);
  const when = q.get("when");
  const price = q.get("price");
  return {
    when: when === "today" || when === "weekend" || when === "date" ? when : "any",
    date: q.get("date") ?? "",
    category: q.get("category") ?? q.get("c") ?? "",
    price: price === "free" || price === "paid" ? price : "",
    area: q.get("area") ?? "",
    beginner: q.get("beginner") === "1",
  };
}

function toQuery(f: Filters) {
  const q = new URLSearchParams();
  if (f.when !== "any") q.set("when", f.when);
  if (f.when === "date" && f.date) q.set("date", f.date);
  if (f.category) q.set("category", f.category);
  if (f.price) q.set("price", f.price);
  if (f.area) q.set("area", f.area);
  if (f.beginner) q.set("beginner", "1");
  return q;
}

function apiQuery(f: Filters) {
  const q = new URLSearchParams();
  const today = istToday();
  if (f.when === "today") q.set("from", today), q.set("to", today);
  if (f.when === "weekend") {
    const w = weekendRange();
    q.set("from", w.from);
    q.set("to", w.to);
  }
  if (f.when === "date" && f.date) q.set("from", f.date), q.set("to", f.date);
  if (f.category) q.set("category", f.category);
  if (f.price) q.set("price", f.price);
  if (f.area) q.set("area", f.area);
  if (f.beginner) q.set("beginner", "1");
  q.set("limit", "60");
  return q.toString();
}

export default function EventsPage() {
  usePageTitle("Events in Tirupati | IMC Tirupati", "Meetups, music, treks, food walks and more in Tirupati. Filter by date, category, price and area, and RSVP in a minute.");
  const t = useT();
  const [f, setF] = useState<Filters>(readFilters);
  const [showMore, setShowMore] = useState(false);
  const { data, loading, error, reload } = useApi<{ events: EventItem[]; areas: string[] }>(`/api/events?${apiQuery(f)}`);

  useEffect(() => track("view_event_list"), []);
  // Filters live in the address so a filtered list can be shared.
  useEffect(() => {
    const qs = toQuery(f).toString();
    window.history.replaceState({}, "", `/events${qs ? `?${qs}` : ""}`);
  }, [f]);

  const update = (patch: Partial<Filters>) => {
    setF((prev) => {
      const next = { ...prev, ...patch };
      track("filter_events", { when: next.when, category: next.category || "all", price: next.price || "any", beginner: next.beginner });
      return next;
    });
  };
  const active = f.when !== "any" || f.category || f.price || f.area || f.beginner;

  const groups = useMemo(() => {
    const today = istToday();
    const week = addDays(today, 7);
    const out: { title: string; items: EventItem[] }[] = [
      { title: "This week", items: [] },
      { title: "Next week", items: [] },
      { title: "Later", items: [] },
    ];
    for (const e of data?.events ?? []) {
      const d = e.start_at.slice(0, 10);
      out[d < week ? 0 : d < addDays(week, 7) ? 1 : 2].items.push(e);
    }
    return out.filter((g) => g.items.length);
  }, [data]);

  const chip = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-brand/40"}`;

  return (
    <>
      <PageHero eyebrow={t("Events")} title={t("Weekend vachindhi. Excuses enduku?")} sub={t("Meetups, music, treks and food walks around Tirupati. Most people come alone the first time.")} image={IMC_PHOTOS.danceCrowd3} />

      <div className="sticky top-16 z-30 border-b border-line bg-cream/95 backdrop-blur md:top-20">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4" aria-label={t("When")}>
            {([["any", "Any day"], ["today", "Today"], ["weekend", "This weekend"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => update({ when: id })} className={chip(f.when === id)} aria-pressed={f.when === id}>{t(label)}</button>
            ))}
            <label className={`${chip(f.when === "date")} inline-flex items-center gap-2`}>
              <span>{t("Pick a date")}</span>
              <input type="date" min={istToday()} value={f.date} onChange={(e) => update({ when: e.target.value ? "date" : "any", date: e.target.value })} className="w-[8.5rem] bg-transparent text-sm outline-none" aria-label={t("Pick a date")} />
            </label>
            <button onClick={() => setShowMore((s) => !s)} className={`${chip(showMore)} inline-flex items-center gap-1.5`} aria-expanded={showMore}>
              <SlidersHorizontal className="h-4 w-4" /> {t("More filters")}
            </button>
            {active && (
              <button onClick={() => setF({ when: "any", date: "", category: "", price: "", area: "", beginner: false })} className="inline-flex shrink-0 items-center gap-1 px-2 text-sm font-semibold text-brand">
                <X className="h-4 w-4" /> {t("Clear")}
              </button>
            )}
          </div>
          {showMore && (
            <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-3">
              <select value={f.price} onChange={(e) => update({ price: e.target.value as Filters["price"] })} className="rounded-xl border border-line bg-white px-3 py-2.5" aria-label={t("Price")}>
                <option value="">{t("Free or paid")}</option>
                <option value="free">{t("Free only")}</option>
                <option value="paid">{t("Paid")}</option>
              </select>
              <select value={f.area} onChange={(e) => update({ area: e.target.value })} className="rounded-xl border border-line bg-white px-3 py-2.5" aria-label={t("Area")}>
                <option value="">{t("Anywhere in Tirupati")}</option>
                {(data?.areas ?? (f.area ? [f.area] : [])).map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                <input type="checkbox" checked={f.beginner} onChange={(e) => update({ beginner: e.target.checked })} className="h-4 w-4 accent-brand" />
                <span className="text-sm font-medium">🤝 {t("Good for first-timers")}</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2" aria-label={t("Category")}>
          <button onClick={() => update({ category: "" })} className={chip(!f.category)} aria-pressed={!f.category}>✨ {t("All")}</button>
          {EVENT_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => update({ category: c.id })} className={chip(f.category === c.id)} aria-pressed={f.category === c.id}>
              {c.emoji} {t(c.label)}
            </button>
          ))}
        </div>

        <div className="mt-8" aria-live="polite">
          {loading ? (
            <LoadingCards count={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : !groups.length ? (
            <EmptyState
              title={active ? t("Nothing matches those filters.") : undefined}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  {active && <button onClick={() => setF({ when: "any", date: "", category: "", price: "", area: "", beginner: false })} className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white">{t("Clear filters")}</button>}
                  <Link to="/opportunities#propose" className="rounded-full px-5 py-2.5 font-semibold text-brand ring-1 ring-brand/40">{t("Propose an event")}</Link>
                </div>
              }
            />
          ) : (
            groups.map((g) => (
              <div key={g.title} className="mb-12">
                <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-extrabold">
                  {t(g.title)} <span className="rounded-full bg-white px-2.5 py-0.5 text-sm text-muted ring-1 ring-line">{g.items.length}</span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((e) => <EventCard key={e.slug} e={e} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
