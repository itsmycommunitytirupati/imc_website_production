import { useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Lightbulb, Lock, MessageCircleQuestion, Sparkles, Vote } from "lucide-react";
import { Link } from "../lib/router";
import { guideUrl, useLang, usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { addDays, formatWhen, istToday, useApi, weekendRange, type AddaPost, type EventItem, type GroupItem, type Opportunity, type StoryItem } from "../lib/api";
import { IMC_PHOTOS } from "../content/photos";
import { EmptyState, ErrorState, EventCard, GroupLogo, LoadingCards, OpportunityCard, SampleBadge, SectionTitle, StoryCard } from "./kit";
import { GopuramIcon, HillsSilhouette } from "./ui";
import Reveal from "./Reveal";

// The brief's community-first home: what's on, who to meet, and one clear way in.
// Visitors get their own band near the end and the full guide under Discover.

export default function HomePage() {
  usePageTitle(
    "IMC Tirupati | Tirupati is home. Let's make it your community.",
    "Events, circles and weekend plans in Tirupati, run by people who live here. Browse first, join when it feels right.",
  );
  return (
    <>
      <Hero />
      <Happening />
      <FindPeople />
      <AddaPreview />
      <PeopleStories />
      <OpportunitiesPreview />
      <JoinBand />
      <VisitingBand />
    </>
  );
}

/* ---------------------------------------------------------------- hero */

const HERO_PHOTOS = [
  { src: IMC_PHOTOS.hilltop, alt: "IMC members on a hilltop near Tirupati", cls: "left-0 top-6 w-[52%]", r: "-5deg" },
  { src: IMC_PHOTOS.danceCrowd, alt: "A dance evening at an IMC meetup", cls: "right-0 top-0 w-[46%]", r: "4deg" },
  { src: IMC_PHOTOS.boardGames, alt: "Friends playing board games at IMC", cls: "left-[18%] bottom-0 w-[50%]", r: "2deg" },
];

function Hero() {
  const t = useT();
  const { data } = useApi<{ events: EventItem[] }>(`/api/events?limit=1`);
  const next = data?.events[0];
  return (
    <section className="dot-grid relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <Reveal>
          <p className="inline-block -rotate-2 rounded-full bg-turmeric px-4 py-1.5 text-sm font-bold shadow-sm">
            రండి! <span className="font-medium">{t("Randi, come along")}</span> 👋
          </p>
          <h1 className="mt-6 font-display text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            {t("Tirupati is home.")}{" "}
            <span className="relative isolate inline-block">
              {t("Let's make it your community.")}
              <span className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.32em] -rotate-1 rounded-sm bg-turmeric" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
            {t("Meetups, circles and weekend plans run by people who live here. Browse first; join when it feels right.")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/events" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 text-lg font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              {t("Explore Events")} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/communities" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-semibold shadow-md ring-1 ring-ink/10 transition hover:-translate-y-0.5">
              {t("Find Your People")} <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            {t("Visiting for darshan?")}{" "}
            <Link to="/discover" className="font-semibold text-brand underline underline-offset-4">{t("Plan your visit")}</Link>
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto aspect-[1/1] w-full max-w-[520px]">
          {HERO_PHOTOS.map((p, i) => (
            <figure key={i} className={`animate-float absolute rounded-lg bg-white p-2 pb-6 shadow-2xl ${p.cls}`} style={{ "--r": p.r, animationDelay: `${i * 1.4}s` } as CSSProperties}>
              <img src={p.src} alt={p.alt} className="aspect-[4/5] w-full rounded object-cover" />
            </figure>
          ))}
          {next && (
            <Link to={`/events/${next.slug}`} className="absolute -bottom-4 right-0 z-10 max-w-[230px] rotate-2 rounded-2xl bg-ink p-4 text-white shadow-2xl transition hover:rotate-0">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-turmeric">
                <CalendarDays className="h-3.5 w-3.5" /> {t("Next up")}
                {next.is_sample === 1 && <SampleBadge />}
              </span>
              <span className="mt-1 block font-display text-lg font-extrabold leading-tight">{next.title}</span>
              <span className="mt-1 block text-xs text-white/70">{formatWhen(next.start_at)} · {next.venue}</span>
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- what's happening */

type Range = "weekend" | "week" | "all";

function Happening() {
  const t = useT();
  const [range, setRange] = useState<Range>("all");
  const today = istToday();
  const wk = weekendRange();
  const query = range === "weekend" ? `from=${wk.from}&to=${wk.to}` : range === "week" ? `from=${today}&to=${addDays(today, 7)}` : "";
  const { data, loading, error, reload } = useApi<{ events: EventItem[] }>(`/api/events?limit=6&${query}`);
  const tabs: [Range, string][] = [["all", "Coming up"], ["weekend", "This weekend"], ["week", "Next 7 days"]];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionTitle
        eyebrow={t("Weekend vachindhi. Excuses enduku?")}
        title={t("What's happening")}
        action={
          <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-brand">
            {t("See all events")} <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={range === id} onClick={() => setRange(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${range === id ? "bg-brand text-white" : "bg-white ring-1 ring-line hover:ring-brand/40"}`}>
            {t(label)}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {loading ? (
          <LoadingCards />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.events.length ? (
          <EmptyState action={<Link to="/opportunities#propose" className="font-semibold text-brand underline">{t("Propose an event")}</Link>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.events.slice(0, 6).map((e, i) => (
              <div key={e.slug} className={i >= 3 ? "hidden lg:block" : ""}>
                <EventCard e={e} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- find your people */

function FindPeople() {
  const t = useT();
  const { data, loading, error, reload } = useApi<{ groups: GroupItem[] }>("/api/groups");
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow={t("Introvert mode allowed.")}
          title={t("Find your people")}
          sub={t("Pick what you're into. Each circle has a real host, a next meetup and a way to say hi first.")}
          action={<Link to="/communities" className="inline-flex items-center gap-2 font-semibold text-brand">{t("All communities")} <ArrowRight className="h-4 w-4" /></Link>}
        />
        <div className="mt-10">
          {loading ? (
            <LoadingCards count={4} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {data?.groups.slice(0, 10).map((g) => (
                <Link key={g.slug} to={`/communities/${g.slug}`} className="group flex flex-col items-center rounded-2xl border border-line bg-cream p-4 text-center transition hover:-translate-y-1 hover:border-brand/40 hover:bg-white hover:shadow-lg">
                  <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
                    <GroupLogo slug={g.slug} image={g.image} className="h-full w-full" />
                  </span>
                  <span className="mt-3 font-semibold leading-tight">{g.name}</span>
                  <span className="mt-1 line-clamp-1 text-xs text-muted">{g.next_event ? `${t("Next")}: ${formatWhen(g.next_event.start_at)}` : t("Next meetup being planned")}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- adda */

const ADDA_ICON = { question: MessageCircleQuestion, idea: Lightbulb, poll: Vote, recommendation: Sparkles };

function AddaPreview() {
  const t = useT();
  const { data, loading } = useApi<{ posts: AddaPost[] }>("/api/adda");
  const posts = data?.posts.slice(0, 3) ?? [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid gap-10 rounded-[40px] bg-ink px-6 py-12 text-white sm:px-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="font-hand text-2xl text-turmeric">{t("Chai, charcha, plans.")}</p>
          <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t("Tirupati Adda")}</h2>
          <p className="mt-4 max-w-md text-white/70">{t("Ask the city, pitch an idea, vote on the next meetup. Every post is read by a moderator before it goes up.")}</p>
          <Link to="/adda" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink hover:bg-turmeric">
            {t("Open the Adda")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {loading && <div className="h-40 animate-pulse rounded-2xl bg-white/10" />}
          {!loading && !posts.length && <p className="rounded-2xl bg-white/5 p-6 text-white/70">{t("Scene konchem silent ga undhi.")} {t("Be the first to post.")}</p>}
          {posts.map((p) => {
            const Icon = ADDA_ICON[p.kind];
            return (
              <Link key={p.id} to={`/adda#post-${p.id}`} className="flex gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-turmeric text-ink"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
                    {t(p.kind === "recommendation" ? "Recommendation" : p.kind === "poll" ? "Poll" : p.kind === "idea" ? "Idea" : "Question")}
                    {p.is_sample === 1 && <SampleBadge />}
                  </span>
                  <span className="mt-0.5 block font-semibold">{p.title}</span>
                  {p.kind === "poll" && <span className="mt-1 block text-xs text-white/60">{p.votes.reduce((a, b) => a + b, 0)} {t("votes")} · {t("tap to vote")}</span>}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ stories */

function PeopleStories() {
  const t = useT();
  const { data, loading, error, reload } = useApi<{ stories: StoryItem[] }>("/api/stories");
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionTitle
        eyebrow={t("People & stories")}
        title={t("Proof that we actually touched grass this weekend.")}
        action={<Link to="/stories" className="inline-flex items-center gap-2 font-semibold text-brand">{t("Memory wall")} <ArrowRight className="h-4 w-4" /></Link>}
      />
      <div className="mt-10">
        {loading ? (
          <LoadingCards />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.stories.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.stories.slice(0, 3).map((s) => <StoryCard key={s.slug} s={s} />)}
          </div>
        )}
      </div>
      <p className="mt-6 text-sm text-muted">
        {t("Spotted yourself? Tag a friend, or ask us to take it down.")}{" "}
        <Link to="/report?type=photo_removal" className="font-semibold text-brand underline underline-offset-4">{t("Request removal")}</Link>
      </p>
    </section>
  );
}

/* ------------------------------------------------------- opportunities */

function OpportunitiesPreview() {
  const t = useT();
  const { data, loading } = useApi<{ opportunities: Opportunity[] }>("/api/opportunities");
  const items = data?.opportunities.slice(0, 3) ?? [];
  return (
    <section className="bg-peach/60 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow={t("Opportunities")}
          title={t("Talent undhi. Team ledhu. Let's fix that.")}
          sub={t("Gigs, volunteer roles and collabs from people in Tirupati. Paid or voluntary is always shown upfront.")}
          action={
            <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-brand">
              {t("Browse and post")} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {loading && <LoadingCards />}
          {items.map((o) => <OpportunityCard key={o.id} o={o} />)}
        </div>
        {!loading && !items.length && <EmptyState title={t("No open opportunities right now.")} />}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- join */

function JoinBand() {
  const t = useT();
  const perks = [
    [BadgeCheck, "Hear about meetups before they fill up"],
    [Sparkles, "One suggested first meetup, picked for you"],
    [Lock, "Just a name and a number. Never shown publicly."],
  ] as const;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="relative overflow-hidden rounded-[40px] bg-brand px-6 py-12 text-white sm:px-12 lg:py-16">
        <GopuramIcon className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 text-white/10" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">{t("Don't just attend the scene. Create the scene.")}</h2>
            <p className="mt-4 max-w-md text-lg text-white/85">{t("Join IMC in under a minute. Pick your interests and we'll suggest one easy first step.")}</p>
            <Link to="/join" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-semibold text-ink hover:bg-turmeric">
              {t("Join IMC")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ul className="space-y-3">
            {perks.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                <Icon className="h-6 w-6 shrink-0 text-turmeric" /> <span className="font-medium">{t(text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ visiting */

function VisitingBand() {
  const t = useT();
  const [lang] = useLang();
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <img src={IMC_PHOTOS.hillsTrek} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr] md:items-center lg:py-24">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-300"><GopuramIcon className="h-5 w-5" /> {t("Visiting Tirupati?")}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t("Darshan, travel, food and stays, explained by locals.")}</h2>
          <p className="mt-4 max-w-lg text-white/75">{t("Our visitor guide and AI guide point you to official TTD sources for bookings and timings.")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Link to="/discover" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink hover:bg-turmeric">
            {t("Discover Tirupati")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={guideUrl(undefined, lang)} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/40 hover:bg-white/10">
            {t("Ask the guide")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <HillsSilhouette className="relative block h-12 w-full text-cream md:h-16" />
    </section>
  );
}
