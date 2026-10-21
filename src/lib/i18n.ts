import { useLang, type Lang } from "./site";
import te from "../i18n/te";
import ta from "../i18n/ta";
import hi from "../i18n/hi";

// Translations are keyed by the English text, so components read naturally:
// t("Ask guide"). Anything missing falls back to English, and
// `node scripts/check-i18n.mjs` lists what each language still lacks.
const DICTS: Record<Exclude<Lang, "en">, Record<string, string>> = { te, ta, hi };

export function translate(lang: Lang, text: string): string {
  if (lang === "en") return text;
  return DICTS[lang][text] ?? text;
}

export type T = (text: string) => string;

export function useT(): T {
  const [lang] = useLang();
  return (text: string) => translate(lang, text);
}
