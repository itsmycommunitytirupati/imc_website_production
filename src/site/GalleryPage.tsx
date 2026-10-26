import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { imageUrl, useApi, type GalleryPhoto } from "../lib/api";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, LoadingCards } from "./kit";

export default function GalleryPage() {
  usePageTitle("Gallery | IMC Tirupati", "Photos from IMC meetups, treks, music nights and more in Tirupati, shared with consent.");
  const t = useT();
  const { data, loading, error, reload } = useApi<{ photos: GalleryPhoto[] }>("/api/gallery?limit=300");
  const [group, setGroup] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const photos = useMemo(() => (data?.photos ?? []).filter((p) => !group || p.group_slug === group), [data, group]);
  const groups = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of data?.photos ?? []) if (p.group_slug && p.group_name) seen.set(p.group_slug, p.group_name);
    return [...seen];
  }, [data]);
  const chip = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-brand/40"}`;

  return (
    <>
      <PageHero eyebrow={t("Gallery")} title={t("Proof that we actually touched grass this weekend.")} sub={t("Moments from IMC meetups around Tirupati. Every photo is shared with the consent of the people in it.")} image={IMC_PHOTOS.danceCrowd3} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
            <button onClick={() => setGroup("")} className={chip(!group)} aria-pressed={!group}>{t("All")}</button>
            {groups.map(([slug, name]) => (
              <button key={slug} onClick={() => setGroup(slug)} className={chip(group === slug)} aria-pressed={group === slug}>{name}</button>
            ))}
          </div>
          <Link to="/stories" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">{t("Read the stories")}</Link>
        </div>
        <div className="mt-8">
          {loading ? (
            <LoadingCards count={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : !photos.length ? (
            <EmptyState />
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3 [&>*]:break-inside-avoid">
              {photos.map((p, i) => (
                <button key={p.id} onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl bg-stone-200 text-left">
                  <img src={imageUrl(p.image)} alt={p.alt || p.caption} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
                  {(p.caption || p.group_name) && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      {p.caption}
                      {p.group_name && <span className="block text-xs font-normal text-white/75">{p.group_name}</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-8 text-sm text-muted">
          {t("Spotted yourself? Tag a friend, or ask us to take it down.")}{" "}
          <Link to="/report?type=photo_removal" className="font-semibold text-brand underline underline-offset-4">{t("Request removal")}</Link>
        </p>
      </section>
      {open !== null && photos[open] && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({ photos, index, onIndex, onClose }: { photos: GalleryPhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const t = useT();
  const p = photos[index];
  const go = (d: number) => onIndex((index + d + photos.length) % photos.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label={p.caption || t("Photo")} onClick={onClose}>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/70">{index + 1} / {photos.length}</span>
        <button onClick={onClose} aria-label={t("Close")} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="h-5 w-5" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => go(-1)} aria-label={t("Previous photo")} className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-6"><ChevronLeft className="h-6 w-6" /></button>
        <img src={imageUrl(p.image)} alt={p.alt || p.caption} className="max-h-full max-w-full rounded-lg object-contain" />
        <button onClick={() => go(1)} aria-label={t("Next photo")} className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-6"><ChevronRight className="h-6 w-6" /></button>
      </div>
      <div className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
        {p.caption && <p className="font-semibold">{p.caption}</p>}
        {p.group_slug && <Link to={`/communities/${p.group_slug}`} className="text-sm text-turmeric hover:underline">{p.group_name}</Link>}
        <p className="mt-2">
          <Link to={`/report?type=photo_removal&about=${encodeURIComponent(`Gallery photo #${p.id}${p.caption ? `: ${p.caption}` : ""}`)}`} className="text-xs text-white/60 underline-offset-4 hover:underline">{t("In a photo? Request removal")}</Link>
        </p>
      </div>
    </div>
  );
}
