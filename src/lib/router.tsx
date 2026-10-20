import { useEffect, useState, type AnchorHTMLAttributes } from "react";

// Tiny History-API router. The Worker serves index.html for every path
// (assets.not_found_handling = "single-page-application"), so deep links work.

export interface Loc {
  path: string;
  search: URLSearchParams;
  hash: string;
}

function readLoc(): Loc {
  return {
    path: window.location.pathname.replace(/\/+$/, "") || "/",
    search: new URLSearchParams(window.location.search),
    hash: window.location.hash.slice(1),
  };
}

export function navigate(to: string) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  scrollToHashOrTop();
}

function scrollToHashOrTop() {
  const id = window.location.hash.slice(1);
  // Wait a frame so the new page has rendered before looking for the anchor.
  requestAnimationFrame(() => {
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0 });
  });
}

export function useLocation(): Loc {
  const [loc, setLoc] = useState(readLoc);
  useEffect(() => {
    const onPop = () => setLoc(readLoc());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return loc;
}

type LinkProps = { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Link({ to, onClick, ...rest }: LinkProps) {
  const external = /^(https?:|mailto:|tel:)/.test(to);
  return (
    <a
      href={to}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (external || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
}
