import { ArrowLeft } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { formatWhen, photoUrl, useApi, type EventItem, type StoryItem } from "../lib/api";
import { ErrorState, EventCard, NotFound, SampleBadge, ShareButton } from "./kit";

export default function StoryPage({ slug }: { slug: string }) {
  const t = useT();
  const { data, loading, error, reload } = useApi<{ story: StoryItem; next: EventItem[] }>(`/api/stories/${slug}`);
  const s = data?.story;
  usePageTitle(s ? `${s.title} | IMC Tirupati` : "Story | IMC Tirupati", s?.summary);

  if (loading) return <div className="mx-auto h-[70vh] max-w-4xl animate-pulse px-4 py-10"><div className="h-80 rounded-3xl bg-stone-200" /></div>;
  if (error?.status === 404) return <NotFound />;
  if (error || !s || !data) return <div className="mx-auto max-w-xl px-4 py-20"><ErrorState error={error} onRetry={reload} /></div>;

  const [cover, ...rest] = s.photos;
  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Link to="/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft className="h-4 w-4" /> {t("Memory wall")}</Link>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        {s.group_slug && <Link to={`/communities/${s.group_slug}`} className="font-semibold text-brand">{s.group_name}</Link>}
        <span>{formatWhen(`${s.event_date}T12:00`, { day: "numeric", month: "long", year: "numeric" })}</span>
        {s.is_sample === 1 && <SampleBadge />}
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{s.title}</h1>
      <p className="mt-3 text-xl text-muted">{s.summary}</p>
      {cover && <img src={photoUrl(cover)} alt="" className="mt-8 aspect-[16/10] w-full rounded-3xl object-cover shadow-xl" />}
      {s.body && <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/85">{s.body}</div>}
      {rest.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rest.map((p) => <img key={p} src={photoUrl(p)} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />)}
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <ShareButton title={s.title} path={`/stories/${s.slug}`} kind="story" />
        <Link to={`/report?type=photo_removal&about=${encodeURIComponent(`Story: ${s.title}`)}`} className="text-sm text-muted underline-offset-4 hover:underline">{t("In a photo? Request removal")}</Link>
      </div>
      <p className="mt-3 text-xs text-muted">{t("Photos shared with the consent of the people in them. We never publish attendee lists.")}</p>

      {data.next.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold">{t("Be in the next one")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">{data.next.map((e) => <EventCard key={e.slug} e={e} />)}</div>
        </section>
      )}
    </article>
  );
}
