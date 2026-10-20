import { IMC_PHOTOS } from "./photos";

// Real IMC clubs, grouped the way people browse them, each with a real IMC photo.
export const CLUB_GROUPS = [
  { title: "Sports & fitness", image: IMC_PHOTOS.badminton, clubs: ["Cricket", "Badminton", "Volleyball", "Pickleball", "Cycling", "Cue Club"] },
  { title: "Dance & music", image: IMC_PHOTOS.classicalDance, clubs: ["Dance", "Music", "Mic.tirupati open mic"] },
  { title: "Arts & making", image: IMC_PHOTOS.artTable, clubs: ["Art & Craft", "Creator Club", "Culture & Lifestyle"] },
  { title: "Books & games", image: IMC_PHOTOS.bookTable, clubs: ["Book Club", "Board Games"] },
  // index 4 is the centre tile on desktop
  { title: "Outdoors & treks", image: IMC_PHOTOS.hilltop, clubs: ["Nature Retreat", "Treks & trails"] },
  { title: "Women's circle", image: IMC_PHOTOS.womensCircle, clubs: ["Women's Circle", "Kids & Parents"] },
  { title: "Careers & startups", image: IMC_PHOTOS.roundTable, clubs: ["Startup Club", "Connect Tirupati"] },
  { title: "Giving back", image: IMC_PHOTOS.floorCircle, clubs: ["Social Welfare", "Green Tirupati drives"] },
];

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
  { q: "What is IMC?", a: "IMC (It's My Community) is a people-first community in Tirupati. We run clubs and experiences across sport, music, dance, treks, books, careers and more, so anyone can find their people." },
  { q: "How do I join a club?", a: "Tap any club and say hi on WhatsApp. We'll add you to that club's group, where meetups are announced." },
  { q: "Can I join more than one club?", a: "Of course. Most members are part of two or three." },
  { q: "I'm only visiting Tirupati. Can I join an experience?", a: "Yes. Food walks, runs, music evenings and treks are open to visitors. Tap \"I'm in\" on any experience." },
  { q: "I don't know anyone. Is that okay?", a: "That's how almost everyone starts. Our hosts make sure first-timers are introduced around." },
  { q: "Are there fees?", a: "Many meetups are free. Some experiences charge a small fee for venue, materials or transport, and the price is always shown upfront." },
  { q: "How can I suggest a new club?", a: "Message us with the idea. If there's interest, we'll help you start it." },
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
