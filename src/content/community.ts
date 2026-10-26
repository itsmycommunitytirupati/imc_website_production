import { IMC_PHOTOS } from "./photos";

export const PASSION_CARDS = [
  {
    note: "Partner with us 🤝",
    title: "Partner with IMC",
    text: "Run a café, studio, brand or venue in Tirupati? Co-host meetups and meet the city's most active crowd.",
    cta: "Become a partner",
    image: IMC_PHOTOS.houseFront,
    action: "partner" as const,
  },
  {
    note: "Create. Collab. Build culture. ⭐",
    title: "Host an experience",
    text: "Have a passion that deserves its own circle? Bring the idea; we'll help with people, venue and promotion.",
    cta: "Start something",
    image: IMC_PHOTOS.danceStudio,
    action: "host" as const,
  },
  {
    note: "Do your thing. 💼",
    title: "Join the crew",
    text: "Photographers, designers, hosts and organisers make every IMC event happen. Lend your skill.",
    cta: "Volunteer with us",
    image: IMC_PHOTOS.meetup,
    action: "crew" as const,
  },
];

export const FAQS = [
  { q: "What is IMC?", a: "IMC (It's My Community) is a people-first community in Tirupati. We run communities and events across music, sport, treks, food, creators, careers, social welfare and more, so anyone can find their people." },
  { q: "How do I join a community?", a: "Open any community and use the join form, or join IMC and pick your interests. A host adds you to that community's WhatsApp group, where meetups are announced." },
  { q: "Can I join more than one club?", a: "Of course. Most members are part of two or three." },
  { q: "I'm only visiting Tirupati. Can I come to an event?", a: "Yes. Food walks, runs, music evenings and treks are open to visitors. Open any event and RSVP." },
  { q: "I don't know anyone. Is that okay?", a: "That's how almost everyone starts. Our hosts make sure first-timers are introduced around." },
  { q: "Are there fees?", a: "Many meetups are free. Some events charge a small fee for venue, materials or transport, and the price is always shown upfront." },
  { q: "How can I suggest a new meetup or community?", a: "Use the propose-an-event form on the Opportunities page. The team reviews every idea and replies." },
  { q: "A photo of me is on the site. Can it come down?", a: "Yes. Use the photo removal form linked in the footer and we'll take it down." },
];

// Poster colours for experience cards, by category.
export const POSTER_STYLES: Record<string, { bg: string; fg: string; accent: string; emoji: string }> = {
  music: { bg: "#1f1b4d", fg: "#ffffff", accent: "#ffd84d", emoji: "🎸" },
  meetups: { bg: "#ffd84d", fg: "#141414", accent: "#c2410c", emoji: "☕" },
  nature: { bg: "#0f5132", fg: "#ffffff", accent: "#b7f171", emoji: "⛰️" },
  culture: { bg: "#fde1d3", fg: "#7c2d12", accent: "#c2410c", emoji: "🎨" },
  food: { bg: "#c2410c", fg: "#ffffff", accent: "#ffd84d", emoji: "🥞" },
  sports: { bg: "#e9f4ff", fg: "#0b2a4a", accent: "#1d4ed8", emoji: "🏃" },
  startup: { bg: "#141414", fg: "#ffffff", accent: "#fb923c", emoji: "🚀" },
};
