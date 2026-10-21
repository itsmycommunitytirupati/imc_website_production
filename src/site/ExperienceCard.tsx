import { Bookmark, Clock, MapPin, MessageCircle } from "lucide-react";
import { CONTACT, useSaved } from "../lib/site";
import { useT } from "../lib/i18n";
import { categoryLabel, formatDate, type Experience } from "../content/experiences";
import { POSTER_STYLES } from "../content/community";

export function joinLink(e: Experience) {
  const text = `Hi IMC! I'd like to join "${e.title}" on ${formatDate(e.date)}.`;
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function DateBlock({ iso, className = "" }: { iso: string; className?: string }) {
  const d = new Date(iso + "T00:00:00");
  return (
    <span className={`inline-flex flex-col items-center rounded-xl bg-white px-2.5 py-1.5 text-center leading-none text-ink shadow-md ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
      <span className="font-display text-2xl font-extrabold">{d.getDate()}</span>
      <span className="text-[10px] font-semibold uppercase text-muted">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
    </span>
  );
}

export default function ExperienceCard({ e }: { e: Experience }) {
  const t = useT();
  const [saved, toggle] = useSaved();
  const isSaved = saved.includes(e.id);
  const look = POSTER_STYLES[e.category];
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img src={e.image} alt="" loading="lazy" className="aspect-[16/11] w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <DateBlock iso={e.date} className="absolute left-3 top-3" />
        <button
          onClick={() => toggle(e.id)}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full shadow-md transition active:scale-90 ${isSaved ? "bg-brand text-white" : "bg-white/95 text-ink hover:bg-white"}`}
          aria-pressed={isSaved}
          aria-label={isSaved ? `${t("Remove from saved")}: ${e.title}` : `${t("Save")}: ${e.title}`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: look.accent, color: look.bg }}>
          {look.emoji} {t(categoryLabel(e.category))}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{e.club}</p>
        <h3 className="mt-1 font-display text-xl font-extrabold leading-snug tracking-tight">{e.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t(e.blurb)}</p>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink/40" aria-hidden="true" />
            <dt className="sr-only">{t("When")}</dt>
            <dd>{e.recurring ? `${t(e.recurring)} · ` : ""}{formatDate(e.date)} · {e.time}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink/40" aria-hidden="true" />
            <dt className="sr-only">{t("Where")}</dt>
            <dd className="truncate">{e.venue}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="font-display text-lg font-extrabold">{t(e.price)}</span>
          <a href={joinLink(e)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand active:scale-95">
            <MessageCircle className="h-4 w-4" /> {t("I'm in")}
          </a>
        </div>
      </div>
    </article>
  );
}
