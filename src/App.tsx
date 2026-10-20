import { useLocation, navigate } from "./lib/router";
import { SiteShell } from "./site/ui";
import HomePage from "./site/HomePage";
import CommunityPage from "./site/CommunityPage";
import ExperiencesPage from "./site/ExperiencesPage";
import VisitorGuidePage from "./site/VisitorGuidePage";
import SavedPage from "./site/SavedPage";
import GuideApp from "./guide/GuideApp";
import AdminApp from "./admin/AdminApp";
import LegalPage from "./components/LegalPage";
import MaintenancePage from "./components/Maintenance";
import { IS_MAINTENANCE } from "./config/Maintenance";

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

export default function App() {
  const { path } = useLocation();
  if (IS_MAINTENANCE) return <MaintenancePage />;

  const surface = surfaceFor(window.location.hostname, path);
  if (surface === "guide") return <GuideApp />;
  if (surface === "admin") return <AdminApp />;

  // The legal page keeps its own full-page layout from the previous site.
  if (path === "/privacy" || path === "/terms") return <LegalPage onBack={() => navigate("/")} />;

  return (
    <SiteShell>
      <SitePage path={path} />
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
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold">This page took a different ghat road.</h1>
      <a href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 font-semibold text-white">Back home</a>
    </section>
  );
}
