import { ArrowRight, Bookmark } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle, useSaved } from "../lib/site";
import { useT } from "../lib/i18n";
import { EXPERIENCES } from "../content/experiences";
import { IMC_PHOTOS } from "../content/photos";
import ExperienceCard from "./ExperienceCard";

export default function SavedPage() {
  usePageTitle("Saved | IMC Tirupati");
  const t = useT();
  const [saved] = useSaved();
  const list = EXPERIENCES.filter((e) => saved.includes(e.id));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
      <p className="font-hand text-2xl text-brand">{t("Your shortlist")}</p>
      <h1 className="font-display text-5xl font-extrabold tracking-[-0.04em]">{t("Saved")}</h1>
      <p className="mt-2 text-muted">{t("Saved on this device. No account needed.")}</p>
      {list.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <ExperienceCard key={e.id} e={e} />)}
        </div>
      ) : (
        <div className="relative mt-10 overflow-hidden rounded-[32px] bg-ink text-white">
          <img src={IMC_PHOTOS.outdoorSelfie} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/30" />
          <div className="relative max-w-lg p-8 sm:p-12">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><Bookmark className="h-5 w-5" /></span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight">{t("Nothing saved yet")}</h2>
            <p className="mt-2 text-white/75">{t("Tap the bookmark on any experience to keep it here.")}</p>
            <Link to="/experiences" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink hover:bg-turmeric">
              {t("Browse experiences")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
