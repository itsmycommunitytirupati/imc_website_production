import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Heart, Instagram, MessageCircle, Plus, Send } from "lucide-react";
import { Link } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { EXPERIENCES, formatDate, type Experience } from "../content/experiences";
import { CLUB_GROUPS, FAQS, PASSION_CARDS, POSTER_STYLES } from "../content/community";
import { IMC_PHOTOS, WALL } from "../content/photos";
import { TESTIMONIALS } from "../data";
import { joinLink } from "./ExperienceCard";
import { GopuramIcon, Logo } from "./ui";
import Reveal from "./Reveal";
import { useT } from "../lib/i18n";

// Community hub for a younger crowd, in the spirit of communitie.in: big
// playful type, real photos everywhere, and every path ending in a hello on WhatsApp.

const wa = (text: string) => `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

const PASSION_LINKS = {
  partner: `mailto:${CONTACT.email}?subject=${encodeURIComponent("Partnering with IMC Tirupati")}`,
  host: wa("Hi IMC! I'd like to host an experience."),
  crew: wa("Hi IMC! I'd like to volunteer with the crew."),
};

export default function CommunityPage() {
  usePageTitle(
    "Community | IMC Tirupati, find your tribe",
    "Clubs, meetups and experiences in Tirupati: sport, music, dance, treks, books, startups and more. Find your tribe with IMC.",
  );
  return (
    <div className="bg-paper">
      <Hero />
      <Ticker />
      <PhotoWall />
      <Tribes />
      <ExperiencesFan />
      <WhatsAppPocket />
      <Passion />
      <Social />
      <Voices />
      <Faq />
      <SeeYou />
    </div>
  );
}

/* ---------------------------------------------------------------- hero */

const POLAROIDS = [
  { src: IMC_PHOTOS.hilltop, cls: "left-[2%] top-14 w-32 xl:w-44", r: "-8deg", tape: "rotate-[-4deg]" },
  { src: IMC_PHOTOS.classicalDance, cls: "right-[3%] top-10 w-28 xl:w-40", r: "7deg", tape: "rotate-[5deg]" },
  { src: IMC_PHOTOS.badminton, cls: "left-[5%] bottom-14 w-28 xl:w-40", r: "6deg", tape: "rotate-[3deg]" },
  { src: IMC_PHOTOS.waterfall, cls: "right-[4%] bottom-16 w-32 xl:w-44", r: "-5deg", tape: "rotate-[-6deg]" },
];

function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative isolate inline-block whitespace-nowrap">
      {children}
      <span className="absolute inset-x-[-0.08em] bottom-[0.06em] -z-10 h-[0.4em] -rotate-1 rounded-sm bg-turmeric" aria-hidden="true" />
    </span>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="dot-grid relative overflow-hidden">
      {POLAROIDS.map((p, i) => (
        <figure key={i} className={`animate-float absolute hidden rounded-md bg-white p-2 pb-7 shadow-xl lg:block ${p.cls}`} style={{ "--r": p.r, animationDelay: `${i * 1.3}s` } as CSSProperties}>
          <span className={`absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 bg-turmeric/80 ${p.tape}`} aria-hidden="true" />
          <img src={p.src} alt="" className="aspect-[4/5] w-full rounded-sm object-cover" />
        </figure>
      ))}
      <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:pt-24">
        <p className="inline-block -rotate-3 rounded-full bg-turmeric px-4 py-1.5 text-sm font-bold shadow-sm">
          రండి! <span className="font-medium">{t("Randi, come along")}</span> 👋
        </p>
        <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
          {t("When did you last do something")} <Marker>{t("for the first time?")}</Marker>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted sm:text-xl">{t("Discover something new in Tirupati. Find people who get you.")}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/experiences" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand">
            {t("Explore experiences")} <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a href="#clubs" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold shadow-md ring-1 ring-ink/10 transition hover:-translate-y-0.5">
            {t("Find a club")} <ArrowUpRight className="h-4 w-4" />
          </a>
          <a href="#get-involved" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold shadow-md ring-1 ring-ink/10 transition hover:-translate-y-0.5">
            {t("Host with us")} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <a href="#welcome" className="mt-14 inline-flex flex-col items-center gap-1 text-xs font-medium text-muted">
          {t("Keep exploring")} <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

function Ticker() {
  const t = useT();
  const items = EXPERIENCES.slice(0, 8).map((e) => `${POSTER_STYLES[e.category].emoji} ${e.title} · ${e.recurring ?? formatDate(e.date)}`);
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-ink py-3 text-sm font-semibold text-white" aria-label={t("Coming up at IMC")}>
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            {t} <span className="text-turmeric">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- photo wall */

function PhotoWall() {
  const t = useT();
  const cols = [0, 1, 2, 3, 4].map((c) => WALL.filter((_, i) => i % 5 === c));
  return (
    <section id="welcome" className="relative h-[640px] overflow-hidden bg-black md:h-[780px]">
      <div className="absolute inset-0 grid grid-cols-3 gap-3 px-3 opacity-90 md:grid-cols-5">
        {cols.map((col, c) => (
          <div key={c} className={c > 2 ? "hidden md:block" : ""}>
            <div className={c % 2 ? "animate-wall-down" : "animate-wall-up"}>
              {[...col, ...col].map((src, i) => (
                <img key={i} src={src} alt="" loading="lazy" className="mb-3 aspect-[3/4] w-full rounded-2xl object-cover" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/35 to-black" />
      <div className="absolute inset-0 grid place-items-center px-4 text-center text-white">
        <Reveal>
          <p className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{t("Welcome to")}</p>
          <p className="font-display text-[30vw] font-extrabold leading-[0.85] tracking-[-0.06em] sm:text-[11rem] lg:text-[14rem]">
            IMC<span className="text-brand">.</span>
          </p>
          <p className="mt-3 text-lg font-medium sm:text-2xl">/ it's · my · community /</p>
          <p className="mx-auto mt-4 max-w-md text-white/70">{t("Tirupati's people-first community. Real people, real meetups, every week.")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[t("50+ clubs"), t("700+ events a year"), t("40k+ members")].map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur">{s}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- tribes */

function ClubCard({ g }: { g: (typeof CLUB_GROUPS)[number] }) {
  const t = useT();
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-4 ring-white">
      <img src={g.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-2xl font-extrabold text-white drop-shadow sm:text-3xl">{t(g.title)}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5 transition-all duration-300 lg:max-h-0 lg:opacity-0 lg:group-focus-within:max-h-40 lg:group-focus-within:opacity-100 lg:group-hover:max-h-40 lg:group-hover:opacity-100">
          {g.clubs.map((c) => (
            <a key={c} href={wa(`Hi IMC! I'd like to join the ${c} club.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-turmeric">
              <Plus className="h-3 w-3" /> {t(c)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tribes() {
  const t = useT();
  const before = CLUB_GROUPS.slice(0, 4);
  const after = CLUB_GROUPS.slice(4);
  return (
    <section id="clubs" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal className="text-center">
        <h2 className="font-display text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{t("Find your tribe.")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t("Eight circles, 50+ clubs. Hover a circle (or tap on your phone) and say hi to the one that feels like you.")}</p>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {before.map((g) => <ClubCard key={g.title} g={g} />)}
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-[28px] bg-white p-6 text-center shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)] ring-4 ring-white">
          <div className="scale-150"><Logo /></div>
          <a href={wa("Hi IMC! Which clubs can I join?")} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-brand">
            {t("All clubs")} <ArrowUpRight className="h-4 w-4" />
          </a>
          <p className="font-hand text-2xl text-muted">{t("Let's go, randi! 🎢")}</p>
        </div>
        {after.map((g) => <ClubCard key={g.title} g={g} />)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- experiences */

function Poster({ e, className = "", style }: { e: Experience; className?: string; style?: CSSProperties }) {
  const t = useT();
  const p = POSTER_STYLES[e.category];
  const [weekday, day, month] = new Date(e.date + "T00:00:00")
    .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    .replace(",", "")
    .split(" ");
  return (
    <a
      href={joinLink(e)}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className={`group/poster relative block overflow-hidden rounded-2xl text-left shadow-2xl ring-1 ring-black/10 ${className}`}
    >
      <img src={e.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.bg} 42%, ${p.bg}cc 58%, transparent 85%)` }} />
      <div className="relative flex h-full flex-col p-4" style={{ color: p.fg }}>
        <div className="flex items-start justify-between">
          <span className="rounded-md bg-white px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-ink shadow">
            {weekday}
            <span className="block font-display text-xl leading-none">{day}</span>
            {month}
          </span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">IMC</span>
        </div>
        <div className="mt-auto">
          <p className="text-3xl">{p.emoji}</p>
          <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-[0.95] tracking-tight">{e.title}</p>
          <p className="mt-2 text-xs opacity-80">{e.venue}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: p.accent, color: p.bg }}>{t(e.price)}</span>
            <span className="text-xs font-semibold underline-offset-4 group-hover/poster:underline">{t("I'm in")} →</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function ExperiencesFan() {
  const t = useT();
  const fan = EXPERIENCES.slice(0, 7);
  const mid = (fan.length - 1) / 2;
  return (
    <section className="px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-white px-4 py-16 text-center sm:px-10">
        <Reveal>
          <h2 className="font-display text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{t("Experiences, together.")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            {t("From sunrise runs at Alipiri to starlit camps on Horsley Hills, there's always something on. Here's what's coming up.")}
          </p>
          <div className="relative mt-8 inline-flex items-center">
            <Link to="/experiences" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-brand">
              {t("Explore experiences")} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <span className="absolute left-full ml-5 hidden w-56 -rotate-3 text-left font-hand text-2xl leading-tight text-muted lg:block">
              ← {t("psst… most people come alone the first time 👀")}
            </span>
          </div>
        </Reveal>

        <div className="relative mx-auto mt-16 hidden h-[430px] max-w-5xl lg:block">
          {fan.map((e, i) => {
            const offset = i - mid;
            return (
              <div
                key={e.id}
                className="group/fan absolute left-1/2 top-0 hover:!z-50"
                style={{
                  translate: `calc(-50% + ${offset * 118}px) ${Math.abs(offset) * 16}px`,
                  rotate: `${offset * 6}deg`,
                  zIndex: 10 + i,
                  "--straighten": `${-offset * 6}deg`,
                } as CSSProperties}
              >
                {/* Lift and straighten on hover without touching the fan position. */}
                <div className="transition duration-300 group-hover/fan:[transform:translateY(-28px)_rotate(var(--straighten))_scale(1.04)]">
                  <Poster e={e} className="h-[330px] w-[230px]" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="scrollbar-none -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:hidden">
          {fan.map((e) => <Poster key={e.id} e={e} className="h-[360px] w-[72%] shrink-0 snap-center sm:w-[260px]" />)}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- whatsapp pocket */

function ChatLine({ me, children }: { me?: boolean; children: ReactNode }) {
  return (
    <div className={`w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-snug shadow-sm ${me ? "ml-auto rounded-br-sm bg-[#ffe9d6]" : "rounded-bl-sm bg-white"}`}>
      {children}
    </div>
  );
}

function WhatsAppPocket() {
  const t = useT();
  const hero = EXPERIENCES[0];
  return (
    <section className="px-3 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[40px] bg-ink px-6 py-14 text-white sm:px-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-white/60">{t("Still thinking about that first question?")}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            {t("Your next first time is one message away.")}
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/70">
            {t("Say hi on WhatsApp and we'll add you to the clubs you like. Every plan, poll and photo lands right there, so all you do is show up.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={wa("Hi IMC! I'd like to join the community 👋")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink transition hover:bg-turmeric">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {t("Say hi on WhatsApp")} <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/30 transition hover:bg-white/10">
              <Instagram className="h-4 w-4" /> @imc.tirupati
            </a>
          </div>
          <p className="mt-6 font-hand text-2xl text-white/60">{t("Faster than deciding which dosa to order 👀")}</p>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto">
          <div className="relative w-[290px] rounded-[46px] border-[10px] border-neutral-800 bg-[#efe6da] shadow-2xl" aria-hidden="true">
            <span className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-800" />
            <div className="flex items-center gap-2 rounded-t-[36px] bg-brand px-4 pb-3 pt-9 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[9px] font-extrabold text-brand">IMC</span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">IMC Tirupati 🧡</span>
                <span className="text-[10px] text-white/80">Music Club · Sports Club · +6</span>
              </span>
            </div>
            <div className="dot-grid space-y-2 px-3 py-4 text-ink">
              <ChatLine>
                <img src={hero.image} alt="" className="mb-2 aspect-[16/10] w-full rounded-lg object-cover" />
                🎸 <b>{hero.title}</b> this {formatDate(hero.date)}, {hero.time}. Who's in?
              </ChatLine>
              <ChatLine>
                <p className="font-semibold">📊 Sunday run: pick your pace</p>
                {[["Easy 5K", 70], ["Steady 7K", 45], ["Just coffee after ☕", 30]].map(([l, w]) => (
                  <div key={l as string} className="mt-1.5">
                    <div className="flex justify-between text-[11px]"><span>{l}</span></div>
                    <div className="mt-0.5 h-1.5 rounded-full bg-stone-200"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${w}%` }} /></div>
                  </div>
                ))}
              </ChatLine>
              <ChatLine me>Count me in! First time 🙋</ChatLine>
              <ChatLine>Yay! We'll save you a spot 🧡</ChatLine>
            </div>
            <div className="flex items-center gap-2 rounded-b-[36px] bg-white/70 px-3 py-3">
              <span className="flex-1 rounded-full bg-white px-3 py-2 text-[11px] text-muted">Message</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white"><Send className="h-4 w-4" /></span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- passion */

function Passion() {
  const t = useT();
  const tilt = ["-rotate-3", "rotate-2 md:mt-12", "-rotate-2 md:mt-4"];
  return (
    <section id="get-involved" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal className="text-center">
        <h2 className="font-display text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{t("Your passion, our platform.")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          {t("Got an idea for a club, a space that could host the next meetup, or a skill the city should see? Let's build it together.")}
        </p>
      </Reveal>
      <div className="mt-14 grid items-start gap-12 md:grid-cols-3 md:gap-8">
        {PASSION_CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1} className={tilt[i]}>
            <p className="mb-3 text-center font-hand text-2xl">{t(c.note)}</p>
            <div className="rounded-[28px] bg-white p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] transition hover:rotate-0">
              <img src={c.image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
              <div className="p-3">
                <h3 className="font-display text-2xl font-extrabold">{t(c.title)}</h3>
                <p className="mt-2 text-muted">{t(c.text)}</p>
                <a href={PASSION_LINKS[c.action]} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-white transition hover:bg-brand">
                  {t(c.cta)} <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- social */

function Post({ src, likes, className }: { src: string; likes: string; className: string }) {
  return (
    <div className={`absolute w-[220px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:w-[240px] ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-tr from-amber-400 via-brand to-fuchsia-600 p-[2px]">
          <span className="grid h-full w-full place-items-center rounded-full bg-white text-[7px] font-extrabold text-brand">IMC</span>
        </span>
        <span className="text-xs font-semibold">imc.tirupati</span>
      </div>
      <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
      <div className="flex items-center gap-3 px-3 py-2 text-xs">
        <Heart className="h-4 w-4 fill-red-500 text-red-500" /> <MessageCircle className="h-4 w-4" /> <Send className="h-4 w-4" />
        <span className="ml-auto text-muted">{likes}</span>
      </div>
    </div>
  );
}

function Social() {
  const t = useT();
  return (
    <section className="px-3 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-10 overflow-hidden rounded-[40px] bg-white px-6 py-14 sm:px-12 lg:grid-cols-2">
        <Reveal>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-xl font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-amber-400 via-brand to-fuchsia-600 text-white"><Instagram className="h-5 w-5" /></span>
            imc.tirupati
          </a>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">{t("Your social circle, a tap away.")}</h2>
          <p className="mt-5 max-w-md text-lg text-muted">{t("Club moments, behind-the-scenes chaos and the photos everyone asks for. Follow along and be part of the story.")}</p>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-brand">
            {t("Follow us")} <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
        <div className="relative h-[400px]">
          <Post src={IMC_PHOTOS.outdoorSelfie} likes="moments" className="left-[2%] top-10 -rotate-6" />
          <Post src={IMC_PHOTOS.waterfall} likes="memories" className="left-[30%] top-0 z-10 rotate-3" />
          <Post src={IMC_PHOTOS.festiveMeetup} likes="friends" className="right-[0%] top-16 hidden rotate-[8deg] sm:block" />
          <p className="absolute bottom-0 left-4 z-20 -rotate-2 font-hand text-2xl">{t("Is that you in the picture? 👀")}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- voices */

function Voices() {
  const t = useT();
  const row = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="hover-pause overflow-hidden py-20">
      <Reveal className="px-4 text-center">
        <h2 className="font-display text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{t("Heard around the club.")}</h2>
        <p className="mt-4 text-lg text-muted">{t("From the captains and crew who make IMC happen.")}</p>
      </Reveal>
      <div className="mt-12 flex w-max animate-marquee-slow gap-5">
        {row.map((t, i) => (
          <figure key={i} className="w-[320px] shrink-0 rounded-3xl bg-white p-6 shadow-sm sm:w-[360px]">
            <blockquote className="leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-turmeric font-bold">{t.author.charAt(0)}</span>
              <span>
                <span className="block font-semibold">{t.author}</span>
                <span className="text-muted">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- faq */

function Faq() {
  const t = useT();
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
      <Reveal>
        <h2 className="font-display text-5xl font-extrabold leading-[1] tracking-[-0.04em] sm:text-6xl">{t("Frequently asked questions")}</h2>
        <p className="mt-4 text-lg text-muted">{t("Everything you need to know before your first meetup.")}</p>
        <p className="mt-8 font-hand text-2xl">{t("Still curious? Just ask 👇")}</p>
        <a href={wa("Hi IMC! I have a question.")} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-brand">
          <MessageCircle className="h-4 w-4" /> {t("Ask on WhatsApp")}
        </a>
      </Reveal>
      <Reveal delay={0.1} className="divide-y divide-line overflow-hidden rounded-3xl bg-white shadow-sm">
        {FAQS.map((f) => (
          <details key={f.q} className="group p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
              {t(f.q)}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper transition group-open:rotate-45 group-open:bg-turmeric">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <p className="mt-3 text-muted">{t(f.a)}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------- see you */

function SeeYou() {
  const t = useT();
  return (
    <section className="relative overflow-hidden bg-brand px-4 py-20 text-center text-white">
      <GopuramIcon className="pointer-events-none absolute -bottom-10 -left-10 h-72 w-72 text-white/10" />
      <GopuramIcon className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 text-white/10" />
      <Reveal className="relative">
        <h2 className="font-display text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{t("See you this Sunday? 👋")}</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">{t("Pick a club, pick an experience, or just say hi. Your first time is on us to make easy.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/experiences" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink transition hover:bg-turmeric">
            {t("Explore experiences")} <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a href={wa("Hi IMC! 👋")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/50 transition hover:bg-white/10">
            {t("Say hi on WhatsApp")} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
