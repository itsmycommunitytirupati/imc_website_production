import { Link, useLocation } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { CATEGORIES, EXPERIENCES, type Category } from "../content/experiences";
import ExperienceCard from "./ExperienceCard";

export default function ExperiencesPage() {
  usePageTitle(
    "Experiences in Tirupati | IMC Tirupati",
    "Music evenings, food walks, treks, runs and workshops in Tirupati. Open to locals and visitors.",
  );
  const { search } = useLocation();
  const active = search.get("c") as Category | null;
  const list = active ? EXPERIENCES.filter((e) => e.category === active) : EXPERIENCES;

  const chip = (selected: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${selected ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Experiences</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Hosted by IMC clubs and open to locals and visitors alike. Tap “I'm in” and we'll confirm on WhatsApp.
      </p>
      <div className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link to="/experiences" className={chip(!active)} aria-current={!active ? "true" : undefined}>All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/experiences?c=${c.id}`} className={chip(active === c.id)} aria-current={active === c.id ? "true" : undefined}>
            {c.label}
          </Link>
        ))}
      </div>
      {list.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <ExperienceCard key={e.id} e={e} />)}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          Nothing scheduled here yet. <Link to="/community#get-involved" className="font-semibold text-brand underline">Host one?</Link>
        </p>
      )}
    </section>
  );
}
