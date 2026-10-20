import { OFFICIAL } from "../lib/site";

// Curated answers for the guide preview. When the AI backend is wired up
// (a Worker route calling the model), these become its grounding notes.

export type FollowUp = "transport" | "day-plan" | "darshan" | "stay" | "food" | "nearby" | "parking";

export interface Answer {
  title: string;
  points: string[];
  ask?: string;
  followUps?: FollowUp[];
  officialLink?: { label: string; url: string };
}

interface Entry {
  keywords: string[];
  answer: Answer;
}

const ENTRIES: Record<string, Entry> = {
  elderly: {
    keywords: ["elder", "elderly", "parents", "senior", "grandma", "grandpa", "wheelchair", "disab", "accessib", "comfortable"],
    answer: {
      title: "Let's keep the day comfortable.",
      points: [
        "Build in rest breaks",
        "Choose a plan with less walking",
        "Check accessibility before you travel",
      ],
      ask: "What would you like to arrange first?",
      followUps: ["transport", "day-plan"],
      officialLink: { label: "Check official accessibility information", url: OFFICIAL.ttdBooking },
    },
  },
  darshan: {
    keywords: ["darshan", "darshanam", "ticket", "slot", "book", "temple", "balaji", "venkateswara", "queue", "line", "token", "300"],
    answer: {
      title: "Here's how darshan works.",
      points: [
        "Free (Sarva) darshan needs no booking, but expect long waits on busy days",
        "Special Entry Darshan gives a fixed time slot; book it on the official TTD portal",
        "Carry photo ID for every adult and dress traditionally",
        "Phones and bags go into the free deposit counters before you enter",
      ],
      ask: "Want help planning the rest of the day?",
      followUps: ["day-plan", "transport", "stay"],
      officialLink: { label: "Book on the official TTD portal", url: OFFICIAL.ttdBooking },
    },
  },
  dress: {
    keywords: ["wear", "dress", "clothes", "attire", "saree", "dhoti", "jeans"],
    answer: {
      title: "What to wear for darshan.",
      points: [
        "Men: dhoti, or kurta-pyjama, with an upper cloth",
        "Women: saree, half-saree, or churidar with a dupatta",
        "Comfortable footwear for the walk; you'll leave it at the footwear counter",
      ],
      followUps: ["darshan", "day-plan"],
      officialLink: { label: "Check the official dress guidance", url: OFFICIAL.ttdInfo },
    },
  },
  parking: {
    keywords: ["park", "parking", "car", "bike", "vehicle", "drive", "driving"],
    answer: {
      title: "Parking, the easy way.",
      points: [
        "Tirumala has several large parking areas; arrive early on weekends",
        "Vehicles are checked at the Alipiri toll gate before the ghat road",
        "Walking up? Park near Alipiri and take the bus back down",
        "In town, autos beat hunting for parking near the temple streets",
      ],
      followUps: ["transport", "day-plan"],
    },
  },
  transport: {
    keywords: ["bus", "transport", "taxi", "cab", "auto", "station", "airport", "railway", "train", "reach", "get to", "go up", "ghat", "travel"],
    answer: {
      title: "Getting there and around.",
      points: [
        "APSRTC buses run often from the Tirupati bus stand up to Tirumala (about an hour)",
        "Renigunta Junction is about 10 km out; the airport is about 15 km",
        "Free TTD buses connect the main stops on the hill",
        "Autos and app cabs are easy to find in town",
      ],
      followUps: ["parking", "stay"],
    },
  },
  stay: {
    keywords: ["hotel", "stay", "room", "lodge", "accommodation", "sleep", "night", "cottage"],
    answer: {
      title: "Where to stay.",
      points: [
        "TTD rooms at Tirumala and Tirupati are booked on the official portal",
        "Town hotels near the bus stand and railway station suit every budget",
        "Book early for weekends, Brahmotsavam and school holidays",
      ],
      followUps: ["food", "transport"],
      officialLink: { label: "See TTD accommodation", url: OFFICIAL.ttdBooking },
    },
  },
  food: {
    keywords: ["food", "eat", "meal", "breakfast", "lunch", "dinner", "restaurant", "annaprasadam", "prasadam", "laddu", "veg"],
    answer: {
      title: "Eating well in Tirupati.",
      points: [
        "TTD's annaprasadam complex at Tirumala serves free meals through the day",
        "In town, try pesarattu, idli and filter coffee for breakfast",
        "Tirumala is vegetarian, and alcohol and tobacco aren't allowed on the hill",
      ],
      followUps: ["stay", "nearby"],
    },
  },
  walk: {
    keywords: ["walk", "footpath", "steps", "alipiri", "mettu", "climb", "trek", "luggage"],
    answer: {
      title: "Walking up the hills.",
      points: [
        "Alipiri is the longer, traditional route from town",
        "Srivari Mettu is shorter and steeper, from near Srinivasa Mangapuram",
        "Send luggage up from Alipiri and collect it at the top",
        "Start early, carry water, and use the rest points",
      ],
      followUps: ["darshan", "transport"],
    },
  },
  nearby: {
    keywords: ["nearby", "around", "visit", "see", "places", "sightseeing", "things to do", "half day", "kids", "waterfall", "fort", "nature", "free time"],
    answer: {
      title: "Good things to do nearby.",
      points: [
        "Sri Padmavathi Ammavari Temple, Tiruchanur (about 5 km)",
        "Kapila Theertham, a temple and waterfall at the foot of the hills",
        "Chandragiri Fort and museum (about 15 km)",
        "Sri Kalahasti Temple (about 35 km), home of Kalamkari art",
        "Or join an IMC experience: food walks, runs, music evenings",
      ],
      followUps: ["day-plan", "transport"],
    },
  },
};

const FOLLOW_UP_PROMPTS: Record<FollowUp, { label: string; prompt: string }> = {
  transport: { label: "Transport", prompt: "How do we get around and up to Tirumala?" },
  "day-plan": { label: "Day plan", prompt: "Suggest a relaxed day plan around Tirupati" },
  darshan: { label: "Darshan", prompt: "How does darshan booking work?" },
  stay: { label: "Stay", prompt: "Where should we stay?" },
  food: { label: "Food", prompt: "Where can we eat?" },
  nearby: { label: "Nearby", prompt: "What can we see nearby?" },
  parking: { label: "Parking", prompt: "Where can we park?" },
};

export function followUpPrompt(f: FollowUp) {
  return FOLLOW_UP_PROMPTS[f];
}

const DAY_PLAN: Answer = {
  title: "A relaxed day around Tirupati.",
  points: [
    "Early morning: darshan at your booked slot, or the footpath if you're walking",
    "Late morning: free annaprasadam at Tirumala, then back down the ghat",
    "Afternoon: rest, then Sri Padmavathi Ammavari Temple at Tiruchanur",
    "Evening: Kapila Theertham, or an IMC music evening in town",
  ],
  followUps: ["transport", "stay", "food"],
};

const FALLBACK: Answer = {
  title: "I can help with that. Here's where to start.",
  points: [
    "Darshan types and booking",
    "Getting around, parking and the ghat road",
    "Food, stays and things to do nearby",
  ],
  ask: "Pick a topic, or ask in your own words.",
  followUps: ["darshan", "transport", "stay", "nearby"],
};

export function answerFor(question: string): Answer {
  const q = question.toLowerCase();
  if (/(day plan|itinerary|plan (a|my|our) day|one day|relaxed day)/.test(q)) return DAY_PLAN;
  let best: { score: number; answer: Answer } | null = null;
  for (const entry of Object.values(ENTRIES)) {
    const score = entry.keywords.reduce((s, k) => (q.includes(k) ? s + 1 : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { score, answer: entry.answer };
  }
  return best?.answer ?? FALLBACK;
}
