import { lazy, Suspense, useEffect } from "react";
import { useLocation, navigate } from "./lib/router";
import { trackReturnVisit } from "./lib/analytics";
import { GopuramIcon, SiteShell } from "./site/ui";
import HomePage from "./site/HomePage";
import { NotFound } from "./site/kit";
import MaintenancePage from "./components/Maintenance";
import { IS_MAINTENANCE } from "./config/Maintenance";

// Everything but the home page loads on demand, so the first visit stays fast.
const DiscoverPage = lazy(() => import("./site/DiscoverPage"));
const CommunitiesPage = lazy(() => import("./site/CommunityPage"));
const GroupPage = lazy(() => import("./site/GroupPage"));
const EventsPage = lazy(() => import("./site/EventsPage"));
const EventPage = lazy(() => import("./site/EventPage"));
const JoinPage = lazy(() => import("./site/JoinPage"));
const AddaPage = lazy(() => import("./site/AddaPage"));
const OpportunitiesPage = lazy(() => import("./site/OpportunitiesPage"));
const StoriesPage = lazy(() => import("./site/StoriesPage"));
const StoryPage = lazy(() => import("./site/StoryPage"));
const ReportPage = lazy(() => import("./site/ReportPage"));
const VisitorGuidePage = lazy(() => import("./site/VisitorGuidePage"));
const SavedPage = lazy(() => import("./site/SavedPage"));
const GuideApp = lazy(() => import("./guide/GuideApp"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const LegalPage = lazy(() => import("./components/LegalPage"));

// One build serves three surfaces. The hostname picks the surface in
// production; /guide and /admin let previews and workers.dev reach them too.
//   imctirupati.com        -> site (community home, events, discover)
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

// Old addresses keep working after the brief's navigation change.
const REDIRECTS: Record<string, string> = { "/experiences": "/events", "/community": "/communities" };

function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading">
      <GopuramIcon className="h-10 w-10 animate-pulse text-brand" />
    </div>
  );
}

export default function App() {
  const { path } = useLocation();
  useEffect(() => trackReturnVisit(), []);
  useEffect(() => {
    const to = REDIRECTS[path];
    if (to) {
      const q = new URLSearchParams(window.location.search);
      const c = q.get("c");
      if (c) {
        q.delete("c");
        q.set("category", c);
      }
      const qs = q.toString();
      window.history.replaceState({}, "", `${to}${qs ? `?${qs}` : ""}${window.location.hash}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [path]);
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
  const [, section, slug, extra] = path.split("/");
  if (extra) return <NotFound />;
  if (slug) {
    if (section === "events") return <EventPage slug={slug} />;
    if (section === "communities") return <GroupPage slug={slug} />;
    if (section === "stories") return <StoryPage slug={slug} />;
    return <NotFound />;
  }
  switch (path) {
    case "/":
      return <HomePage />;
    case "/discover":
      return <DiscoverPage />;
    case "/visitor-guide":
      return <VisitorGuidePage />;
    case "/events":
    case "/experiences":
      return <EventsPage />;
    case "/communities":
    case "/community":
      return <CommunitiesPage />;
    case "/join":
      return <JoinPage />;
    case "/adda":
      return <AddaPage />;
    case "/opportunities":
      return <OpportunitiesPage />;
    case "/stories":
      return <StoriesPage />;
    case "/report":
      return <ReportPage />;
    case "/saved":
      return <SavedPage />;
    default:
      return <NotFound />;
  }
}
