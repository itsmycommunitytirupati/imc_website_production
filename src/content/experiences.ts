import { MEDIA } from "./media";
import { IMC_PHOTOS } from "./photos";

// Sample experiences. The names, venues and dates are fictitious placeholders
// written in a Tirupati voice; replace them from the admin once the events
// store (Cloudflare D1) exists. Club names match IMC's real clubs.

export type Category = "meetups" | "music" | "nature" | "culture" | "food" | "sports" | "startup";

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "meetups", label: "Meetups", blurb: "Easy ways to meet new people" },
  { id: "music", label: "Music", blurb: "Jams, open mics and gigs" },
  { id: "nature", label: "Nature outings", blurb: "Treks, trails and getaways" },
  { id: "culture", label: "Culture & creativity", blurb: "Art, books, heritage" },
  { id: "food", label: "Food walks", blurb: "Taste the temple town" },
  { id: "sports", label: "Sports & fitness", blurb: "Runs, rides and turf games" },
  { id: "startup", label: "Startups & careers", blurb: "Builders and professionals" },
];

export interface Experience {
  id: string;
  title: string;
  category: Category;
  club: string;
  date: string; // ISO date of the next session
  time: string;
  venue: string;
  price: string;
  recurring?: string;
  blurb: string;
  image: string;
}

export const EXPERIENCES: Experience[] = [
  {
    id: "seven-hills-unplugged",
    title: "Seven Hills Unplugged",
    category: "music",
    club: "IMC Music Club",
    date: "2026-10-25",
    time: "6:30 PM",
    venue: "Banyan Courtyard Café, Tilak Road",
    price: "₹199",
    blurb: "An acoustic evening on the terrace. Bring a song, a guitar, or just your voice for the chorus.",
    image: MEDIA.guitar,
  },
  {
    id: "alipiri-run-club",
    title: "Alipiri Morning Run Club",
    category: "sports",
    club: "Sports Club",
    date: "2026-10-26",
    time: "5:45 AM",
    venue: "Meet at Alipiri bus stop",
    price: "Free",
    recurring: "Every Sunday",
    blurb: "A friendly 5K at the foot of the hills, all paces welcome, idli and chai after.",
    image: IMC_PHOTOS.hillsTrek,
  },
  {
    id: "talakona-trail-weekend",
    title: "Talakona Trail Weekend",
    category: "nature",
    club: "Nature Retreat Club",
    date: "2026-11-01",
    time: "5:30 AM",
    venue: "Pickup at Alipiri Circle",
    price: "₹1,499 with transport",
    blurb: "A forest trail to the waterfall with a slow breakfast by the stream. Moderate walking.",
    image: IMC_PHOTOS.waterfall,
  },
  {
    id: "kalamkari-canvas-lab",
    title: "Kalamkari Canvas Lab",
    category: "culture",
    club: "Culture & Lifestyle",
    date: "2026-11-02",
    time: "4:00 PM",
    venue: "Makers' Loft, Air Bypass Road",
    price: "₹699 with materials",
    blurb: "Learn the pen-and-natural-dye style that comes from nearby Srikalahasti, and take your piece home.",
    image: IMC_PHOTOS.craftCircle,
  },
  {
    id: "ruchulu-food-walk",
    title: "Rayalaseema Ruchulu Food Walk",
    category: "food",
    club: "Culture & Lifestyle",
    date: "2026-11-08",
    time: "7:00 AM",
    venue: "Starts at Gandhi Road",
    price: "₹349",
    blurb: "Pesarattu, ghee karam dosa and filter coffee: a breakfast crawl through the old town.",
    image: MEDIA.dosa,
  },
  {
    id: "chandragiri-heritage-ride",
    title: "Chandragiri Fort Heritage Ride",
    category: "sports",
    club: "Cycling Club",
    date: "2026-11-09",
    time: "5:30 AM",
    venue: "Meet at SV University main gate",
    price: "Free · bring your cycle",
    blurb: "A sunrise ride out to the Vijayanagara-era fort with a short history walk at the top.",
    image: IMC_PHOTOS.bikeRide,
  },
  {
    id: "temple-city-founders-chai",
    title: "Temple City Founders' Chai",
    category: "startup",
    club: "Startup Club",
    date: "2026-11-12",
    time: "7:00 PM",
    venue: "The Hub, Bhavani Nagar",
    price: "₹99",
    blurb: "Three five-minute pitches, honest feedback and a lot of chai. Builders, students and the curious.",
    image: IMC_PHOTOS.roundTable,
  },
  {
    id: "swarnamukhi-sketch-walk",
    title: "Swarnamukhi Sunset Sketch Walk",
    category: "culture",
    club: "Creator Club",
    date: "2026-11-15",
    time: "4:30 PM",
    venue: "Riverside, near the old bridge",
    price: "Free",
    blurb: "Sketchbooks and phones out: capture the river at golden hour, then share what you made.",
    image: IMC_PHOTOS.artTable,
  },
  {
    id: "filter-coffee-strangers",
    title: "Filter Coffee & Strangers",
    category: "meetups",
    club: "Connect Tirupati",
    date: "2026-11-16",
    time: "10:00 AM",
    venue: "Banyan Courtyard Café, Tilak Road",
    price: "₹149 with coffee",
    recurring: "Every other Sunday",
    blurb: "New to the city or just want new friends? Small tables, simple prompts, real conversations.",
    image: IMC_PHOTOS.meetup,
  },
  {
    id: "palm-leaf-pages",
    title: "Palm-Leaf Pages Book Circle",
    category: "culture",
    club: "Book Club",
    date: "2026-11-19",
    time: "6:00 PM",
    venue: "Reading room, Makers' Loft",
    price: "Free",
    blurb: "This month: short stories from Telugu writers, read in English and Telugu.",
    image: IMC_PHOTOS.bookClub,
  },
  {
    id: "horsley-starlight-camp",
    title: "Horsley Hills Starlight Camp",
    category: "nature",
    club: "Nature Retreat Club",
    date: "2026-11-22",
    time: "2:00 PM",
    venue: "Pickup at Tirupati bus stand",
    price: "₹2,999 overnight",
    blurb: "Tents, a bonfire and a night sky you forgot existed. Back in town by Sunday lunch.",
    image: IMC_PHOTOS.hilltop,
  },
  {
    id: "seven-hills-box-cricket-cup",
    title: "Seven Hills Box Cricket Cup",
    category: "sports",
    club: "Cricket Club",
    date: "2026-11-29",
    time: "6:00 AM",
    venue: "Turf Arena, Renigunta Road",
    price: "₹600 per team",
    blurb: "Six-a-side, knockout format. Bring a team or join one on the day.",
    image: IMC_PHOTOS.nightCricket,
  },
];

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function categoryLabel(id: Category) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
