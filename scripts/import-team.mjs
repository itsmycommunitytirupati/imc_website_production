// Makes light square WebP portraits of the IMC team from assets/members/ into assets/team/<slug>.webp.
// The slugs are what migrations/0005 seeds as "team:<slug>"; new members are added from the admin instead.
// Usage: node scripts/import-team.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join("assets", "members");
const OUT = path.join("assets", "team");

const MAP = {
  "liki-founder.jpeg": "likhith",
  "Haasya-head.jpeg": "haasya",
  "Kalyan-coreteam.jpeg": "kalyan",
  "Anudeep-event.jpeg": "anudeep",
  "kushi-core.jpeg": "khushi",
  "Uday-cricket.jpeg": "uday",
  "Ganesh-badminton.jpeg": "ganesh",
  "musiccaption.jpeg": "neeyati",
  "Rohitha-book.jpeg": "rohitha",
  "Harshit-cue.jpeg": "harshith",
  "Nitheesh-volleyball.jpeg": "nithesh",
  "Tharun-nature.jpeg": "tharun",
  "Guru-boadgame.jpeg": "guru",
  "ajaydance.jpeg": "ajay",
  "sakethpickelball.jpeg": "saketh",
  "hostmic.jpeg": "aravind",
  "raveecycle.jpeg": "ravee",
  "sohailteam.jpeg": "sohail",
  "content.jpeg": "nikhila",
};

fs.mkdirSync(OUT, { recursive: true });
for (const [file, slug] of Object.entries(MAP)) {
  const out = path.join(OUT, `${slug}.webp`);
  await sharp(path.join(SRC, file)).rotate().resize(480, 480, { fit: "cover", position: "north" }).webp({ quality: 74 }).toFile(out);
  console.log(`${file} -> ${slug}.webp (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
