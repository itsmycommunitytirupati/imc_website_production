// Imports IMC's community logos/banners as light WebP files named by group slug.
// Usage: node scripts/import-logos.mjs "D:/professional/clients/imc"
// Add new logos by extending MAP (source file → group slug) and re-running.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2];
if (!SRC) throw new Error("Pass the folder that holds the logo PNGs.");
const OUT = path.join("assets", "logos");

const MAP = {
  "IMG_1321.PNG": "nature-retreat",
  "IMG_1322.PNG": "startup-club",
  "IMG_1323.PNG": "food-club",
  "IMG_1326.PNG": "women-community", // wide banner
  "IMG_1327.PNG": "social-welfare", // wide banner
  "IMG_1328.PNG": "music-club", // wide banner
  "IMG_1342.PNG": "culture-lifestyle",
  "IMG_1344.PNG": "parents-community",
  "IMG_1345.PNG": "sports-club",
  "IMG_1346.PNG": "creators-community",
};

fs.mkdirSync(OUT, { recursive: true });
for (const [file, slug] of Object.entries(MAP)) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${file} (not found)`);
    continue;
  }
  const meta = await sharp(src).metadata();
  const wide = (meta.width ?? 0) > (meta.height ?? 0) * 1.3;
  const out = path.join(OUT, `${slug}.webp`);
  await sharp(src).resize({ width: wide ? 1400 : 640, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  console.log(`${file} -> ${out} (${Math.round(fs.statSync(out).size / 1024)} KB${wide ? ", banner" : ""})`);
}
