// IMC's event "tickets" and the dealt-out deck on the home page: posters fan out from a stack as
// the section scrolls into view; swipe, drag, tap or use the arrows to bring one to the front,
// and the front ticket opens its event. Motion stays off for people who ask for reduced motion.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Link, navigate } from "../lib/router";
import { useT } from "../lib/i18n";
import { formatTime, formatWhen, imageUrl, priceLabel, type EventItem } from "../lib/api";
import { POSTER_STYLES } from "../content/community";
import { Availability, SampleBadge } from "./kit";

/** A poster styled as an event ticket: photo on top, a tear-off stub with date and price. */
/** `notch` is the page colour behind the ticket, so the perforation notches look cut out. */
export function EventTicket({ e, className = "", style, asLink = true, notch = "bg-cream" }: { e: EventItem; className?: string; style?: CSSProperties; asLink?: boolean; notch?: string }) {
  const t = useT();
  const p = POSTER_STYLES[e.category] ?? POSTER_STYLES.meetups;
  const stamp = e.status === "cancelled" ? t("Cancelled") : e.seats_left === 0 ? t("Sold out") : "";
  const body = (
    <>
      <div className="relative h-[62%] overflow-hidden">
        <img src={imageUrl(e.image)} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.bg} 4%, transparent 55%)` }} />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">{p.emoji} {e.group_name ?? "IMC"}</span>
          {e.is_sample === 1 && <SampleBadge />}
        </div>
        <p className="absolute inset-x-3 bottom-2 font-display text-[1.45rem] font-extrabold uppercase leading-[0.95] tracking-tight" style={{ color: p.fg }}>{e.title}</p>
        {stamp && (
          <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-md border-[3px] border-red-600 bg-white/85 px-3 py-1 font-display text-xl font-extrabold uppercase tracking-widest text-red-600">
            {stamp}
          </span>
        )}
      </div>
      {/* Perforation between poster and stub. */}
      <div className="relative h-0">
        <span className={`absolute -left-3 -top-3 h-6 w-6 rounded-full ${notch}`} />
        <span className={`absolute -right-3 -top-3 h-6 w-6 rounded-full ${notch}`} />
        <span className="absolute inset-x-4 top-0 border-t-2 border-dashed" style={{ borderColor: `${p.fg}55` }} />
      </div>
      <div className="flex h-[38%] items-center gap-3 px-4" style={{ color: p.fg }}>
        <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-white py-1 text-ink shadow">
          <span className="text-[10px] font-bold uppercase text-brand">{formatWhen(e.start_at, { month: "short" })}</span>
          <span className="font-display text-xl font-extrabold leading-none">{formatWhen(e.start_at, { day: "numeric" })}</span>
          <span className="text-[10px] font-semibold uppercase text-muted">{formatWhen(e.start_at, { weekday: "short" })}</span>
        </span>
        <span className="min-w-0 flex-1 text-xs leading-snug">
          <span className="block truncate opacity-85">{formatTime(e.start_at)} · {e.venue}</span>
          <span className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 font-bold" style={{ background: p.accent, color: p.bg }}>{t(priceLabel(e))}</span>
        </span>
      </div>
    </>
  );
  const cls = `relative block overflow-hidden rounded-[22px] text-left shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10 ${className}`;
  const bg = { background: p.bg, ...style };
  return asLink ? (
    <Link to={`/events/${e.slug}`} className={cls} style={bg} draggable={false}>
      {body}
    </Link>
  ) : (
    <div className={cls} style={bg}>
      {body}
    </div>
  );
}

function useWidth() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1200 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

export function PosterDeck({ events }: { events: EventItem[] }) {
  const t = useT();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.35 });
  const [dealt, setDealt] = useState(false);
  // The first deal is staggered card by card; after that every move is immediate.
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragged = useRef(false);
  const width = useWidth();
  const n = events.length;

  useEffect(() => {
    if (!inView || dealt) return;
    setDealt(true);
    const id = setTimeout(() => setSettled(true), 1200);
    return () => clearTimeout(id);
  }, [inView, dealt]);
  useEffect(() => setActive(0), [events]);
  // Gentle auto-advance while the deck is on screen and nobody is touching it.
  useEffect(() => {
    if (reduce || !inView || paused || n < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 4500);
    return () => clearInterval(id);
  }, [reduce, inView, paused, n]);

  const spread = width >= 1024 ? 165 : width >= 640 ? 120 : 62;
  const cardW = width >= 640 ? 250 : 218;
  const cardH = Math.round(cardW * 1.42);
  const go = (d: number) => setActive((a) => (a + d + n) % n);
  const current = events[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div ref={ref} className="relative mx-auto overflow-hidden" style={{ height: cardH + 70 }} role="group" aria-roledescription="carousel" aria-label={t("Upcoming events")}>
        {events.map((e, i) => {
          // Distance from the front card, wrapped so the deck is balanced on both sides.
          let d = i - active;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const hidden = Math.abs(d) > 3;
          const target = dealt
            ? { x: d * spread, y: Math.abs(d) * 16, rotate: d * 6, scale: 1 - Math.abs(d) * 0.07, opacity: hidden ? 0 : 1 }
            : { x: 0, y: 60, rotate: i % 2 ? -5 : 5, scale: 0.9, opacity: 0 };
          return (
            <motion.div
              key={e.slug}
              className="absolute left-1/2 top-4 touch-pan-y"
              style={{ width: cardW, height: cardH, marginLeft: -cardW / 2, zIndex: 50 - Math.abs(d) }}
              initial={false}
              animate={target}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 22, delay: settled ? 0 : i * 0.07 }}
              drag={d === 0 && !reduce ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
                setTimeout(() => (dragged.current = false), 0);
              }}
              onClickCapture={(ev) => {
                // Side cards come to the front; the front card opens its event.
                if (dragged.current || d !== 0) {
                  ev.preventDefault();
                  ev.stopPropagation();
                  if (d !== 0) setActive(i);
                }
              }}
              aria-hidden={hidden}
            >
              <EventTicket e={e} className="h-full w-full" />
            </motion.div>
          );
        })}
      </div>

      {current && (
        <div className="mx-auto mt-2 flex max-w-xl flex-col items-center text-center" aria-live="polite">
          <div className="flex items-center gap-3">
            <button onClick={() => go(-1)} aria-label={t("Previous event")} className="grid h-11 w-11 place-items-center rounded-full bg-white ring-1 ring-line transition hover:ring-brand/40"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-1.5" aria-hidden="true">
              {events.map((e, i) => <span key={e.slug} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-brand" : "w-1.5 bg-ink/20"}`} />)}
            </div>
            <button onClick={() => go(1)} aria-label={t("Next event")} className="grid h-11 w-11 place-items-center rounded-full bg-white ring-1 ring-line transition hover:ring-brand/40"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <p className="mt-4 font-display text-xl font-extrabold">{current.title}</p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {formatWhen(current.start_at)} · {formatTime(current.start_at)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {current.venue}</span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Availability e={current} />
            <button onClick={() => navigate(`/events/${current.slug}`)} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              {current.status === "cancelled" || current.seats_left === 0 ? t("Details") : current.price_inr > 0 ? t("Book your spot") : t("Save my spot")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">{t("Swipe or drag the cards. Tap one to bring it forward.")}</p>
        </div>
      )}
    </div>
  );
}
