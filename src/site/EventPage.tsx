import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, CalendarPlus, CheckCircle2, Clock, Hourglass, IndianRupee, MapPin, ShieldCheck, Ticket, Users, XCircle } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { eventDate, formatTime, formatWhen, imageUrl, post, priceLabel, useApi, type EventItem } from "../lib/api";
import { track } from "../lib/analytics";
import { Availability, ErrorState, NotFound, EventCard, Honeypot, HumanCheck, SampleBadge, ShareButton, SoloNoMore, SubmitButton, TextArea, TextInput, useForm } from "./kit";

interface RsvpResult {
  ok: true;
  ref: string;
  status: "confirmed" | "waitlist";
  party_size: number;
  repeat?: boolean;
}

export default function EventPage({ slug }: { slug: string }) {
  const t = useT();
  const { data, loading, error, reload } = useApi<{ event: EventItem; related: EventItem[] }>(`/api/events/${slug}`);
  const e = data?.event;
  usePageTitle(e ? `${e.title} | IMC Tirupati` : "Event | IMC Tirupati", e?.summary);
  useEffect(() => {
    if (e) track("view_event_detail", { event: e.slug, category: e.category, sample: e.is_sample === 1 });
  }, [e]);

  if (loading) return <div className="mx-auto h-[70vh] max-w-7xl animate-pulse px-4 py-10 sm:px-6"><div className="h-72 rounded-3xl bg-stone-200" /></div>;
  if (error?.status === 404) return <NotFound />;
  if (error || !e) return <div className="mx-auto max-w-xl px-4 py-20"><ErrorState error={error} onRetry={reload} /></div>;

  const past = eventDate(e.end_at || e.start_at) < new Date();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address || e.area}`)}`;

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={imageUrl(e.image)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("All events")}</Link>
          <div className="mt-16 flex flex-wrap items-center gap-2 md:mt-24">
            <Availability e={e} />
            {e.beginner_friendly === 1 && <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink">🤝 {t("Solo No More")}</span>}
            {e.is_sample === 1 && <SampleBadge />}
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">{e.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">{e.summary}</p>
          {e.group_slug ? (
            <Link to={`/communities/${e.group_slug}`} className="mt-4 inline-block text-sm font-semibold text-turmeric underline-offset-4 hover:underline">{t("By")} {e.group_name}</Link>
          ) : (
            <p className="mt-4 text-sm font-semibold text-turmeric">{t("By")} {e.organizer_name}</p>
          )}
        </div>
      </section>

      {e.is_sample === 1 && (
        <p className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
          {t("This is a sample listing to show how events will look. RSVPs are recorded for testing only.")}
        </p>
      )}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:py-14">
        <div className="min-w-0">
          <dl className="grid gap-4 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2">
            <Info icon={<Clock />} label={t("When")}>
              {formatWhen(e.start_at, { weekday: "long", day: "numeric", month: "long" })}
              <span className="block text-sm text-muted">{formatTime(e.start_at)}{e.end_at ? ` – ${formatTime(e.end_at)}` : ""}</span>
            </Info>
            <Info icon={<MapPin />} label={t("Where")}>
              {e.venue}
              <span className="block text-sm text-muted">{e.address || e.area}</span>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">{t("Open in Maps")}</a>
            </Info>
            <Info icon={<IndianRupee />} label={t("Price")}>
              {t(priceLabel(e))}
              {e.price_note && <span className="block text-sm text-muted">{e.price_note}</span>}
            </Info>
            <Info icon={<Users />} label={t("Spots")}>
              {e.capacity ? (e.seats_left === 0 ? t("Full; join the waitlist") : `${e.seats_left} / ${e.capacity} ${t("spots left")}`) : t("Open to all")}
              <span className="block text-sm text-muted">{t("Hosted by")} {e.organizer_name}</span>
            </Info>
          </dl>

          <h2 className="mt-10 font-display text-2xl font-extrabold">{t("What to expect")}</h2>
          <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-ink/85">{e.description}</p>

          {e.beginner_friendly === 1 && <div className="mt-6"><SoloNoMore note={e.first_timer_note} /></div>}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {e.age_note && <Note title={t("Age")}>{e.age_note}</Note>}
            {e.accessibility_note && <Note title={t("Accessibility")}>{e.accessibility_note}</Note>}
            {e.cancellation_terms && <Note title={t("Cancellation")}>{e.cancellation_terms}</Note>}
            <Note title={t("Your details")}>{t("Only the host sees your name and number, for this event. We never show attendee lists.")}</Note>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ShareButton title={e.title} path={`/events/${e.slug}`} kind="event" />
            <button onClick={() => downloadIcs(e)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-brand/40">
              <CalendarPlus className="h-4 w-4" /> {t("Add to calendar")}
            </button>
            <Link to={`/report?type=report&about=${encodeURIComponent(`Event: ${e.title}`)}`} className="inline-flex items-center px-2 text-sm text-muted underline-offset-4 hover:underline">{t("Report this listing")}</Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start" id="rsvp">
          {e.status === "cancelled" ? (
            <Closed icon={<XCircle className="h-8 w-8 text-red-600" />} title={t("This event is cancelled")} text={t("Sorry about that. Here are other things happening soon.")} cta={t("See other events")} />
          ) : past ? (
            <Closed icon={<Hourglass className="h-8 w-8 text-muted" />} title={t("This event has ended")} text={t("RSVPs are closed. Catch the next one.")} cta={t("See upcoming events")} />
          ) : (
            <RsvpForm e={e} />
          )}
        </aside>
      </div>

      {data.related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <h2 className="font-display text-2xl font-extrabold">{t("You might also like")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((r) => <EventCard key={r.slug} e={r} />)}
          </div>
        </section>
      )}
    </>
  );
}

function Info({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
        <dd className="mt-0.5 font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

function Closed({ icon, title, text, cta }: { icon: ReactNode; title: string; text: string; cta: string }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 text-center shadow-sm">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-3 font-display text-xl font-extrabold">{title}</p>
      <p className="mt-1 text-muted">{text}</p>
      <Link to="/events" className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-brand">{cta}</Link>
    </div>
  );
}

function RsvpForm({ e }: { e: EventItem }) {
  const t = useT();
  const soldOut = e.seats_left === 0;
  const form = useForm({ name: "", contact: "", party_size: 1, note: "", website: "" });
  const [token, setToken] = useState("");
  const [result, setResult] = useState<RsvpResult | null>(null);
  const [fullNow, setFullNow] = useState(false);
  const started = useRef(false);
  const waitlist = soldOut || fullNow;

  const onFocus = () => {
    if (started.current) return;
    started.current = true;
    track("start_registration", { event: e.slug });
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit(
      (v) => post<RsvpResult>("/api/rsvp", { ...v, slug: e.slug, waitlist, turnstile: token }),
      {
        sold_out: "The last spots just went. You can join the waitlist instead.",
        cancelled: "This event was just cancelled.",
        past: "This event has already started.",
        human_check: "Please complete the check above and try again.",
      },
    );
    if (res) {
      setResult(res);
      track("registration_complete", { event: e.slug, status: res.status, party: res.party_size });
    }
  };

  // Turn a race-lost RSVP into a waitlist offer without losing what was typed.
  useEffect(() => {
    if (form.errorCode === "sold_out") setFullNow(true);
  }, [form.errorCode]);

  if (result) {
    const confirmed = result.status === "confirmed";
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-display text-2xl font-extrabold">{confirmed ? t("You're in!") : t("You're on the waitlist")}</p>
        <p className="mt-1 text-muted">
          {result.repeat ? t("You'd already signed up, so here's your booking again.") : confirmed ? t("Your spot is saved. The host will message you before the event.") : t("We'll message you if a spot opens up.")}
        </p>
        <div className="mt-5 rounded-2xl bg-cream p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("Your reference")}</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-bold tracking-wider"><Ticket className="h-5 w-5 text-brand" /> {result.ref}</p>
          <p className="mt-2 text-sm">{formatWhen(e.start_at, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(e.start_at)}</p>
          <p className="text-sm text-muted">{e.venue} · {result.party_size} {result.party_size > 1 ? t("people") : t("person")}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {confirmed && (
            <button onClick={() => downloadIcs(e)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand">
              <CalendarPlus className="h-4 w-4" /> {t("Add to calendar")}
            </button>
          )}
          <ShareButton title={e.title} path={`/events/${e.slug}`} kind="event" />
        </div>
        <p className="mt-5 text-xs text-muted">{t("Can't make it? Message IMC on WhatsApp with your reference.")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocus={onFocus} noValidate className="relative space-y-4 rounded-3xl border border-line bg-white p-6 shadow-lg">
      <div>
        <p className="font-display text-2xl font-extrabold">{waitlist ? t("Join the waitlist") : t("Save my spot")}</p>
        <p className="mt-1 text-sm text-muted">
          {waitlist ? t("This one is full. Leave your details and we'll message you if a spot opens.") : e.price_inr > 0 ? t("No payment now. Pay at the venue or as the host explains.") : t("Free. Takes under a minute.")}
        </p>
      </div>
      <TextInput label={t("Your name")} autoComplete="name" value={form.values.name} onChange={(x) => form.set("name", x.target.value)} error={form.errors.name && t(form.errors.name)} />
      <TextInput label={t("WhatsApp number or email")} autoComplete="tel" inputMode="email" value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={form.errors.contact && t(form.errors.contact)} hint={t("Only the host uses this, to confirm and share updates.")} />
      <label className="block">
        <span className="text-sm font-semibold">{t("How many people?")}</span>
        <select value={form.values.party_size} onChange={(x) => form.set("party_size", Number(x.target.value))} className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 1 ? t("Just me") : `${n} ${t("people")}`}</option>)}
        </select>
      </label>
      <TextArea label={t("Anything the host should know? (optional)")} rows={2} value={form.values.note} onChange={(x) => form.set("note", x.target.value)} className="min-h-0" />
      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting}>{waitlist ? t("Join waitlist") : t("RSVP")}</SubmitButton>
      <p className="flex items-start gap-2 text-xs text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> {t("We'll confirm on screen only once your spot is saved.")}</p>
    </form>
  );
}

// A calendar file built on the device; nothing is sent anywhere.
function downloadIcs(e: EventItem) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = eventDate(e.start_at);
  const end = e.end_at ? eventDate(e.end_at) : new Date(start.getTime() + 2 * 3600_000);
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IMC Tirupati//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@imctirupati.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(`${e.venue}, ${e.address || e.area}`)}`,
    `DESCRIPTION:${esc(`${e.summary}\n${window.location.origin}/events/${e.slug}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.slug}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

