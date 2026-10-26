// Merges new translations into src/i18n/{te,ta,hi}.ts and lists (or removes) unused keys.
// Usage: node scripts/i18n-merge.mjs <translations.json>   JSON: { "English": { "te": "…", "ta": "…", "hi": "…" } }
//        node scripts/i18n-merge.mjs --unused                list dictionary keys no page uses
//        node scripts/i18n-merge.mjs --prune <keys.txt>      remove the listed keys (one per line)
// Strings passed to t() through a variable (status labels, "Free") are not detected as used,
// so review the --unused list by hand before pruning.
import fs from "node:fs";
import path from "node:path";
import { collectKeys } from "./check-i18n.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const LANGS = ["te", "ta", "hi"];
const ENTRY = /^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$/;

function read(lang) {
  const file = path.join(ROOT, `src/i18n/${lang}.ts`);
  return { file, lines: fs.readFileSync(file, "utf8").split("\n") };
}

const [mode, arg] = process.argv.slice(2);

if (mode === "--unused") {
  const used = new Set(collectKeys());
  const { lines } = read("te");
  for (const l of lines) {
    const m = l.match(ENTRY);
    if (m && !used.has(JSON.parse(m[1]))) console.log(JSON.parse(m[1]));
  }
} else if (mode === "--prune") {
  const drop = new Set(fs.readFileSync(arg, "utf8").split(/\r?\n/).filter(Boolean));
  for (const lang of LANGS) {
    const { file, lines } = read(lang);
    const kept = lines.filter((l) => {
      const m = l.match(ENTRY);
      return !(m && drop.has(JSON.parse(m[1])));
    });
    fs.writeFileSync(file, kept.join("\n"));
    console.log(`${lang}: removed ${lines.length - kept.length}`);
  }
} else if (mode) {
  const add = JSON.parse(fs.readFileSync(mode, "utf8"));
  for (const lang of LANGS) {
    const { file, lines } = read(lang);
    const have = new Set(lines.map((l) => l.match(ENTRY)).filter(Boolean).map((m) => JSON.parse(m[1])));
    const end = lines.findIndex((l) => l.startsWith("};"));
    const fresh = Object.entries(add)
      .filter(([en, tr]) => tr[lang] && !have.has(en))
      .map(([en, tr]) => `  ${JSON.stringify(en)}: ${JSON.stringify(tr[lang])},`);
    lines.splice(end, 0, ...fresh);
    fs.writeFileSync(file, lines.join("\n"));
    console.log(`${lang}: added ${fresh.length}`);
  }
} else {
  console.log("See the usage notes at the top of this file.");
}
