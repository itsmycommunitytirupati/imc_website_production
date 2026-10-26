// Shared building blocks for the community pages: states, forms, cards and sharing.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, Bookmark, CalendarDays, Clock, MapPin, RefreshCw, Share2, Sparkles, Users } from "lucide-react";
import { Link } from "../lib/router";
import { useSaved } from "../lib/site";
import { useT } from "../lib/i18n";
import { ApiError, api, formatTime, formatWhen, imageUrl, priceLabel, type EventItem, type GroupItem, type Opportunity, type StoryItem } from "../lib/api";
import { logoFor } from "../content/logos";
import { GopuramIcon } from "./ui";
import { track } from "../lib/analytics";

// ------------------------------------------------------------------ badges and states

export function SampleBadge({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-300 ${className}`} title={t("Sample content shown for representation. Real listings are added by IMC.")}>
      {t("Sample")}
    </span>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-line bg-white">
          <div className="aspect-[16/10] bg-stone-200" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 rounded bg-stone-200" />
            <div className="h-5 w-3/4 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError | null; onRetry?: () => void }) {
  const t = useT();
  const offline = error?.code === "offline";
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
      <p className="mt-3 font-semibold">{offline ? t("You seem to be offline.") : t("Something went wrong loading this.")}</p>
      <p className="mt-1 text-sm text-muted">{t("Please try again in a moment.")}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand">
          <RefreshCw className="h-4 w-4" /> {t("Try again")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, action }: { title?: string; action?: ReactNode }) {
  const t = useT();
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
      <p className="font-display text-xl font-bold">{title ?? t("Scene konchem silent ga undhi.")}</p>
      <p className="mt-1 text-muted">{t("Help us make the next one happen.")}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ forms

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  };
  // Keeps what people typed on any error, and maps server field errors to the right inputs.
  const submit = async <R,>(fn: (v: T) => Promise<R>, messages: Record<string, string> = {}): Promise<R | null> => {
    setSubmitting(true);
    setFormError("");
    setErrorCode("");
    try {
      const result = await fn(values);
      setErrors({});
      return result;
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(0, "offline");
      setErrors(err.fields);
      setErrorCode(err.code);
      setFormError(messages[err.code] ?? (err.code === "invalid" ? "" : err.code === "rate_limited" ? "Too many tries. Please wait a few minutes." : err.code === "offline" ? "You seem to be offline. Your details are still here; try again." : "Something went wrong. Your details are still here; please try again."));
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  return { values, set, errors, formError, errorCode, submitting, submit, setValues };
}

const inputCls = (error?: string) =>
  `mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-2 focus:ring-brand/25 ${error ? "border-red-400" : "border-line focus:border-brand"}`;

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-red-700" role="alert">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ label, error, hint, ...props }: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      <input {...props} aria-invalid={Boolean(error)} className={inputCls(error)} />
    </Field>
  );
}

export function TextArea({ label, error, hint, ...props }: { label: string; error?: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea {...props} aria-invalid={Boolean(error)} className={`${inputCls(error)} min-h-28`} />
    </Field>
  );
}

/** Hidden field bots fill in and people never see. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

let configPromise: Promise<{ turnstileSiteKey: string }> | null = null;
declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
  }
}

/** Cloudflare Turnstile, shown only once IMC configures a site key. */
export function HumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [siteKey, setSiteKey] = useState("");
  useEffect(() => {
    configPromise ??= api<{ turnstileSiteKey: string }>("/api/config").catch(() => ({ turnstileSiteKey: "" }));
    configPromise.then((c) => setSiteKey(c.turnstileSiteKey));
  }, []);
  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let id = "";
    const render = () => {
      if (window.turnstile && ref.current) id = window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
    return () => {
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey, onToken]);
  return siteKey ? <div ref={ref} className="min-h-[65px]" /> : null;
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  const t = useT();
  return (
    <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto">
      {busy ? t("Sending…") : children}
    </button>
  );
}

// ------------------------------------------------------------------ sharing

export function ShareButton({ title, path, kind }: { title: string; path: string; kind: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    track("share_event", { kind, path });
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, "_blank", "noopener");
    }
  };
  return (
    <button onClick={share} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-brand/40">
      <Share2 className="h-4 w-4" /> {copied ? t("Link copied") : t("Share")}
    </button>
  );
}

// ------------------------------------------------------------------ cards

export function Availability({ e }: { e: EventItem }) {
  const t = useT();
  if (e.status === "cancelled") return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{t("Cancelled")}</span>;
  if (e.seats_left === 0) return <span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-bold text-stone-700">{t("Sold out")}</span>;
  if (e.seats_left !== null && e.seats_left <= 5) return <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">{e.seats_left} {t("spots left")}</span>;
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">{t("Open")}</span>;
}

export function EventCard({ e }: { e: EventItem }) {
  const t = useT();
  const [saved, toggle] = useSaved();
  const isSaved = saved.includes(e.slug);
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${e.status === "cancelled" ? "opacity-75" : ""}`}>
      <div className="relative overflow-hidden">
        <img src={imageUrl(e.image)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 inline-flex flex-col items-center rounded-xl bg-white px-2.5 py-1.5 text-center leading-none shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{formatWhen(e.start_at, { month: "short" })}</span>
          <span className="font-display text-2xl font-extrabold">{formatWhen(e.start_at, { day: "numeric" })}</span>
          <span className="text-[10px] font-semibold uppercase text-muted">{formatWhen(e.start_at, { weekday: "short" })}</span>
        </span>
        <button
          onClick={() => toggle(e.slug)}
          className={`absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full shadow-md transition active:scale-90 ${isSaved ? "bg-brand text-white" : "bg-white/95 text-ink"}`}
          aria-pressed={isSaved}
          aria-label={`${isSaved ? t("Remove from saved") : t("Save")}: ${e.title}`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <Availability e={e} />
          {e.beginner_friendly === 1 && <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink">🤝 {t("Solo No More")}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand">{e.group_name ?? e.organizer_name}</p>
          {e.is_sample === 1 && <SampleBadge />}
        </div>
        <h3 className="mt-1 font-display text-xl font-extrabold leading-snug tracking-tight">
          <Link to={`/events/${e.slug}`} className="after:absolute after:inset-0 after:content-['']">{e.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{e.summary}</p>
        <div className="mt-4 space-y-1.5 text-sm">
          <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-ink/40" /> {formatWhen(e.start_at)} · {formatTime(e.start_at)}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink/40" /> <span className="truncate">{e.venue}</span></p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-lg font-extrabold">{t(priceLabel(e))}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">{t("Details")} <ArrowRight className="h-4 w-4" /></span>
        </div>
      </div>
    </article>
  );
}

const STATUS_LABEL: Record<string, string> = { active: "Active", forming: "Forming", paused: "Paused" };

export function GroupLogo({ slug, image, className = "" }: { slug: string; image: string; className?: string }) {
  const logo = logoFor(slug);
  if (logo && !logo.banner) return <img src={logo.url} alt="" loading="lazy" className={`object-contain ${className}`} />;
  return <img src={logo?.url ?? imageUrl(image)} alt="" loading="lazy" className={`object-cover ${className}`} />;
}

export function GroupCard({ g }: { g: GroupItem }) {
  const t = useT();
  const logo = logoFor(g.slug);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative aspect-[4/3] overflow-hidden ${logo && !logo.banner ? "bg-stone-50" : "bg-ink"}`}>
        <GroupLogo slug={g.slug} image={g.image} className={`h-full w-full transition duration-700 group-hover:scale-105 ${logo && !logo.banner ? "p-3" : ""}`} />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm">● {t(STATUS_LABEL[g.status] ?? g.status)}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-extrabold leading-snug">
            <Link to={`/communities/${g.slug}`} className="after:absolute after:inset-0 after:content-['']">{g.name}</Link>
          </h3>
          {g.is_sample === 1 && <SampleBadge />}
        </div>
        <p className="mt-1 text-sm text-muted">{g.tagline}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Users className="h-3.5 w-3.5" /> {g.owner_name} · {g.owner_role}</p>
        <div className="mt-auto pt-4">
          {g.next_event ? (
            <p className="rounded-xl bg-brand-soft px-3 py-2 text-xs">
              <span className="font-semibold text-brand">{t("Next")}:</span> {g.next_event.title} · {formatWhen(g.next_event.start_at)}
            </p>
          ) : (
            <p className="rounded-xl bg-stone-100 px-3 py-2 text-xs text-muted">{t("Next meetup being planned")}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function StoryCard({ s }: { s: StoryItem }) {
  const t = useT();
  const [cover, ...rest] = s.photos;
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-ink text-white shadow-sm">
      <img src={imageUrl(cover ? `photo:${cover}` : "")} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2 text-xs text-white/70">
          {s.group_name && <span>{s.group_name}</span>}
          <span>· {formatWhen(`${s.event_date}T12:00`, { day: "numeric", month: "short", year: "numeric" })}</span>
          {s.is_sample === 1 && <SampleBadge />}
        </div>
        <h3 className="mt-1 font-display text-xl font-extrabold leading-snug">
          <Link to={`/stories/${s.slug}`} className="after:absolute after:inset-0 after:content-['']">{s.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/75">{s.summary}</p>
        {rest.length > 0 && <p className="mt-2 text-xs text-white/60">+{rest.length} {t("photos")}</p>}
      </div>
    </article>
  );
}

const KIND_STYLE: Record<Opportunity["kind"], string> = {
  paid: "bg-emerald-100 text-emerald-800",
  volunteer: "bg-sky-100 text-sky-800",
  collab: "bg-violet-100 text-violet-800",
  internship: "bg-amber-100 text-amber-800",
};
const KIND_LABEL: Record<Opportunity["kind"], string> = { paid: "Paid", volunteer: "Voluntary", collab: "Collaboration", internship: "Internship" };

export function OpportunityCard({ o }: { o: Opportunity }) {
  const t = useT();
  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${KIND_STYLE[o.kind]}`}>{t(KIND_LABEL[o.kind])}</span>
        {o.is_sample === 1 && <SampleBadge />}
      </div>
      <h3 className="mt-3 font-display text-lg font-extrabold leading-snug">{o.title}</h3>
      <p className="mt-1 text-xs text-muted">{t("Posted by")} {o.posted_by}</p>
      <p className="mt-3 flex-1 text-sm text-ink/80">{o.description}</p>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">{t("Compensation")}</dt><dd className="font-semibold">{o.compensation}</dd></div>
        {o.eligibility && <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">{t("Who can apply")}</dt><dd>{o.eligibility}</dd></div>}
        {o.deadline && <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted">{t("Deadline")}</dt><dd className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatWhen(`${o.deadline}T12:00`, { day: "numeric", month: "short", year: "numeric" })}</dd></div>}
      </dl>
      <p className="mt-4 rounded-xl bg-brand-soft px-3 py-2 text-sm"><span className="font-semibold text-brand">{t("How to apply")}:</span> {o.how_to_apply}</p>
    </article>
  );
}

export function SectionTitle({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="font-hand text-2xl text-brand">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function SoloNoMore({ note }: { note?: string }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="flex items-center gap-2 font-semibold text-emerald-900"><Sparkles className="h-4 w-4" /> {t("Solo No More: good for first-timers")}</p>
      {note && <p className="mt-1 text-sm text-emerald-900/80">{note}</p>}
    </div>
  );
}

export function NotFound() {
  const t = useT();
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <GopuramIcon className="mx-auto h-16 w-16 text-brand" />
      <p className="mt-6 font-display text-7xl font-extrabold tracking-tighter text-brand">404</p>
      <h1 className="mt-6 font-display text-2xl font-bold">{t("This page took a different ghat road.")}</h1>
      <p className="mt-2 text-muted">{t("Let's get you back on the right path.")}</p>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-brand">{t("Back home")}</Link>
    </section>
  );
}
