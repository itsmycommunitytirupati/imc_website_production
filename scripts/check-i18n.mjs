// Lists visitor-facing English strings that a language dictionary is missing.
// Usage: node scripts/check-i18n.mjs            (summary)
//        node scripts/check-i18n.mjs te --list  (every missing key for Telugu)
// Strings are found heuristically: t("...") calls plus sentence-like literals in
// the content files and site/guide pages. Class names, URLs and ids are skipped.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const FILES = [
  "src/App.tsx",
  ...fs.readdirSync(path.join(ROOT, "src/site")).map((f) => "src/site/" + f),
  "src/guide/GuideApp.tsx",
  "src/content/visitor.ts",
  "src/content/guide.ts",
  "src/content/experiences.ts",
  "src/content/community.ts",
  "src/content/hills.ts",
  "src/content/places.ts",
];
// Proper names and data that stay as written.
const SKIP_FILES_FOR_LITERALS = new Set(["src/site/Reveal.tsx"]);
// Also skipped: SVG paths, browser-tab titles and meta descriptions (kept English for search),
// prefilled WhatsApp messages, menu button labels and the illustrative phone chat.
const SKIP = /^(IMC|IMC Tirupati|WhatsApp|Instagram|Unsplash|TTD|Photos:|Language: .*|Choose language|Loading|M[\d.]+ .*|.* \| IMC Tirupati.*|IMC Tirupati \|.*|Hi IMC!.*|Partnering with .*|(Open|Close) menu|Open the guide|IMC Tirupati, It's My Community|Easy 5K|Steady 7K|Just coffee after ☕|Ask a local guide about .*|Clubs, meetups and experiences .*|Darshan options, getting around, .*|Find your way, plan your visit and connect with local people in Tirupati\..*|Music evenings, food walks, .*)$/;
const KEEP_KEYS = new Set(["title", "text", "tip", "story", "blurb", "price", "recurring", "label", "note", "cta", "q", "a", "heading", "summary", "place", "value", "greeting", "ask", "prompt", "area", "bestFor", "route", "knownFor", "details"]);

function looksLikeText(s) {
  if (!/[A-Za-z]/.test(s) || s.length < 2) return false;
  if (/^(https?:|mailto:|tel:|\/|#|\.{1,2}\/|@|photo-|assets)/.test(s)) return false;
  if (/^[a-z0-9-]+$/.test(s)) return false; // ids and slugs
  if (/[{}<>=]/.test(s) || /\$\{/.test(s)) return false;
  const tokens = s.split(/\s+/);
  const classy = tokens.filter((t) => /^[!a-z0-9:[\]\/.%_-]+$/.test(t) && /[-:\[]/.test(t)).length;
  if (classy >= Math.max(1, tokens.length / 2)) return false; // Tailwind classes
  return true;
}

export function collectKeys() {
  const keys = new Set();
  for (const rel of FILES) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g)) keys.add(JSON.parse(`"${m[1]}"`));
    if (SKIP_FILES_FOR_LITERALS.has(rel)) continue;
    const isContent = rel.startsWith("src/content/");
    for (const m of src.matchAll(/(?:(\w+)\s*:\s*)?"((?:[^"\\]|\\.)*)"/g)) {
      const [, key, raw] = m;
      const s = JSON.parse(`"${raw}"`);
      if (!looksLikeText(s) || SKIP.test(s)) continue;
      // Keep values of text-ish keys anywhere, and sentence-like array items (capitalised;
      // lower-case items are search keywords).
      if (key ? !KEEP_KEYS.has(key) : !/^[A-Z0-9₹]/.test(s) || (!/\s/.test(s) && !isContent)) continue;
      if (/^T\d|^en-/.test(s)) continue;
      if (rel === "src/content/experiences.ts" && key === "title") continue; // event names stay as written
      if (rel === "src/content/places.ts" && key === "label") continue; // source names are brands
      keys.add(s);
    }
  }
  return [...keys].sort();
}

function loadDict(lang) {
  const src = fs.readFileSync(path.join(ROOT, `src/i18n/${lang}.ts`), "utf8");
  const dict = {};
  for (const m of src.matchAll(/^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$/gm)) dict[JSON.parse(m[1])] = JSON.parse(m[2]);
  return dict;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const keys = collectKeys();
  const only = process.argv[2] && !process.argv[2].startsWith("--") ? [process.argv[2]] : ["te", "ta", "hi"];
  if (process.argv.includes("--keys")) {
    console.log(JSON.stringify(keys, null, 1));
    process.exit(0);
  }
  let bad = 0;
  for (const lang of only) {
    const dict = loadDict(lang);
    const missing = keys.filter((k) => !(k in dict));
    const unused = Object.keys(dict).filter((k) => !keys.includes(k));
    bad += missing.length;
    console.log(`${lang}: ${keys.length - missing.length}/${keys.length} translated, ${missing.length} missing, ${unused.length} unused`);
    if (process.argv.includes("--list")) missing.forEach((k) => console.log("  - " + k));
  }
  process.exit(bad ? 1 : 0);
}
