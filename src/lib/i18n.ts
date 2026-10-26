import { useEffect, useState } from "react";
import { useLang, type Lang } from "./site";

// Translations are keyed by the English text, so components read naturally:
// t("Ask guide"). Anything missing falls back to English, and
// `node scripts/check-i18n.mjs` lists what each language still lacks.
// Each dictionary loads only when someone picks that language, so English visitors
// never download them.
type Other = Exclude<Lang, "en">;
const LOADERS: Record<Other, () => Promise<{ default: Record<string, string> }>> = {
  te: () => import("../i18n/te"),
  ta: () => import("../i18n/ta"),
  hi: () => import("../i18n/hi"),
};
const DICTS: Partial<Record<Other, Record<string, string>>> = {};
const PENDING: Partial<Record<Other, Promise<void>>> = {};
const LOADED_EVENT = "imc-dict-loaded";

function ensureDict(lang: Other) {
  PENDING[lang] ??= LOADERS[lang]()
    .then((m) => {
      DICTS[lang] = m.default;
      window.dispatchEvent(new Event(LOADED_EVENT));
    })
    .catch(() => {
      // Offline or a failed chunk: stay in English and retry on the next language change.
      delete PENDING[lang];
    });
}

export function translate(lang: Lang, text: string): string {
  if (lang === "en") return text;
  return DICTS[lang]?.[text] ?? text;
}

export type T = (text: string) => string;

export function useT(): T {
  const [lang] = useLang();
  const [, rerender] = useState(0);
  useEffect(() => {
    if (lang === "en" || DICTS[lang]) return;
    const onLoad = () => rerender((n) => n + 1);
    window.addEventListener(LOADED_EVENT, onLoad);
    ensureDict(lang);
    return () => window.removeEventListener(LOADED_EVENT, onLoad);
  }, [lang]);
  return (text: string) => translate(lang, text);
}
