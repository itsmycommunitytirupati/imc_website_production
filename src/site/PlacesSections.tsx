import { useState } from "react";
import { ArrowUpRight, MapPin, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Link } from "../lib/router";
import { guideUrl, useLang } from "../lib/site";
import { useT } from "../lib/i18n";
import { BUDGET_LABEL, CHECKED, EATERIES, RIDES, STAYS, type Budget, type Source } from "../content/places";

const BUDGET_STYLE: Record<Budget, string> = {
  free: "bg-emerald-100 text-emerald-800",
  budget: "bg-sky-100 text-sky-800",
  mid: "bg-amber-100 text-amber-800",
  upscale: "bg-orange-100 text-orange-800",
  luxury: "bg-ink text-white",
};

function BudgetPill({ b }: { b: Budget }) {
  const t = useT();
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${BUDGET_STYLE[b]}`}>{t(BUDGET_LABEL[b])}</span>;
}

function Sources({ list }: { list: Source[] }) {
  const t = useT();
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
      <span className="font-semibold">{t("Sources")}:</span>
      {list.map((s) => (
        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline-offset-2 hover:text-brand hover:underline">
          {s.label} <ArrowUpRight className="h-3 w-3" />
        </a>
      ))}
    </p>
  );
}

function Header({ title, sub, prompt }: { title: string; sub: string; prompt: string }) {
  const t = useT();
  const [lang] = useLang();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h3 className="font-display text-2xl font-extrabold tracking-tight">{t(title)}</h3>
        <p className="mt-1 text-sm text-muted">{t(sub)} · {t("Checked")} {t(CHECKED)}</p>
      </div>
      <Link to={guideUrl(prompt, lang)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-brand">
        <Sparkles className="h-4 w-4" /> {t("Ask the guide for your best fit")}
      </Link>
    </div>
  );
}

const STAY_FILTERS: { id: Budget | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "budget", label: "Budget" },
  { id: "mid", label: "Mid-range" },
  { id: "upscale", label: "Upscale" },
  { id: "luxury", label: "Luxury" },
];

export function StaysByBudget() {
  const t = useT();
  const [filter, setFilter] = useState<Budget | "all">("all");
  const list = STAYS.filter((s) => filter === "all" || s.budget === filter);
  return (
    <div className="rounded-3xl bg-peach/60 p-5 sm:p-6">
      <Header title="Where to stay, by budget" sub="Popular, well-reviewed options" prompt="What's the best room for my budget, with good amenities?" />
      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto">
        {STAY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${filter === f.id ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-ink/30"}`}
          >
            {t(f.label)}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((s) => (
          <article key={s.name} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
            <BudgetPill b={s.budget} />
            <h4 className="mt-3 font-display text-lg font-bold leading-snug">{s.name}</h4>
            <p className="mt-1 flex gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {t(s.area)}</p>
            <p className="mt-3 text-sm font-semibold">{t(s.price)}</p>
            <p className="mt-1 text-sm"><span className="text-muted">{t("Best for")}:</span> {t(s.bestFor)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.amenities.map((a) => (
                <span key={a} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs">{t(a)}</span>
              ))}
            </div>
            {s.note && <p className="mt-3 text-xs leading-relaxed text-muted">{t(s.note)}</p>}
            <div className="mt-auto"><Sources list={s.sources} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function RidesByBudget() {
  const t = useT();
  return (
    <div className="rounded-3xl bg-peach/60 p-5 sm:p-6">
      <Header title="Getting up the hill, by budget" sub="From free buses to cabs" prompt="What's the best transport up to Tirumala for my budget?" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {RIDES.map((r) => (
          <article key={r.name} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <BudgetPill b={r.budget} />
            </div>
            <h4 className="mt-3 font-display text-lg font-bold leading-snug">{t(r.name)}</h4>
            <p className="mt-1 text-sm text-muted">{t(r.route)}</p>
            <p className="mt-3 text-sm font-semibold">{t(r.price)}</p>
            <p className="mt-1 text-sm"><span className="text-muted">{t("Best for")}:</span> {t(r.bestFor)}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {r.details.map((d) => <li key={d}>• {t(d)}</li>)}
            </ul>
            <div className="mt-auto"><Sources list={r.sources} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function WhereToEat() {
  const t = useT();
  const [lang] = useLang();
  return (
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">{t("Where to eat")}</h3>
          <p className="mt-1 text-sm text-muted">{t("Local favourites, mostly vegetarian")} · {t("Checked")} {t(CHECKED)}</p>
        </div>
        <Link to={guideUrl("Where can we eat?", lang)} className="inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4">
          <MessageCircleQuestion className="h-4 w-4" /> {t("Ask the guide")}
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {EATERIES.map((e) => (
          <li key={e.name} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-3">
            <BudgetPill b={e.budget} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t(e.name)}</p>
              <p className="text-sm text-muted">{t(e.area)} · {t(e.knownFor)}</p>
            </div>
            <a href={e.sources[0].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-muted hover:text-brand">
              {e.sources[0].label} <ArrowUpRight className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
