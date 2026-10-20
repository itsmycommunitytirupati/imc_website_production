import { ArrowRight, ArrowUpRight, Check, MessageCircleQuestion } from "lucide-react";
import { Link } from "../lib/router";
import { OFFICIAL, guideUrl, useLang, usePageTitle } from "../lib/site";
import { TOPICS } from "../content/visitor";
import { GopuramIcon } from "./ui";

export default function VisitorGuidePage() {
  usePageTitle(
    "Visitor guide to Tirupati & Tirumala | IMC Tirupati",
    "Darshan options, getting around, parking, food, stays and things to do in Tirupati, from local people.",
  );
  const [lang] = useLang();
  return (
    <>
      <section className="bg-gradient-to-b from-peach/70 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Visitor guide</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Your visit, made simple.</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">Practical tips from people who live here. For bookings, timings and rules, always check the official TTD sources.</p>
          <nav className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Topics">
            {TOPICS.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-brand/40">
                {t.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {TOPICS.map((t) => (
            <section key={t.id} id={t.id}>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">{t.title}</h2>
              <p className="mt-2 text-muted">{t.summary}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {t.sections.map((s) => (
                  <div key={s.heading} className="rounded-2xl border border-line bg-white p-5">
                    <h3 className="font-semibold">{s.heading}</h3>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.askPrompts.map((p) => (
                  <Link key={p} to={guideUrl(p, lang)} className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white">
                    <MessageCircleQuestion className="h-4 w-4" /> {p}
                  </Link>
                ))}
              </div>
              {t.id === "things-to-do" && (
                <Link to="/experiences" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand underline underline-offset-4">
                  See what's on this week <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <p className="font-display text-xl font-bold">Still have a question?</p>
            <p className="mt-2 text-sm text-white/70">Ask the guide in your own words. No account needed.</p>
            <Link to={guideUrl(undefined, lang)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-semibold hover:bg-brand-dark">
              Ask guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-brand/20 bg-peach p-6">
            <GopuramIcon className="h-8 w-8 text-brand" />
            <p className="mt-3 font-display text-lg font-bold">Darshan bookings &amp; official updates</p>
            <p className="mt-1 text-sm text-muted">IMC is an independent community guide.</p>
            <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-brand">
              <a href={OFFICIAL.ttdBooking} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
                Official TTD bookings <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={OFFICIAL.ttdInfo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
                TTD information site <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
