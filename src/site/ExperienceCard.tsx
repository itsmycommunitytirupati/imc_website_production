import { Bookmark, CalendarDays, MapPin, MessageCircle } from "lucide-react";
import { CONTACT, useSaved } from "../lib/site";
import { categoryLabel, formatDate, type Experience } from "../content/experiences";

export function joinLink(e: Experience) {
  const text = `Hi IMC! I'd like to join "${e.title}" on ${formatDate(e.date)}.`;
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export default function ExperienceCard({ e }: { e: Experience }) {
  const [saved, toggle] = useSaved();
  const isSaved = saved.includes(e.id);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="relative">
        <img src={e.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold">{categoryLabel(e.category)}</span>
        <button
          onClick={() => toggle(e.id)}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full ${isSaved ? "bg-brand text-white" : "bg-white/95 text-ink"}`}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${e.title} from saved` : `Save ${e.title}`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{e.club}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug">{e.title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{e.blurb}</p>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-ink/50" aria-hidden="true" />
            <dt className="sr-only">When</dt>
            <dd>
              {e.recurring ? `${e.recurring} · next ${formatDate(e.date)}` : formatDate(e.date)} · {e.time}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink/50" aria-hidden="true" />
            <dt className="sr-only">Where</dt>
            <dd>{e.venue}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="font-semibold">{e.price}</span>
          <a href={joinLink(e)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand">
            <MessageCircle className="h-4 w-4" /> I'm in
          </a>
        </div>
      </div>
    </article>
  );
}
