import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Bookmark, CalendarDays, Check, ChevronDown, Compass, Globe, Home, Instagram, Mail, Menu, MessageCircle, Users, X } from "lucide-react";
import { Link, useLocation } from "../lib/router";
import { CONTACT, LANGS, guideUrl, useLang } from "../lib/site";
import { useT } from "../lib/i18n";
import { IMC_PHOTOS } from "../content/photos";

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex select-none flex-col leading-none" aria-label="IMC Tirupati, It's My Community">
      <span className={`font-display font-extrabold tracking-tight ${compact ? "text-xl" : "text-2xl"} ${light ? "text-white" : ""}`}>
        IMC <span className={light ? "text-orange-400" : "text-brand"}>TIRUPATI</span>
      </span>
      <span className={`mt-1 text-[8.5px] font-medium tracking-[0.42em] ${light ? "text-white/70" : "text-ink/80"}`}>IT'S MY COMMUNITY</span>
    </span>
  );
}

// Lucide has no temple icon; this is a simple gopuram silhouette.
export function GopuramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M12 1.5v2" />
      <path d="M10.6 5.5h2.8L13 3.5h-2z" />
      <path d="M9.2 9h5.6l-1.4-3.5h-2.8z" />
      <path d="M7.8 12.8h8.4L14.8 9H9.2z" />
      <path d="M6.3 16.8h11.4l-1.5-4H7.8z" />
      <path d="M4.5 22h15l-1.8-5.2H6.3z" />
      <path d="M10.4 22v-2.6a1.6 1.6 0 0 1 3.2 0V22" />
    </svg>
  );
}

// Seven soft hill ridges, used as a quiet signature across the site.
export function HillsSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" opacity=".35" d="M0 220V150c80-38 150-70 240-60s140 40 220 26 150-80 250-86 170 52 260 60 150-40 230-56 140 12 240 30v156z" />
      <path fill="currentColor" opacity=".6" d="M0 220V178c100-30 190-52 300-44s170 32 270 18 170-60 280-58 180 46 280 50 220-30 310-22v98z" />
      <path fill="currentColor" d="M0 220v-22c140-18 260-30 400-24s260 20 400 14 300-24 400-20 160 10 240 14v38z" />
    </svg>
  );
}

export function LanguageMenu({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const [lang, setLang] = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.name}`}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${dark ? "text-white hover:bg-white/10" : "hover:bg-peach"}`}
      >
        <Globe className="h-4 w-4 opacity-70" aria-hidden="true" />
        {current.label}
        <ChevronDown className={`h-4 w-4 opacity-60 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-white p-1.5 text-ink shadow-2xl shadow-black/10"
        >
          {LANGS.map((l) => (
            <li key={l.id} role="option" aria-selected={l.id === lang}>
              <button
                onClick={() => {
                  setLang(l.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${l.id === lang ? "bg-brand-soft" : "hover:bg-stone-50"}`}
              >
                <span className="flex-1">
                  <span className="block font-semibold">{l.label}</span>
                  <span className="text-xs text-muted">{l.name}</span>
                </span>
                {l.id === lang && <Check className="h-4 w-4 text-brand" />}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

// The brief's navigation. Discover holds the visitor guide and the AI guide.
const NAV = [
  { to: "/discover", label: "Discover", match: ["/discover", "/visitor-guide"] },
  { to: "/events", label: "Events", match: ["/events"] },
  { to: "/communities", label: "Communities", match: ["/communities", "/adda", "/team"] },
  { to: "/opportunities", label: "Opportunities", match: ["/opportunities"] },
  { to: "/stories", label: "Stories", match: ["/stories", "/gallery"] },
];
const isActive = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

export function Header() {
  const { path } = useLocation();
  const t = useT();
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled || open ? "border-line bg-white/90 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl" : "border-transparent bg-white/70 backdrop-blur"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 md:h-20">
        <button className="-ml-1 rounded-full p-1.5 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="mx-auto hidden items-center gap-0.5 whitespace-nowrap lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const active = isActive(path, n.match);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative rounded-full px-3 py-2 text-[15px] font-medium xl:px-4 transition-colors hover:text-brand ${active ? "text-brand" : "text-ink"}`}
                aria-current={active ? "page" : undefined}
              >
                {t(n.label)}
                {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 xl:inset-x-4 h-0.5 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <LanguageMenu />
          <Link to="/join" className={`hidden items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-white transition sm:inline-flex ${path === "/join" ? "bg-brand" : "bg-ink hover:bg-brand"}`}>
            {t("Join IMC")}
          </Link>
        </div>
      </div>
    </header>
    {/* Outside the header: its backdrop blur would trap a fixed overlay inside it. */}
    {open && <MobileMenu path={path} />}
    </>
  );
}

function MobileMenu({ path }: { path: string }) {
  const t = useT();
  const [lang] = useLang();
  const items = [{ to: "/", label: "Home" }, ...NAV, { to: "/gallery", label: "Gallery" }, { to: "/adda", label: "Tirupati Adda" }, { to: "/team", label: "Our team" }, { to: "/join", label: "Join IMC" }, { to: "/saved", label: "Saved" }];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream md:top-20 lg:hidden"
    >
      <nav className="px-5 pt-6" aria-label="Main">
        {items.map((n, i) => (
          <motion.div key={n.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
            <Link to={n.to} className={`flex items-baseline gap-4 border-b border-line py-4 font-display text-3xl font-extrabold tracking-tight ${path === n.to ? "text-brand" : ""}`}>
              <span className="w-6 text-xs font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
              {t(n.label)}
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="relative mx-5 mt-6 overflow-hidden rounded-3xl">
        <img src={IMC_PHOTOS.hilltop} alt="" className="h-40 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link to={guideUrl(undefined, lang)} className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 font-semibold">
          {t("Ask the guide")} <ArrowUpRight className="h-5 w-5 text-brand" />
        </Link>
      </div>
      <div className="flex gap-3 px-5 py-6">
        <Link to={CONTACT.whatsapp} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-white">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Link>
        <Link to={CONTACT.instagram} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 font-semibold ring-1 ring-line">
          <Instagram className="h-4 w-4" /> Instagram
        </Link>
      </div>
    </motion.div>
  );
}

export function Footer() {
  const t = useT();
  const [lang] = useLang();
  return (
    <footer className="relative overflow-hidden bg-ink pb-24 text-white md:pb-0">
      <HillsSilhouette className="absolute inset-x-0 top-0 h-24 w-full rotate-180 text-cream" />
      <div className="relative mx-auto max-w-7xl px-4 pt-32 sm:px-6">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-hand text-3xl text-orange-300">మళ్ళీ కలుద్దాం · {t("See you again")}</p>
            <p className="mt-2 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">{t("Feel at home in Tirupati.")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={guideUrl(undefined, lang)} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold transition hover:bg-orange-600">
              {t("Ask guide")} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to={CONTACT.whatsapp} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/25 transition hover:bg-white/10">
              <MessageCircle className="h-4 w-4" /> {t("Message a local")}
            </Link>
          </div>
        </div>
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo compact light />
            <p className="mt-4 max-w-xs text-sm text-white/60">{t("Tirupati's people-first community: events, circles and a local welcome.")}</p>
            <LanguageMenu dark className="-ml-3 mt-4" />
          </div>
          <FooterCol title={t("Community")}>
            <Link to="/events">{t("Events")}</Link>
            <Link to="/communities">{t("Communities")}</Link>
            <Link to="/adda">{t("Tirupati Adda")}</Link>
            <Link to="/opportunities">{t("Opportunities")}</Link>
            <Link to="/stories">{t("Stories")}</Link>
            <Link to="/gallery">{t("Gallery")}</Link>
            <Link to="/team">{t("Our team")}</Link>
            <Link to="/join">{t("Join IMC")}</Link>
          </FooterCol>
          <FooterCol title={t("Visit")}>
            <Link to="/discover">{t("Discover Tirupati")}</Link>
            <Link to="/visitor-guide#tirumala">{t("Tirumala visit")}</Link>
            <Link to="/visitor-guide#getting-around">{t("Getting around")}</Link>
            <Link to="/visitor-guide#food-stays">{t("Food & stays")}</Link>
            <Link to="/guide">{t("Ask the guide")}</Link>
          </FooterCol>
          <FooterCol title={t("Contact")}>
            <Link to={CONTACT.whatsapp} className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {CONTACT.phone}</Link>
            <Link to={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {t("Email us")}</Link>
            <Link to={CONTACT.instagram} className="inline-flex items-center gap-2"><Instagram className="h-4 w-4" /> @imc.tirupati</Link>
          </FooterCol>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("IMC is an independent community guide and is not affiliated with TTD. Made with care in Tirupati.")}</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
            <Link to="/privacy" className="hover:text-white">{t("Privacy")}</Link>
            <Link to="/terms" className="hover:text-white">{t("Terms")}</Link>
            <Link to="/report?type=photo_removal" className="hover:text-white">{t("Photo removal")}</Link>
            <Link to="/report" className="hover:text-white">{t("Report a concern")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white/90">{title}</p>
      <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/60 [&_a:hover]:text-white">{children}</div>
    </div>
  );
}

const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/events", label: "Events", icon: CalendarDays, match: (p: string) => p.startsWith("/events") },
  { to: "/communities", label: "People", icon: Users, match: (p: string) => p.startsWith("/communities") || p === "/join" || p === "/adda" || p === "/team" },
  { to: "/discover", label: "Discover", icon: Compass, match: (p: string) => p === "/discover" || p === "/visitor-guide" },
  { to: "/saved", label: "Saved", icon: Bookmark, match: (p: string) => p === "/saved" },
];

export function MobileTabBar() {
  const { path } = useLocation();
  const t = useT();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Quick">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <Link key={to} to={to} className={`relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${active ? "text-brand" : "text-ink/70"}`} aria-current={active ? "page" : undefined}>
              {active && <motion.span layoutId="tab-dot" className="absolute top-0 h-0.5 w-10 rounded-full bg-brand" />}
              <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
              {t(label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { path } = useLocation();
  const reduce = useReducedMotion();
  useEffect(() => {
    // Deep links like /visitor-guide#parking: scroll once the page has rendered.
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <motion.main key={path} className="flex-1" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        {children}
      </motion.main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}

export function PageHero({ eyebrow, title, sub, image, children }: { eyebrow: string; title: ReactNode; sub: string; image: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 md:pb-32 md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-300">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg text-white/80 sm:text-xl">{sub}</p>
        {children}
      </div>
      <HillsSilhouette className="absolute inset-x-0 bottom-0 h-16 w-full text-cream md:h-24" />
    </section>
  );
}
