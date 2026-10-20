import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { Bookmark, ChevronDown, Compass, Globe, Home, Menu, X } from "lucide-react";
import { Link, useLocation } from "../lib/router";
import { CONTACT, LANGS, useLang } from "../lib/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex flex-col leading-none select-none" aria-label="IMC Tirupati, It's My Community">
      <span className={`font-display font-extrabold tracking-tight ${compact ? "text-xl" : "text-2xl"}`}>
        IMC <span className="text-brand">TIRUPATI</span>
      </span>
      <span className="mt-1 text-[8.5px] font-medium tracking-[0.42em] text-ink/80">IT'S MY COMMUNITY</span>
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

export function LanguageSelect({ className = "" }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <label className={`relative inline-flex items-center gap-2 text-sm font-medium ${className}`}>
      <Globe className="h-4 w-4 text-ink/70" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as typeof lang)}
        className="appearance-none bg-transparent pr-5 outline-none"
      >
        {LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-ink/60" aria-hidden="true" />
    </label>
  );
}

const NAV = [
  { to: "/visitor-guide", label: "Visitor guide" },
  { to: "/experiences", label: "Experiences" },
  { to: "/community", label: "Community" },
];

export function Header() {
  const { path } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 md:h-20">
        <button className="-ml-1 p-1 md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="mx-auto hidden items-center gap-10 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-[15px] font-medium transition-colors hover:text-brand ${path === n.to ? "text-brand" : "text-ink"}`}
              aria-current={path === n.to ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-6 md:ml-0">
          <LanguageSelect />
          <span className="hidden h-6 w-px bg-line md:block" />
          <Link to={CONTACT.whatsapp} className="hidden text-sm font-medium hover:text-brand md:block">
            Contact IMC
          </Link>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-white px-4 py-3 md:hidden" aria-label="Main">
          {[{ to: "/", label: "Home" }, ...NAV].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 text-base font-medium hover:bg-peach">
              {n.label}
            </Link>
          ))}
          <Link to={CONTACT.whatsapp} className="block rounded-lg px-2 py-3 text-base font-medium hover:bg-peach">
            Contact IMC
          </Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white pb-24 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo compact />
        <nav className="flex items-center gap-4 text-sm text-ink/80" aria-label="Footer">
          <Link to="/community#about" className="hover:text-brand">About IMC</Link>
          <span className="text-line">|</span>
          <Link to={CONTACT.whatsapp} className="hover:text-brand">Contact</Link>
          <span className="text-line">|</span>
          <Link to="/privacy" className="hover:text-brand">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}

const TABS = [
  { to: "/", label: "Guide", icon: Home, match: (p: string) => p === "/" || p === "/visitor-guide" },
  { to: "/experiences", label: "Explore", icon: Compass, match: (p: string) => p === "/experiences" || p === "/community" },
  { to: "/saved", label: "Saved", icon: Bookmark, match: (p: string) => p === "/saved" },
];

export function MobileTabBar() {
  const { path } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden" aria-label="Quick">
      <div className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ to, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${active ? "text-brand" : "text-ink/70"}`} aria-current={active ? "page" : undefined}>
              <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Deep links like /visitor-guide#parking: scroll once the page has rendered.
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}

export function SectionHeading({ title, sub, className = "" }: { title: string; sub?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}
