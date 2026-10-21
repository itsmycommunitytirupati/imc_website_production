import { lazy, Suspense } from "react";
import { Link, useLocation, navigate } from "./lib/router";
import { useT } from "./lib/i18n";
import { GopuramIcon, SiteShell } from "./site/ui";
import HomePage from "./site/HomePage";
import MaintenancePage from "./components/Maintenance";
import { IS_MAINTENANCE } from "./config/Maintenance";

// Everything but the home page loads on demand, so the first visit stays fast.
const CommunityPage = lazy(() => import("./site/CommunityPage"));
const ExperiencesPage = lazy(() => import("./site/ExperiencesPage"));
const VisitorGuidePage = lazy(() => import("./site/VisitorGuidePage"));
const SavedPage = lazy(() => import("./site/SavedPage"));
const GuideApp = lazy(() => import("./guide/GuideApp"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const LegalPage = lazy(() => import("./components/LegalPage"));

// One build serves three surfaces. The hostname picks the surface in
// production; /guide and /admin let previews and workers.dev reach them too.
//   imctirupati.com        -> site (visitor guide, experiences, community)
//   help.imctirupati.com   -> guide (AI assistant)
//   admin.imctirupati.com  -> admin
type Surface = "site" | "guide" | "admin";

function surfaceFor(host: string, path: string): Surface {
  if (host.startsWith("help.")) return "guide";
  if (host.startsWith("admin.")) return "admin";
  if (path === "/guide" || path.startsWith("/guide/")) return "guide";
  if (path === "/admin" || path.startsWith("/admin/")) return "admin";
  return "site";
}

function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading">
      <GopuramIcon className="h-10 w-10 animate-pulse text-brand" />
    </div>
  );
}

export default function App() {
  const { path } = useLocation();
  if (IS_MAINTENANCE) return <MaintenancePage />;

  const surface = surfaceFor(window.location.hostname, path);
  if (surface !== "site" || path === "/privacy" || path === "/terms") {
    return (
      <Suspense fallback={<Loading />}>
        {surface === "guide" ? <GuideApp /> : surface === "admin" ? <AdminApp /> : <LegalPage onBack={() => navigate("/")} />}
      </Suspense>
    );
  }

  return (
    <SiteShell>
      <Suspense fallback={<Loading />}>
        <SitePage path={path} />
      </Suspense>
    </SiteShell>
  );
}

function SitePage({ path }: { path: string }) {
  switch (path) {
    case "/":
      return <HomePage />;
    case "/visitor-guide":
      return <VisitorGuidePage />;
    case "/experiences":
      return <ExperiencesPage />;
    case "/community":
      return <CommunityPage />;
    case "/saved":
      return <SavedPage />;
    default:
      return <NotFound />;
  }
}

function NotFound() {
  const t = useT();
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <GopuramIcon className="mx-auto h-16 w-16 text-brand" />
      <p className="mt-6 font-display text-7xl font-extrabold tracking-tighter text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold">{t("This page took a different ghat road.")}</h1>
      <p className="mt-2 text-muted">{t("Let's get you back on the right path.")}</p>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-brand">{t("Back home")}</Link>
    </section>
  );
}
