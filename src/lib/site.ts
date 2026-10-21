import { useEffect, useState } from "react";

export const CONTACT = {
  email: "itsmycommunity.tirupati@gmail.com",
  phone: "+91 95508 15185",
  whatsapp: "https://wa.me/919550815185",
  instagram: "https://www.instagram.com/imc.tirupati",
};

// Official sources. IMC is an independent community guide, so anything about
// bookings, timings or rules should point people here.
export const OFFICIAL = {
  ttdInfo: "https://www.tirumala.org/",
  ttdBooking: "https://tirupatibalaji.ap.gov.in/",
};

// Where "Ask guide" sends people. Switch to "https://help.imctirupati.com"
// once that custom domain is attached to the Worker (see claude.md).
export const GUIDE_BASE = "/guide";

export function guideUrl(question?: string, lang?: Lang) {
  const params = new URLSearchParams();
  if (question?.trim()) params.set("q", question.trim());
  if (lang && lang !== "en") params.set("lang", lang);
  const qs = params.toString();
  return qs ? `${GUIDE_BASE}?${qs}` : GUIDE_BASE;
}

export type Lang = "en" | "te" | "ta" | "hi";

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "en", label: "English", name: "English" },
  { id: "te", label: "తెలుగు", name: "Telugu" },
  { id: "ta", label: "தமிழ்", name: "Tamil" },
  { id: "hi", label: "हिन्दी", name: "Hindi" },
];

const LANG_KEY = "imc-lang";
const LANG_EVENT = "imc-lang-change";

function readLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === "te" || v === "ta" || v === "hi") return v;
  } catch {
    // Storage can be blocked (private mode); English is a fine default.
  }
  return "en";
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(readLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    const sync = () => setLangState(readLang());
    window.addEventListener(LANG_EVENT, sync);
    return () => window.removeEventListener(LANG_EVENT, sync);
  }, []);
  const setLang = (l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
    setLangState(l);
    window.dispatchEvent(new Event(LANG_EVENT));
  };
  return [lang, setLang];
}

const SAVED_KEY = "imc-saved";
const SAVED_EVENT = "imc-saved-change";

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Saved experiences live in this browser only; there are no accounts yet.
export function useSaved(): [string[], (id: string) => void] {
  const [saved, setSaved] = useState<string[]>(readSaved);
  useEffect(() => {
    const sync = () => setSaved(readSaved());
    window.addEventListener(SAVED_EVENT, sync);
    return () => window.removeEventListener(SAVED_EVENT, sync);
  }, []);
  const toggle = (id: string) => {
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setSaved(next);
    window.dispatchEvent(new Event(SAVED_EVENT));
  };
  return [saved, toggle];
}

export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
