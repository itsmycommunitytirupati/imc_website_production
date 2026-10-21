// The guide's grounding: IMC's curated visitor notes plus the researched
// places directory, split into small searchable chunks with their sources.
import { BEFORE_YOU_GO, DISTANCES, FREE_ON_THE_HILL, JOURNEY, TOPICS, TRIP_TYPES } from "../src/content/visitor";
import { ENTRIES } from "../src/content/guide";
import { SEVEN_HILLS } from "../src/content/hills";
import { CHECKED, EATERIES, RIDES, SAFETY, STAYS, TOURS, BUDGET_LABEL, type Budget, type Source } from "../src/content/places";
import { CONTACT, OFFICIAL } from "../src/lib/links";

export interface Chunk {
  title: string;
  text: string;
  source: Source;
  kind: "imc" | "official" | "directory";
}

const IMC_GUIDE: Source = { label: "IMC Tirupati visitor guide", url: "https://imctirupati.com/visitor-guide" };

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const topic of TOPICS) {
    for (const s of topic.sections) {
      chunks.push({ title: `${topic.title}: ${s.heading}`, text: s.points.join(" "), source: IMC_GUIDE, kind: "imc" });
    }
  }
  for (const e of Object.values(ENTRIES)) {
    chunks.push({ title: e.answer.title, text: e.answer.points.join(". "), source: e.answer.officialLink ? { label: e.answer.officialLink.label, url: e.answer.officialLink.url } : IMC_GUIDE, kind: "imc" });
  }
  chunks.push({ title: "A Tirumala visit, step by step", text: JOURNEY.map((j, i) => `${i + 1}. ${j.title}: ${j.text}`).join(" "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "Free on the hill", text: FREE_ON_THE_HILL.map((f) => `${f.title}: ${f.text}.`).join(" "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "Checklist before you go", text: BEFORE_YOU_GO.join(". "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "Distances from Tirupati town centre (approximate)", text: DISTANCES.map((d) => `${d.place}: ${d.value}.`).join(" "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "Trip ideas by type of traveller", text: TRIP_TYPES.map((t) => `${t.title}: ${t.tip}`).join(" "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "The seven hills of Tirumala (local tradition)", text: SEVEN_HILLS.map((h) => `${h.name}: ${h.story}`).join(" "), source: IMC_GUIDE, kind: "imc" });
  chunks.push({ title: "Safety and emergencies", text: SAFETY.join(" "), source: { label: "TTD transport facilities", url: "https://www.tirumala.org/TransportFacilities.aspx" }, kind: "official" });
  chunks.push({
    title: "About IMC (It's My Community)",
    text: `IMC is an independent, people-first community in Tirupati running clubs and meetups (sport, music, dance, treks, books, careers). It is not TTD and cannot book darshan or rooms. Reach a person on WhatsApp ${CONTACT.phone}. Official TTD bookings: ${OFFICIAL.ttdBooking}. Official TTD information: ${OFFICIAL.ttdInfo}.`,
    source: { label: "IMC Tirupati", url: "https://imctirupati.com/community" },
    kind: "imc",
  });
  for (const s of STAYS) {
    chunks.push({ title: `Stay: ${s.name} (${BUDGET_LABEL[s.budget]})`, text: placeText(s.area, s.price, s.bestFor, s.amenities, s.note), source: s.sources[0], kind: "directory" });
  }
  for (const r of RIDES) {
    chunks.push({ title: `Transport: ${r.name} (${BUDGET_LABEL[r.budget]})`, text: `${r.route}. Price: ${r.price}. Best for: ${r.bestFor}. ${r.details.join(". ")}. Checked ${CHECKED}.`, source: r.sources[0], kind: "directory" });
  }
  for (const e of EATERIES) {
    chunks.push({ title: `Food: ${e.name} (${BUDGET_LABEL[e.budget]})`, text: `${e.area}. Known for: ${e.knownFor}. Checked ${CHECKED}.`, source: e.sources[0], kind: "directory" });
  }
  for (const t of TOURS) chunks.push({ title: `Tour: ${t.name}`, text: t.details, source: t.sources[0], kind: "directory" });
  return chunks;
}

function placeText(area: string, price: string, bestFor: string, amenities: string[], note?: string) {
  return `Area: ${area}. Price: ${price}. Best for: ${bestFor}. Amenities: ${amenities.join(", ")}.${note ? ` Note: ${note}` : ""} Checked ${CHECKED}.`;
}

export const CHUNKS = buildChunks();

// Words that should find each other even when visitors phrase things differently.
const SYNONYMS: Record<string, string[]> = {
  hotel: ["stay", "room", "rooms", "accommodation", "lodge", "cottage"],
  room: ["stay", "hotel", "accommodation", "cottage"],
  stay: ["hotel", "room", "accommodation"],
  bus: ["transport", "apsrtc", "ride"],
  cab: ["taxi", "transport", "car"],
  taxi: ["cab", "transport"],
  transport: ["bus", "taxi", "cab", "ride"],
  food: ["eat", "meal", "restaurant", "breakfast", "annaprasadam"],
  eat: ["food", "meal", "restaurant"],
  cheap: ["budget", "free", "low"],
  budget: ["cheap", "free", "price"],
  price: ["cost", "fare", "tariff"],
  fare: ["price", "cost"],
  elderly: ["elders", "senior", "parents", "accessibility"],
  kids: ["children", "little", "family"],
  walk: ["footpath", "alipiri", "mettu", "steps"],
};

function tokens(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9₹\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
}

export function searchChunks(query: string, limit = 6): Chunk[] {
  const q = tokens(query);
  const expanded = new Set(q.flatMap((w) => [w, ...(SYNONYMS[w] ?? [])]));
  const scored = CHUNKS.map((c) => {
    const title = c.title.toLowerCase();
    const body = c.text.toLowerCase();
    let score = 0;
    for (const w of expanded) {
      if (title.includes(w)) score += 3;
      if (body.includes(w)) score += 1;
    }
    return { c, score };
  });
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.c);
}

export function filterPlaces(kind: string, budget?: string) {
  const want = (b: Budget) => !budget || budget === "any" || b === budget || (budget === "budget" && b === "free");
  if (kind === "stay") return CHUNKS.filter((c) => c.title.startsWith("Stay:")).filter((c) => want(budgetOf(c.title)));
  if (kind === "transport") return CHUNKS.filter((c) => c.title.startsWith("Transport:")).filter((c) => want(budgetOf(c.title)));
  if (kind === "food") return CHUNKS.filter((c) => c.title.startsWith("Food:")).filter((c) => want(budgetOf(c.title)));
  if (kind === "tour") return CHUNKS.filter((c) => c.title.startsWith("Tour:"));
  return [];
}

function budgetOf(title: string): Budget {
  const label = title.match(/\(([^)]+)\)$/)?.[1];
  return (Object.entries(BUDGET_LABEL).find(([, l]) => l === label)?.[0] as Budget) ?? "mid";
}
