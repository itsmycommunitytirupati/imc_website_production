// Makes light WebP copies of IMC's event photos for the web.
// Usage: node scripts/optimize-photos.mjs
// Originals in assets/ are 1–3 MB PNG/JPEG; copies land in assets/photos/ (~50 KB each).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets";
const OUT = path.join(SRC, "photos");
const WIDTH = 720;

fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(SRC).filter((f) => /^(\d+\.(png|jpe?g)|about\d\.jpe?g)$/i.test(f));

for (const f of files) {
  const out = path.join(OUT, f.replace(/\.(png|jpe?g)$/i, ".webp"));
  await sharp(path.join(SRC, f)).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 70 }).toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`${f} -> ${path.basename(out)} (${kb} KB)`);
}
