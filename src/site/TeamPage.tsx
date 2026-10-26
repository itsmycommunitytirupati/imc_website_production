import { Instagram } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { imageUrl, useApi, type TeamMember } from "../lib/api";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, LoadingCards } from "./kit";

const SECTIONS: { kind: TeamMember["kind"]; title: string }[] = [
  { kind: "core", title: "Core team" },
  { kind: "captain", title: "Community captains" },
  { kind: "host", title: "Hosts" },
  { kind: "volunteer", title: "Volunteers" },
];

export default function TeamPage() {
  usePageTitle("Team | IMC Tirupati", "Meet the people behind IMC Tirupati: the core team, community captains and hosts.");
  const t = useT();
  const { data, loading, error, reload } = useApi<{ team: TeamMember[] }>("/api/team");
  return (
    <>
      <PageHero eyebrow={t("Team")} title={t("The people who say hi first.")} sub={t("IMC runs on volunteers: a small core team, captains for every community, and hosts who make first-timers feel at home.")} image={IMC_PHOTOS.meetup5} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {loading ? (
          <LoadingCards count={8} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.team.length ? (
          <EmptyState />
        ) : (
          SECTIONS.map(({ kind, title }) => {
            const people = data.team.filter((m) => m.kind === kind);
            if (!people.length) return null;
            return (
              <div key={kind} className="mb-14">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">{t(title)}</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {people.map((m) => <PersonCard key={m.id} m={m} />)}
                </div>
              </div>
            );
          })
        )}
        <div className="rounded-3xl bg-ink p-8 text-center text-white">
          <p className="font-display text-2xl font-extrabold">{t("Want to host or captain a community?")}</p>
          <p className="mt-1 text-white/70">{t("Tell us what you'd run. We'll help with people, venue and promotion.")}</p>
          <Link to="/opportunities#propose" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-ink hover:bg-turmeric">{t("Propose an event")}</Link>
        </div>
      </section>
    </>
  );
}

export function PersonCard({ m }: { m: TeamMember }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <img src={imageUrl(m.photo, IMC_PHOTOS.meetup)} alt={m.name} loading="lazy" className="aspect-square w-full object-cover" />
      <div className="p-4">
        <p className="font-display text-lg font-extrabold leading-tight">{m.name}</p>
        <p className="mt-0.5 text-sm text-muted">{m.role}</p>
        {m.bio && <p className="mt-2 line-clamp-3 text-sm text-ink/80">{m.bio}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {m.group_slug && <Link to={`/communities/${m.group_slug}`} className="font-semibold text-brand hover:underline">{m.group_name}</Link>}
          {m.instagram && (
            <a href={`https://instagram.com/${m.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`Instagram: ${m.instagram}`} className="text-muted hover:text-brand">
              <Instagram className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
