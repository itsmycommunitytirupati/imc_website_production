import { ArrowUpRight, Clock, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { CATEGORIES, EXPERIENCES, formatDate, type Category, type Experience } from "../content/experiences";
import { POSTER_STYLES } from "../content/community";
import { IMC_PHOTOS } from "../content/photos";
import ExperienceCard, { DateBlock, joinLink } from "./ExperienceCard";
import { PageHero } from "./ui";
import Reveal from "./Reveal";

const DAY = 86_400_000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysUntil(iso: string) {
  return Math.round((new Date(iso + "T00:00:00").getTime() - startOfToday()) / DAY);
}

// Group by how soon: this week (next 7 days), next week, then everything later.
function groupBySoon(list: Experience[]) {
  const groups: { label: string; items: Experience[] }[] = [
    { label: "This week", items: [] },
    { label: "Next week", items: [] },
    { label: "Coming up", items: [] },
  ];
  for (const e of list) {
    const d = daysUntil(e.date);
    groups[d < 7 ? 0 : d < 14 ? 1 : 2].items.push(e);
  }
  return groups.filter((g) => g.items.length);
}

export default function ExperiencesPage() {
  usePageTitle(
    "Experiences in Tirupati | IMC Tirupati",
    "Music evenings, food walks, treks, runs and workshops in Tirupati. Open to locals and visitors.",
  );
  const t = useT();
  const { search } = useLocation();
  const active = search.get("c") as Category | null;
  const upcoming = [...EXPERIENCES].filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const list = active ? upcoming.filter((e) => e.category === active) : upcoming;
  const featured = upcoming[0];

  const chip = (selected: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${selected ? "bg-ink text-white shadow-md" : "bg-white ring-1 ring-line hover:ring-ink/30"}`;

  return (
    <>
      <PageHero
        eyebrow={t("Experiences")}
        title={<>{t("Something new,")} <span className="text-orange-300">{t("every week.")}</span></>}
        sub={t("Hosted by IMC clubs and open to locals and visitors alike. Tap “I'm in” and we'll confirm on WhatsApp.")}
        image={IMC_PHOTOS.hilltop}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {[`${upcoming.length} ${t("coming up")}`, t("Most are free or under ₹500"), t("Come alone, leave with friends")].map((s) => (
            <span key={s} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur">{s}</span>
          ))}
        </div>
      </PageHero>

      {featured && !active && (
        <section className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6">
          <Reveal className="relative grid overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-black/10 ring-1 ring-line md:grid-cols-[1.2fr_1fr]">
            <div className="relative min-h-64">
              <img src={featured.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-turmeric px-3 py-1.5 text-sm font-bold shadow">
                <Sparkles className="h-4 w-4" /> {t("This week's pick")}
              </span>
            </div>
            <div className="flex flex-col p-7 sm:p-10">
              <div className="flex items-center gap-4">
                <DateBlock iso={featured.date} />
                <span className="text-sm font-semibold text-brand">
                  {daysUntil(featured.date) === 0 ? t("Today") : daysUntil(featured.date) === 1 ? t("Tomorrow") : `${t("In")} ${daysUntil(featured.date)} ${t("days")}`}
                </span>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand">{featured.club}</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{featured.title}</h2>
              <p className="mt-3 text-muted">{t(featured.blurb)}</p>
              <div className="mt-5 space-y-1.5 text-sm">
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-ink/40" /> {formatDate(featured.date)} · {featured.time}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink/40" /> {featured.venue}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                <span className="font-display text-2xl font-extrabold">{t(featured.price)}</span>
                <a href={joinLink(featured)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-dark">
                  <MessageCircle className="h-4 w-4" /> {t("I'm in")}
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <div className="sticky top-16 z-30 mt-10 border-b border-line bg-cream/90 backdrop-blur-xl md:top-20">
        <div className="scrollbar-none mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          <Link to="/experiences" className={chip(!active)} aria-current={!active ? "true" : undefined}>✨ {t("All")}</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/experiences?c=${c.id}`} className={chip(active === c.id)} aria-current={active === c.id ? "true" : undefined}>
              {POSTER_STYLES[c.id].emoji} {t(c.label)}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {list.length ? (
          groupBySoon(list).map((g) => (
            <section key={g.label} className="mb-14">
              <div className="mb-6 flex items-baseline gap-3">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">{t(g.label)}</h2>
                <span className="text-sm font-semibold text-muted">{g.items.length}</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((e, i) => (
                  <Reveal key={e.id} delay={(i % 3) * 0.06}>
                    <ExperienceCard e={e} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-white p-10 text-center text-muted">
            {t("Nothing scheduled here yet.")} <Link to="/community#get-involved" className="font-semibold text-brand underline">{t("Host one?")}</Link>
          </p>
        )}

        <Reveal className="grid items-center gap-6 overflow-hidden rounded-[32px] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-hand text-2xl text-orange-300">{t("Got an idea?")}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Host your own experience.")}</h2>
            <p className="mt-2 max-w-xl text-white/70">{t("A walk, a workshop, a jam? Bring the idea; we'll help with people, venue and promotion.")}</p>
          </div>
          <a href={`${CONTACT.whatsapp}?text=${encodeURIComponent("Hi IMC! I'd like to host an experience.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink hover:bg-turmeric">
            {t("Start something")} <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </>
  );
}
