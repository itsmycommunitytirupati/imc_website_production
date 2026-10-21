import { useEffect, useState, type ComponentType } from "react";
import { ArrowRight, ArrowUpRight, Bus, Check, Luggage, MapPinned, MessageCircleQuestion, Soup, UtensilsCrossed, Vault } from "lucide-react";
import { Link } from "../lib/router";
import { OFFICIAL, guideUrl, useLang, usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { FREE_ON_THE_HILL, JOURNEY, TOPICS, type TopicId } from "../content/visitor";
import { MEDIA } from "../content/media";
import { IMC_PHOTOS } from "../content/photos";
import { GopuramIcon, PageHero } from "./ui";
import Reveal from "./Reveal";
import { RidesByBudget, StaysByBudget, WhereToEat } from "./PlacesSections";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

const TOPIC_LOOK: Record<TopicId, { image: string; Icon: IconType }> = {
  tirumala: { image: MEDIA.hills.src, Icon: GopuramIcon },
  "getting-around": { image: MEDIA.townView, Icon: Bus },
  "food-stays": { image: MEDIA.dosa, Icon: UtensilsCrossed },
  "things-to-do": { image: IMC_PHOTOS.waterfall, Icon: MapPinned },
};

const FREE_ICONS: IconType[] = [Soup, Bus, Luggage, Vault];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = TOPICS.map((t) => t.id);

export default function VisitorGuidePage() {
  usePageTitle(
    "Visitor guide to Tirupati & Tirumala | IMC Tirupati",
    "Darshan options, getting around, parking, food, stays and things to do in Tirupati, from local people.",
  );
  const t = useT();
  const [lang] = useLang();
  const active = useActiveSection(IDS);

  return (
    <>
      <PageHero
        eyebrow={t("Visitor guide")}
        title={<>{t("Your visit,")} <span className="text-orange-300">{t("made simple.")}</span></>}
        sub={t("Practical tips from people who live here. For bookings, timings and rules, always check the official TTD sources.")}
        image={MEDIA.hills.src}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={guideUrl(undefined, lang)} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold transition hover:bg-orange-600">
            {t("Ask guide")} <ArrowRight className="h-4 w-4" />
          </Link>
          <a href={OFFICIAL.ttdBooking} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20">
            {t("Visit official TTD site")} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </PageHero>

      <nav className="sticky top-16 z-30 border-b border-line bg-cream/90 backdrop-blur-xl md:top-20" aria-label={t("Topics")}>
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {TOPICS.map((topic) => {
            const { Icon } = TOPIC_LOOK[topic.id];
            const on = active === topic.id;
            return (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white shadow-md" : "bg-white text-ink ring-1 ring-line hover:ring-brand/40"}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} /> {t(topic.title)}
              </a>
            );
          })}
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Your journey up the hills")}</h2>
          <p className="mt-2 text-muted">{t("How a Tirumala visit usually flows, from arrival to the last blessing.")}</p>
        </Reveal>
        <ol className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-3">
          <span className="absolute left-5 top-2 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-brand to-orange-200 sm:hidden xl:left-0 xl:top-5 xl:block xl:h-0.5 xl:w-full xl:bg-gradient-to-r" aria-hidden="true" />
          {JOURNEY.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06} className="relative flex gap-4 xl:flex-col xl:gap-3">
              <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-extrabold shadow-md ring-4 ring-cream ${i === 4 ? "bg-brand text-white" : "bg-white text-brand"}`}>
                {i === 4 ? <GopuramIcon className="h-5 w-5" /> : i + 1}
              </span>
              <span>
                <span className="block font-display font-bold leading-tight">{t(step.title)}</span>
                <span className="mt-1 block text-sm text-muted">{t(step.text)}</span>
              </span>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-ink py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_2.2fr] lg:items-center">
          <div>
            <p className="font-hand text-2xl text-orange-300">{t("Good to know")}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Free on the hill")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {FREE_ON_THE_HILL.map((f, i) => {
              const Icon = FREE_ICONS[i];
              return (
                <div key={f.title} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-orange-300" strokeWidth={1.8} />
                  <p className="mt-3 font-semibold">{t(f.title)}</p>
                  <p className="mt-1 text-sm text-white/60">{t(f.text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6">
        {TOPICS.map((topic) => {
          const { image, Icon } = TOPIC_LOOK[topic.id];
          return (
            <section key={topic.id} id={topic.id} className="grid gap-8 lg:grid-cols-[400px_1fr]">
              <Reveal className="lg:sticky lg:top-40 lg:self-start">
                <div className="relative overflow-hidden rounded-[28px] shadow-xl">
                  <img src={image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Icon className="h-5 w-5" /></span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{t(topic.title)}</h2>
                    <p className="mt-1 text-white/75">{t(topic.summary)}</p>
                  </div>
                </div>
              </Reveal>
              <div className="space-y-4">
                {topic.sections.map((s, i) => (
                  <Reveal key={s.heading} delay={i * 0.06} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                    <h3 className="font-display text-xl font-bold">{t(s.heading)}</h3>
                    <ul className="mt-4 space-y-3 leading-relaxed">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Check className="h-3 w-3" strokeWidth={3} /></span>
                          <span className="text-ink/85">{t(p)}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  {topic.askPrompts.map((p) => (
                    <Link key={p} to={guideUrl(p, lang)} className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">
                      <MessageCircleQuestion className="h-4 w-4" /> {t(p)}
                    </Link>
                  ))}
                  {topic.id === "things-to-do" && (
                    <Link to="/experiences" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-brand">
                      {t("See what's on this week")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                {topic.id === "getting-around" && <Reveal><RidesByBudget /></Reveal>}
                {topic.id === "food-stays" && (
                  <>
                    <Reveal><StaysByBudget /></Reveal>
                    <Reveal><WhereToEat /></Reveal>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal className="grid items-center gap-6 overflow-hidden rounded-[32px] bg-peach p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-5">
            <GopuramIcon className="hidden h-14 w-14 shrink-0 text-brand sm:block" />
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">{t("Darshan bookings & official updates")}</h2>
              <p className="mt-2 max-w-xl text-muted">{t("IMC is an independent community guide. Book darshan and rooms only on the official TTD portal.")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={OFFICIAL.ttdBooking} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white hover:bg-brand-dark">
              {t("Official TTD bookings")} <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href={OFFICIAL.ttdInfo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold ring-1 ring-line hover:ring-brand/40">
              {t("TTD information site")} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
