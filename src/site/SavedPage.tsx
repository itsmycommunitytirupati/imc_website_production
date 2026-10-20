import { Bookmark } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle, useSaved } from "../lib/site";
import { EXPERIENCES } from "../content/experiences";
import ExperienceCard from "./ExperienceCard";

export default function SavedPage() {
  usePageTitle("Saved | IMC Tirupati");
  const [saved] = useSaved();
  const list = EXPERIENCES.filter((e) => saved.includes(e.id));
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Saved</h1>
      <p className="mt-2 text-muted">Saved on this device. No account needed.</p>
      {list.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <ExperienceCard key={e.id} e={e} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-brand" />
          <p className="mt-3 font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted">Tap the bookmark on any experience to keep it here.</p>
          <Link to="/experiences" className="mt-5 inline-block rounded-lg bg-brand px-4 py-2.5 font-semibold text-white">Browse experiences</Link>
        </div>
      )}
    </section>
  );
}
