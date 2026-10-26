import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { useApi, type StoryItem } from "../lib/api";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, LoadingCards, StoryCard } from "./kit";

export default function StoriesPage() {
  usePageTitle("Stories | IMC Tirupati", "Recaps and photos from IMC meetups in Tirupati, shared with consent.");
  const t = useT();
  const { data, loading, error, reload } = useApi<{ stories: StoryItem[] }>("/api/stories");
  return (
    <>
      <PageHero eyebrow={t("Memory wall")} title={t("Proof that we actually touched grass this weekend.")} sub={t("Recaps from IMC meetups. Every photo is shared with the consent of the people in it.")} image={IMC_PHOTOS.outdoorSelfie} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {loading ? (
          <LoadingCards count={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.stories.length ? (
          <EmptyState />
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {data.stories.map((s) => <StoryCard key={s.slug} s={s} />)}
          </div>
        )}
        <div className="mt-10 rounded-3xl bg-white p-6 text-center ring-1 ring-line">
          <p className="font-semibold">{t("Spotted yourself? Tag a friend, or ask us to take it down.")}</p>
          <p className="mt-1 text-sm text-muted">{t("We remove any photo on request, no questions asked.")}</p>
          <Link to="/report?type=photo_removal" className="mt-4 inline-flex rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-brand">{t("Request photo removal")}</Link>
        </div>
      </section>
    </>
  );
}
