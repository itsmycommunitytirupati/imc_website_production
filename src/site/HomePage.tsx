import { useState, type ComponentType, type FormEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Baby, Bus, CalendarDays, CalendarRange, Check, ChevronRight, Footprints, Globe,
  HeartHandshake, MapPin, MapPinned, MessageCircle, Search, Sparkles, Sun, User, Users, UtensilsCrossed,
} from "lucide-react";
import { Link, navigate } from "../lib/router";
import { CONTACT, LANGS, OFFICIAL, guideUrl, useLang, usePageTitle } from "../lib/site";
import { MEDIA } from "../content/media";
import { answerFor, followUpPrompt } from "../content/guide";
import { BEFORE_YOU_GO, DISTANCES, TRIP_TYPES, type TopicId } from "../content/visitor";
import { GopuramIcon } from "./ui";
import Reveal from "./Reveal";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

const TOPIC_CHIPS: { id: TopicId; label: string; Icon: IconType }[] = [
  { id: "tirumala", label: "Tirumala visit", Icon: GopuramIcon },
  { id: "getting-around", label: "Getting around", Icon: Bus },
  { id: "food-stays", label: "Food & stays", Icon: UtensilsCrossed },
  { id: "things-to-do", label: "Things to do", Icon: MapPinned },
];

const POPULAR = ["Darshan with elderly parents", "Parking at Tirumala", "Free meals on the hill"];

const TRIP_ICONS: Record<(typeof TRIP_TYPES)[number]["id"], IconType> = {
  first: Sparkles,
  elders: HeartHandshake,
  kids: Baby,
  walk: Footprints,
  day: Sun,
  weekend: CalendarRange,
};

const COMMUNITY_CARDS = [
  { title: "Music & meetups", text: "Live music, jam sessions and friendly gatherings.", image: MEDIA.imcCrowd, to: "/experiences?c=music" },
  { title: "Nature outings", text: "Treks, nature walks and weekend getaways.", image: MEDIA.imcNature, to: "/experiences?c=nature" },
  { title: "Culture & creativity", text: "Local art, traditions, food and more.", image: MEDIA.imcArt, to: "/experiences?c=culture" },
];

export default function HomePage() {
  usePageTitle(
    "IMC Tirupati | Feel at home in Tirupati",
    "Find your way, plan your visit and connect with local people in Tirupati. AI-assisted guidance from IMC, It's My Community.",
  );
  return (
    <>
      <Hero />
      <OfficialBand />
      <TripTypes />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Helpful answers. Clear next steps.</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-5">
              <ExampleConversation />
              <MakeItYourVisit />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <DiscoverCommunity />
          </Reveal>
        </div>
      </section>
      <BeforeYouGo />
      <Welcome />
    </>
  );
}

function Hero() {
  const [lang] = useLang();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(guideUrl(q, lang));
  };
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-peach/80 via-cream to-cream">
      {/* Soft hill silhouette behind the hero copy. */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-peach" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 160V110c120-40 220-70 340-52s200 50 320 30 210-78 330-82 210 46 300 64 110 4 150-6v96z" opacity=".6" />
      </svg>
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-6 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:pb-16 md:pt-10">
        <div>
          <div className="flex gap-3 md:block">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand sm:text-sm">A local welcome, by IMC</p>
              <h1 className="mt-2 font-display text-[1.9rem] font-extrabold leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Feel at home
                <br />
                <span className="text-brand">in Tirupati.</span>
              </h1>
              <p className="mt-3 text-sm text-muted sm:mt-5 sm:text-xl">Find your way, plan your visit and connect with local people.</p>
            </div>
            <div className="relative w-[40%] shrink-0 self-stretch md:hidden">
              <img src={MEDIA.hills.src} alt={MEDIA.hills.alt} className="h-full w-full rounded-xl object-cover object-[75%_50%]" />
              <img src={MEDIA.family.src} alt={MEDIA.family.alt} className="absolute -bottom-2 -left-2 h-14 w-14 rounded-full border-[3px] border-white object-cover shadow-md" />
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-xl sm:border sm:border-line sm:bg-white sm:p-1.5 sm:shadow-lg sm:shadow-brand/5">
            <label className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 sm:border-0 sm:py-2">
              <Search className="h-5 w-5 shrink-0 text-ink/50" aria-hidden="true" />
              <span className="sr-only">Your question</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What would you like help with?"
                className="w-full bg-transparent text-base outline-none placeholder:text-ink/45 sm:text-lg"
              />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark active:scale-[0.98] sm:text-lg">
              Ask guide <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-muted sm:text-left">AI-assisted guidance · No account needed</p>
          <div className="mt-3 hidden flex-wrap items-center gap-2 text-sm sm:flex">
            <span className="text-muted">Popular:</span>
            {POPULAR.map((p) => (
              <Link key={p} to={guideUrl(p, lang)} className="rounded-full bg-white/80 px-3 py-1 text-ink/80 ring-1 ring-line transition hover:text-brand hover:ring-brand/40">
                {p}
              </Link>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {TOPIC_CHIPS.map(({ id, label, Icon }) => (
              <Link
                key={id}
                to={`/visitor-guide#${id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white px-3 py-4 text-center text-sm font-medium leading-tight shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:flex-row sm:whitespace-nowrap sm:py-3.5 sm:text-left"
              >
                <Icon className="h-7 w-7 shrink-0 text-brand sm:h-6 sm:w-6" strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-center text-sm sm:text-left">
            <Link to="/visitor-guide" className="inline-flex items-center gap-1.5 font-medium text-brand underline underline-offset-4 hover:text-brand-dark">
              Prefer to browse? Open visitor guide <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>

        <figure className="relative hidden md:block md:pb-8 md:pl-8">
          <img
            src={MEDIA.hills.src}
            alt={MEDIA.hills.alt}
            className="aspect-[4/4.2] w-full rounded-[28px] object-cover object-[90%_50%] shadow-2xl shadow-brand/15"
          />
          <span className="absolute left-12 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold shadow-md">
            <GopuramIcon className="h-4 w-4 text-brand" /> Welcome to the Seven Hills
          </span>
          <div className="absolute bottom-0 left-0 w-[46%] -rotate-2 rounded-2xl bg-white p-1.5 shadow-xl">
            <img src={MEDIA.family.src} alt={MEDIA.family.alt} className="aspect-[4/3] w-full rounded-xl object-cover" />
            <p className="px-1.5 pb-0.5 pt-1.5 text-xs font-medium text-ink/80">Made for families, first-timers and friends</p>
          </div>
          <figcaption className="absolute bottom-11 right-4 text-[10px] text-white/85 drop-shadow" title={`Photos by ${MEDIA.hills.credit} and ${MEDIA.family.credit} on Unsplash`}>
            Photos: <a href={MEDIA.hills.creditUrl} target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function OfficialBand() {
  return (
    <section className="border-y border-brand/10 bg-peach">
      <a
        href={OFFICIAL.ttdBooking}
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6"
      >
        <GopuramIcon className="h-9 w-9 shrink-0 text-brand" />
        <div className="flex-1 md:flex md:items-center md:gap-6">
          <p className="font-display font-bold sm:text-lg">Darshan bookings &amp; official updates</p>
          <p className="text-xs text-muted md:border-l md:border-ink/15 md:pl-6 md:text-sm">IMC is an independent community guide.</p>
        </div>
        <ChevronRight className="h-5 w-5 text-brand md:hidden" aria-hidden="true" />
        <span className="hidden items-center gap-2 rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white md:inline-flex">
          Visit official TTD site <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>
    </section>
  );
}

function TripTypes() {
  const [lang] = useLang();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:pt-16">
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Plan for the way you travel</h2>
        <p className="mt-2 text-muted">Pick what sounds like your trip. We'll start with the right tips.</p>
        <div className="scrollbar-none -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {TRIP_TYPES.map((t) => {
            const Icon = TRIP_ICONS[t.id];
            return (
              <Link
                key={t.id}
                to={guideUrl(t.prompt, lang)}
                className="group flex w-[78%] shrink-0 snap-start items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:w-auto"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-bold">{t.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{t.tip}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Plan this trip <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

function ExampleConversation() {
  const [lang] = useLang();
  const question = "We're travelling with elderly parents.";
  const a = answerFor(question);
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Example conversation</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-brand"><User className="h-4 w-4" /></span>
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm">{question}</p>
      </div>
      <div className="mt-4 flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-peach text-[10px] font-extrabold">IMC</span>
        <div className="flex-1 rounded-lg bg-stone-50 p-3">
          <p className="font-medium">{a.title}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {a.points.map((p) => (
              <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p}</li>
            ))}
          </ul>
        </div>
      </div>
      {a.followUps && (
        <div className="mt-3 rounded-lg bg-stone-50 p-3">
          <p className="text-sm">{a.ask}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {a.followUps.map((f) => {
              const { label, prompt } = followUpPrompt(f);
              const Icon = f === "transport" ? Bus : CalendarDays;
              return (
                <Link key={f} to={guideUrl(prompt, lang)} className="flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-white py-2.5 text-sm font-medium text-brand transition hover:bg-brand-soft">
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {a.officialLink && (
        <a href={a.officialLink.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand underline underline-offset-4">
          {a.officialLink.label} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function MakeItYourVisit() {
  const [lang, setLang] = useLang();
  const [pickLang, setPickLang] = useState(false);
  const card = "flex w-full items-center gap-4 rounded-xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-brand/40 hover:shadow-md";
  return (
    <div>
      <h3 className="font-display text-xl font-extrabold tracking-tight">Make it your visit</h3>
      <div className="mt-4 space-y-3">
        <div>
          <button className={card} onClick={() => setPickLang((v) => !v)} aria-expanded={pickLang}>
            <Globe className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.7} />
            <span className="flex-1">
              <span className="block font-medium">Choose your language</span>
              <span className="text-sm text-muted">{LANGS.map((l) => l.label).join(" · ")}</span>
            </span>
            <ChevronRight className={`h-5 w-5 text-brand transition-transform ${pickLang ? "rotate-90" : ""}`} />
          </button>
          {pickLang && (
            <div className="mt-2 flex gap-2 px-1">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${lang === l.id ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
                  aria-pressed={lang === l.id}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
          {pickLang && lang !== "en" && (
            <p className="mt-2 px-1 text-xs text-muted">The guide will answer in English for now; Telugu and Hindi are on the way.</p>
          )}
        </div>
        <Link to={guideUrl("What's good near where I'm staying?", lang)} className={card}>
          <MapPin className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.7} />
          <span className="flex-1">
            <span className="block font-medium">You control your location</span>
            <span className="text-sm text-muted">Enter an area, or choose to share your location.</span>
          </span>
          <ChevronRight className="h-5 w-5 text-brand" />
        </Link>
        <Link to={CONTACT.whatsapp} className={card}>
          <Users className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.7} />
          <span className="flex-1">
            <span className="block font-medium">Need a person?</span>
            <span className="block text-sm">Contact the IMC team</span>
            <span className="text-xs text-muted">Response times may vary.</span>
          </span>
          <ChevronRight className="h-5 w-5 text-brand" />
        </Link>
      </div>
    </div>
  );
}

function DiscoverCommunity() {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Discover the community</h2>
      <p className="mt-2 text-muted">When you have time, find something you enjoy.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COMMUNITY_CARDS.map((c) => (
          <Link key={c.title} to={c.to} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="block overflow-hidden">
              <img src={c.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105 sm:aspect-[5/6]" />
            </span>
            <span className="flex flex-1 flex-col p-3">
              <span className="font-medium">{c.title}</span>
              <span className="mt-1 flex-1 text-xs text-muted">{c.text}</span>
              <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-brand/40 px-3 py-1.5 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Real moments from IMC clubs in Tirupati.</p>
      <Link to="/community" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4">
        Meet the IMC community <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function BeforeYouGo() {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (item: string) => setDone((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));
  return (
    <section className="bg-peach/70 py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <Reveal className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Before you go</h2>
            <span className="text-sm font-semibold text-brand" aria-live="polite">{done.length}/{BEFORE_YOU_GO.length} ready</span>
          </div>
          <p className="mt-2 text-muted">A quick checklist. Tap each one as you pack.</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {BEFORE_YOU_GO.map((item) => {
              const checked = done.includes(item);
              return (
                <li key={item}>
                  <button
                    onClick={() => toggle(item)}
                    aria-pressed={checked}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${checked ? "border-brand/30 bg-brand-soft text-ink/60 line-through" : "border-line hover:border-brand/40"}`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${checked ? "border-brand bg-brand text-white" : "border-ink/25"}`}>
                      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">How far is it?</h2>
          <p className="mt-2 text-muted">From Tirupati town centre, roughly.</p>
          <dl className="mt-5 space-y-3">
            {DISTANCES.map((d) => (
              <div key={d.place} className="flex items-baseline gap-2 text-sm">
                <dt className="font-medium">{d.place}</dt>
                <span className="mb-1 flex-1 border-b border-dotted border-ink/20" aria-hidden="true" />
                <dd className="text-muted">{d.value}</dd>
              </div>
            ))}
          </dl>
          <Link to="/visitor-guide#getting-around" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4">
            How to get around <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Welcome() {
  const [lang] = useLang();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-12 sm:py-14">
        <GopuramIcon className="pointer-events-none absolute -right-6 -top-4 h-56 w-56 text-white/[0.06]" />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-300">Namaskaram 🙏</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          We're glad you're here. Tirupati is better with friends.
        </h2>
        <p className="mt-4 max-w-xl text-white/70">
          IMC is a community of Tirupati locals. Ask the guide anything, or message us and a real person will help.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={guideUrl(undefined, lang)} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold transition hover:bg-brand-dark">
            Ask guide <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={CONTACT.whatsapp} className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 font-semibold transition hover:bg-white hover:text-ink">
            <MessageCircle className="h-4 w-4" /> Message a local
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
