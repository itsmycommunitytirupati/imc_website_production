import { ArrowUpRight, Instagram, Plus } from "lucide-react";
import { Link } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { MEDIA } from "../content/media";
import { EXPERIENCES } from "../content/experiences";
import { STATS, TESTIMONIALS } from "../data";
import ExperienceCard from "./ExperienceCard";

// Real IMC clubs, grouped the way people browse them.
const CLUB_GROUPS = [
  { title: "Sports & fitness", tone: "bg-[#ffe4d1]", clubs: ["Cricket", "Badminton", "Volleyball", "Pickleball", "Cycling", "Cue Club"] },
  { title: "Creative pursuits", tone: "bg-[#fde7f0]", clubs: ["Music", "Dance", "Creator Club", "Mic.tirupati open mic"] },
  { title: "Mind & growth", tone: "bg-[#e6efff]", clubs: ["Book Club", "Board Games", "Startup Club", "Connect Tirupati"] },
  { title: "Culture & lifestyle", tone: "bg-[#efe7ff]", clubs: ["Culture & Lifestyle", "Women's Circle", "Kids & Parents"] },
  { title: "Outdoors & giving back", tone: "bg-[#e3f5e9]", clubs: ["Nature Retreat", "Social Welfare"] },
];

const GET_INVOLVED = [
  {
    title: "Host an experience",
    text: "Have a passion that deserves its own circle? Bring the idea; we'll help with people, venue and promotion.",
    cta: "Start something",
    tag: "Create. Collab. Build culture.",
    href: `${CONTACT.whatsapp}?text=${encodeURIComponent("Hi IMC! I'd like to host an experience.")}`,
  },
  {
    title: "Partner with IMC",
    text: "Run a café, studio, brand or venue in Tirupati? Co-host meetups and meet the city's most active crowd.",
    cta: "Become a partner",
    tag: "Your space, our people.",
    href: `mailto:${CONTACT.email}?subject=${encodeURIComponent("Partnering with IMC Tirupati")}`,
  },
  {
    title: "Join the crew",
    text: "Volunteers make every IMC event happen. Help with events, design, content or welcoming new people.",
    cta: "Volunteer with us",
    tag: "Do your thing.",
    href: `${CONTACT.whatsapp}?text=${encodeURIComponent("Hi IMC! I'd like to volunteer with the team.")}`,
  },
];

const FAQS = [
  { q: "What is IMC?", a: "IMC (It's My Community) is a people-first community in Tirupati. We run clubs and experiences across music, sports, nature, culture, careers and more, so anyone can find their people." },
  { q: "How do I join a club?", a: "Tap a club above or message us on WhatsApp. We'll add you to the club group, where meetups are announced." },
  { q: "Can I join more than one club?", a: "Of course. Most members are part of two or three." },
  { q: "I'm only visiting Tirupati. Can I join an experience?", a: "Yes. Many experiences, like food walks, runs and music evenings, are open to visitors. Tap \"I'm in\" on any experience." },
  { q: "Are there fees?", a: "Many meetups are free. Some experiences charge a small fee to cover venue, materials or transport, and the price is always shown upfront." },
  { q: "How can I suggest a new club?", a: "Message us with the idea. If there's interest, we'll help you start it." },
];

function joinClub(club: string) {
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi IMC! I'd like to join the ${club} club.`)}`;
}

export default function CommunityPage() {
  usePageTitle(
    "Community | IMC Tirupati, find your tribe",
    "Clubs, meetups and experiences in Tirupati: music, sports, nature, culture, startups and more. Find your tribe with IMC.",
  );
  const upcoming = EXPERIENCES.slice(0, 6);
  return (
    <>
      <section className="dot-grid border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <p className="inline-block -rotate-2 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">you, next Sunday? 👀</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            When did you last do something <span className="text-brand">for the first time?</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">Discover something new in Tirupati. Find people who get you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/experiences" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark">
              Explore experiences <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a href="#clubs" className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-white">
              Find a club <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#get-involved" className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-white">
              Host with us <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-cream p-4">
                <dt className="font-display text-lg font-extrabold sm:text-xl">{s.label}</dt>
                <dd className="text-sm text-muted">{s.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-muted">Welcome to</p>
          <h2 className="mt-1 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            IMC<span className="text-brand">.</span>
          </h2>
          <p className="mt-2 font-mono text-sm text-muted">/ it's · my · community /</p>
          <p className="mt-6 text-lg leading-relaxed">
            IMC started in Tirupati with one idea: a temple town should also be a great place to make friends.
            Today it's 50+ clubs where students, professionals, families and newcomers meet over music, sport,
            treks, books, startups and a lot of filter coffee.
          </p>
          <p className="mt-4 text-muted">No membership forms. Show up once, and you're part of it.</p>
        </div>
        <img src={MEDIA.imcCircle} alt="IMC members smiling around a long table at a community meetup" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" />
      </section>

      <section id="clubs" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Find your tribe</h2>
          <p className="mt-2 text-muted">Pick a club and we'll add you to its group. Join as many as you like.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CLUB_GROUPS.map((g) => (
              <div key={g.title} className={`rounded-2xl p-5 ${g.tone}`}>
                <h3 className="font-display text-xl font-bold">{g.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.clubs.map((c) => (
                    <a key={c} href={joinClub(c)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-ink hover:text-white">
                      <Plus className="h-3.5 w-3.5" /> {c}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-ink/20 p-5">
              <h3 className="font-display text-xl font-bold">Don't see your thing?</h3>
              <p className="mt-2 text-sm text-muted">Pitch a club. If five people want it, we'll help you start it.</p>
              <a href="#get-involved" className="mt-4 font-semibold text-brand underline underline-offset-4">Suggest a club</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Experiences, together.</h2>
            <p className="mt-2 text-muted">From sunrise runs to starlit camps, there's always something on.</p>
          </div>
          <Link to="/experiences" className="inline-flex items-center gap-1.5 font-semibold text-brand underline underline-offset-4">
            See all experiences <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => <ExperienceCard key={e.id} e={e} />)}
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Moments from the IMC archive</h2>
          <p className="mt-2 text-white/70">Is that you in the picture? Make your own memories.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[MEDIA.imcCircle, MEDIA.imcNature, MEDIA.imcArt, MEDIA.imcCrowd].map((src, i) => (
              <img key={src} src={src} alt="" loading="lazy" className={`h-full w-full rounded-xl object-cover ${i % 2 ? "aspect-[3/4] md:mt-8" : "aspect-[3/4]"}`} />
            ))}
          </div>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-ink hover:bg-brand hover:text-white">
            <Instagram className="h-4 w-4" /> Follow @imc.tirupati
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Voices of IMC</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <figure key={t.author} className="rounded-2xl border border-line bg-white p-6">
              <blockquote className="text-lg leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{t.author}</span> <span className="text-muted">· {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="get-involved" className="bg-peach py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your passion, our platform.</h2>
          <p className="mt-2 text-muted">Got an idea, a space or a skill? Let's build something for the city together.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {GET_INVOLVED.map((g) => (
              <div key={g.title} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-brand">{g.tag}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{g.title}</h3>
                <p className="mt-3 flex-1 text-muted">{g.text}</p>
                <a href={g.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-brand">
                  {g.cta} <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
