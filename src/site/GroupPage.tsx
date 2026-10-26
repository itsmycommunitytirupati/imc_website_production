import { ArrowLeft, CalendarDays, Info, UserRound } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { imageUrl, useApi, type EventItem, type GalleryPhoto, type GroupItem, type StoryItem } from "../lib/api";
import { logoFor } from "../content/logos";
import { EmptyState, ErrorState, EventCard, GroupLogo, NotFound, SampleBadge, ShareButton, StoryCard } from "./kit";
import { JoinForm, INTERESTS } from "./JoinPage";

export default function GroupPage({ slug }: { slug: string }) {
  const t = useT();
  const { data, loading, error, reload } = useApi<{ group: GroupItem; events: EventItem[]; stories: StoryItem[] }>(`/api/groups/${slug}`);
  const g = data?.group;
  const gallery = useApi<{ photos: GalleryPhoto[] }>(`/api/gallery?group=${slug}&limit=8`);
  usePageTitle(g ? `${g.name} | IMC Tirupati` : "Community | IMC Tirupati", g?.tagline);

  if (loading) return <div className="mx-auto h-[70vh] max-w-7xl animate-pulse px-4 py-10 sm:px-6"><div className="h-64 rounded-3xl bg-stone-200" /></div>;
  if (error?.status === 404) return <NotFound />;
  if (error || !g || !data) return <div className="mx-auto max-w-xl px-4 py-20"><ErrorState error={error} onRetry={reload} /></div>;

  const logo = logoFor(g.slug);
  const label = (id: string) => INTERESTS.find((i) => i.id === id);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={logo?.banner ? logo.url : imageUrl(g.image)} alt="" className={`absolute inset-0 h-full w-full object-cover ${logo?.banner ? "opacity-35" : "opacity-40"}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
          <Link to="/communities" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("All communities")}</Link>
          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
            <span className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl bg-white shadow-2xl ring-4 ring-white sm:h-36 sm:w-36">
              <GroupLogo slug={g.slug} image={g.image} className="h-full w-full" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/40">● {t(g.status === "active" ? "Active" : g.status === "forming" ? "Forming" : "Paused")}</span>
                {g.is_sample === 1 && <SampleBadge />}
              </div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">{g.name}</h1>
              <p className="mt-2 text-lg text-white/80">{g.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:py-14">
        <div className="min-w-0">
          <p className="text-lg leading-relaxed text-ink/85">{g.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {g.interests.map((i) => (
              <span key={i} className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-line">{label(i)?.emoji} {t(label(i)?.label ?? i)}</span>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
              <UserRound className="h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm"><span className="block font-semibold">{g.owner_name}</span><span className="text-muted">{g.owner_role}</span></p>
            </div>
            {g.joining_note && (
              <div className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                <Info className="h-5 w-5 shrink-0 text-brand" />
                <p className="text-sm"><span className="block font-semibold">{t("Who it's for")}</span><span className="text-muted">{g.joining_note}</span></p>
              </div>
            )}
          </div>

          <h2 className="mt-12 flex items-center gap-2 font-display text-2xl font-extrabold"><CalendarDays className="h-6 w-6 text-brand" /> {t("Coming up")}</h2>
          <div className="mt-5">
            {data.events.length ? (
              <div className="grid gap-5 sm:grid-cols-2">{data.events.map((e) => <EventCard key={e.slug} e={e} />)}</div>
            ) : (
              <EmptyState title={t("Next meetup being planned")} action={<Link to="/opportunities#propose" className="font-semibold text-brand underline">{t("Propose one")}</Link>} />
            )}
          </div>

          {(gallery.data?.photos.length ?? 0) > 0 && (
            <>
              <div className="mt-12 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl font-extrabold">{t("Photos")}</h2>
                <Link to="/gallery" className="text-sm font-semibold text-brand hover:underline">{t("Full gallery")}</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gallery.data!.photos.map((p) => <img key={p.id} src={imageUrl(p.image)} alt={p.alt || p.caption} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />)}
              </div>
            </>
          )}

          {data.stories.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-2xl font-extrabold">{t("From past meetups")}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">{data.stories.map((s) => <StoryCard key={s.slug} s={{ ...s, group_name: g.name }} />)}</div>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 font-display text-2xl font-extrabold">{t("Join this community")}</p>
          <JoinForm preset={g.slug} compact />
          <div className="mt-4 flex justify-center"><ShareButton title={g.name} path={`/communities/${g.slug}`} kind="group" /></div>
        </aside>
      </div>
    </>
  );
}
