// Stays, transport, food and tours, compiled from the most-used listings and
// official pages. Plain data: shared by the visitor guide and the guide Worker.
// Prices are snapshots, never guarantees: always show `CHECKED` and the source,
// and refresh this file (and the date) when re-researching.

export const CHECKED = "October 2026";

export interface Source {
  label: string;
  url: string;
}

export type Budget = "free" | "budget" | "mid" | "upscale" | "luxury";

export const BUDGET_LABEL: Record<Budget, string> = {
  free: "Free",
  budget: "Budget",
  mid: "Mid-range",
  upscale: "Upscale",
  luxury: "Luxury",
};

export interface Stay {
  name: string;
  budget: Budget;
  area: string;
  price: string;
  bestFor: string;
  amenities: string[];
  note?: string;
  sources: Source[];
}

export const STAYS: Stay[] = [
  {
    name: "TTD rooms at Tirumala",
    budget: "budget",
    area: "On the hill, near the temple",
    price: "From about ₹100 (dormitory) to a few thousand rupees for AC cottages, per recent guides",
    bestFor: "Staying closest to the temple for the lowest cost",
    amenities: ["Walk to the temple", "Free TTD buses outside", "Free meals at the annaprasadam complex"],
    note: "Released online about three months ahead and the cheapest rooms sell out within minutes. Counter rooms at the CRO are first come, first served. Confirm tariffs on the official portal.",
    sources: [
      { label: "Official TTD portal", url: "https://tirupatibalaji.ap.gov.in/" },
      { label: "TTD accommodation guide (2026)", url: "https://tirumalatirupatiguide.in/ttd-accommodation-online-booking/" },
    ],
  },
  {
    name: "Budget chain hotels (OYO, Treebo, Townhouse)",
    budget: "budget",
    area: "Near the bus stand, railway station and Alipiri",
    price: "About ₹700–1,800 a night in recent listings",
    bestFor: "Cheapest private rooms in town",
    amenities: ["AC rooms", "Close to the bus stand or Alipiri", "Book and cancel online"],
    note: "Quality varies by property; read recent reviews before booking.",
    sources: [{ label: "OYO Tirupati listings", url: "https://www.oyorooms.com/oyos-in-tirupati" }],
  },
  {
    name: "Bhimas Deluxe Hotel",
    budget: "mid",
    area: "Steps from Tirupati railway station, near Govindaraja Swamy temple",
    price: "Mid-range; check live rates",
    bestFor: "Arriving by train and wanting to walk everywhere",
    amenities: ["Walk to the railway station", "Bhimas Maya pure-veg restaurant inside"],
    sources: [{ label: "Restaurant Guru", url: "https://restaurant-guru.in/Bhimas-Deluxe-Hotel-Tirupathi-Tirupati" }],
  },
  {
    name: "Golden Tulip Tirupati",
    budget: "mid",
    area: "Tirumala Bypass Road, near the Alipiri toll plaza (about 4 km from the railway station)",
    price: "About US$37–40 a night in recent listings",
    bestFor: "Early starts up the ghat road",
    amenities: ["88 AC rooms", "Restaurant and fitness centre", "Free parking", "Airport shuttle (paid)"],
    sources: [
      { label: "Hotels.com", url: "https://th.hotels.com/en/ho2933398784/golden-tulip-tirupati-tirupati-india" },
      { label: "Momondo", url: "https://www.momondo.com/hotels/tirupati/Golden-Tulip-Tirupati.mhd9578154.ksp" },
    ],
  },
  {
    name: "Marasa Sarovar Premiere",
    budget: "upscale",
    area: "Tirupati town",
    price: "From about US$31 a night in a recent listing; often the best value in its class",
    bestFor: "Upscale comfort without a luxury price",
    amenities: ["121 AC rooms with minibar and safe", "Consistently among the best-rated hotels for value"],
    sources: [
      { label: "Tripadvisor", url: "https://www.tripadvisor.com/Hotels-g297587-zfc5-Tirupati_Chittoor_District_Andhra_Pradesh-Hotels.html" },
      { label: "Trip.com", url: "https://www.trip.com/hotels/tirupati-hotels-list-6054/" },
    ],
  },
  {
    name: "Fortune Select Grand Ridge (ITC Hotels group)",
    budget: "upscale",
    area: "Tirupati town",
    price: "From about US$52 a night in a recent listing",
    bestFor: "Families who want a reliable upscale stay with good food",
    amenities: ["Zodiac multi-cuisine restaurant with live counters", "Among the highest-rated hotels in Tirupati"],
    sources: [{ label: "Tripadvisor", url: "https://www.tripadvisor.com/Hotels-g297587-zfc5-Tirupati_Chittoor_District_Andhra_Pradesh-Hotels.html" }],
  },
  {
    name: "Ekanté Bliss, IHCL SeleQtions",
    budget: "upscale",
    area: "City centre, with views towards Tirumala (per IHCL)",
    price: "Upscale; check live rates",
    bestFor: "Pool, dining and a calm base after darshan",
    amenities: ["Swimming pool and fitness centre", "Vyom all-day diner and Azure open-air café", "Free valet parking", "Airport shuttle (paid)"],
    note: "Formerly Hotel Bliss; opened as an IHCL SeleQtions hotel in February 2024.",
    sources: [{ label: "IHCL press release", url: "https://www.ihcltata.com/press-room/ihcl-opens-ekante-bliss-ihcl-seleqtions-in-the-temple-city-of-tirupati-andhra-pradesh" }],
  },
  {
    name: "Taj Tirupati",
    budget: "luxury",
    area: "About 0.8 km from the city centre",
    price: "From about US$116 a night in a recent listing",
    bestFor: "The most premium stay in town",
    amenities: ["Taj service and dining", "Well rated across booking sites"],
    sources: [
      { label: "Trip.com", url: "https://in.trip.com/hotels/star5/city/in/tirupati.html" },
      { label: "eDreams", url: "https://www.edreams.co.uk/hotels/city/in/tirupati/" },
    ],
  },
];

export interface Ride {
  name: string;
  budget: Budget;
  route: string;
  price: string;
  bestFor: string;
  details: string[];
  sources: Source[];
}

export const RIDES: Ride[] = [
  {
    name: "Free APSRTC bus to Alipiri",
    budget: "free",
    route: "Tirupati railway station → Alipiri (and to Srivari Mettu)",
    price: "Free",
    bestFor: "Walkers heading to the footpath",
    details: ["Runs about every 30 minutes, per TTD"],
    sources: [{ label: "TTD transport facilities", url: "https://www.tirumala.org/TransportFacilities.aspx" }],
  },
  {
    name: "Walking up (Alipiri or Srivari Mettu)",
    budget: "free",
    route: "Footpaths from Tirupati to Tirumala",
    price: "Free",
    bestFor: "Pilgrims who want to walk, with free luggage transport",
    details: ["Leave luggage at the Alipiri toll gate for a token and collect it at the CRO counter in Tirumala, free of cost"],
    sources: [{ label: "TTD transport facilities", url: "https://www.tirumala.org/TransportFacilities.aspx" }],
  },
  {
    name: "TTD Dharma Radham buses",
    budget: "free",
    route: "Around Tirumala: cottages, choultries and temples",
    price: "Free",
    bestFor: "Getting around on the hill",
    details: ["12 buses, about every 3 minutes in set time slots, per TTD"],
    sources: [{ label: "TTD transport facilities", url: "https://www.tirumala.org/TransportFacilities.aspx" }],
  },
  {
    name: "APSRTC bus up the ghat road",
    budget: "budget",
    route: "Tirupati bus stand → Tirumala (about an hour)",
    price: "About ₹90 non-AC and ₹120 AC electric per adult in 2026 guides; TTD's older page lists ₹45",
    bestFor: "The cheapest ride up the hill",
    details: ["Buses every few minutes", "Return tickets bought in Tirupati are valid for three days, per TTD", "During Brahmotsavam buses run round the clock"],
    sources: [
      { label: "TTD: Tirupati to Tirumala by road", url: "https://www.tirumala.org/TirupatitoTirumalaByRoad.aspx" },
      { label: "Bus fare guide (2026)", url: "https://sritirupatibalajidarshan.com/tirupati-to-tirumala-bus-timings-ticket-fare/" },
    ],
  },
  {
    name: "Taxi or app cab",
    budget: "mid",
    route: "Tirupati → Tirumala",
    price: "About ₹800–1,500 one way; ₹1,800–2,500 for a round trip with waiting",
    bestFor: "Families with elders, small children or luggage",
    details: ["Use the railway station's prepaid counter or an app for a fixed fare", "Tolls, parking and extra waiting are usually not included"],
    sources: [
      { label: "Savaari fares", url: "https://www.savaari.com/tirupati/tirupati-to-tirumala-cabs" },
      { label: "Tirupati to Tirumala guide (2026)", url: "https://tirumalatirupatiguide.in/tirupati-to-tirumala/" },
    ],
  },
  {
    name: "Group contract bus",
    budget: "budget",
    route: "Tirupati ↔ Tirumala for a whole group",
    price: "₹900 per 45-seat bus on TTD's page (may be dated)",
    bestFor: "Large groups travelling together",
    details: ["Book on the spot or in advance"],
    sources: [{ label: "TTD transport facilities", url: "https://www.tirumala.org/TransportFacilities.aspx" }],
  },
];

export interface Eatery {
  name: string;
  budget: Budget;
  area: string;
  knownFor: string;
  sources: Source[];
}

export const EATERIES: Eatery[] = [
  {
    name: "TTD annaprasadam complex",
    budget: "free",
    area: "Tirumala",
    knownFor: "Free meals for every pilgrim through the day",
    sources: [{ label: "TTD", url: "https://www.tirumala.org/" }],
  },
  {
    name: "Sri Lakshmi Narayana Bhavan",
    budget: "budget",
    area: "Opposite Tirupati railway station",
    knownFor: "Budget North and South Indian vegetarian food",
    sources: [{ label: "MakeMyTrip food guide", url: "https://www.makemytrip.com/tripideas/best-restaurants-food-places-in-tirupati" }],
  },
  {
    name: "Hotel Mayura",
    budget: "budget",
    area: "209 T.P. Area, by the RTC bus stop",
    knownFor: "Spicy vegetarian South Indian tiffins and thalis",
    sources: [{ label: "SOTC food guide", url: "https://sotc.in/tourism/tirupati-tourism/food-in-tirupati" }],
  },
  {
    name: "Minerva Coffee Shop",
    budget: "budget",
    area: "Tirupati town",
    knownFor: "Dosas, idlis and thalis",
    sources: [{ label: "MakeMyTrip food guide", url: "https://www.makemytrip.com/tripideas/best-restaurants-food-places-in-tirupati" }],
  },
  {
    name: "Bhimas Maya Restaurant",
    budget: "mid",
    area: "Inside Bhimas Deluxe Hotel, near the railway station",
    knownFor: "Pure-veg South Indian thali with generous portions",
    sources: [{ label: "Restaurant Guru", url: "https://restaurant-guru.in/Bhimas-Deluxe-Hotel-Tirupathi-Tirupati" }],
  },
  {
    name: "Saravana Bhavan",
    budget: "mid",
    area: "Tata Nagar",
    knownFor: "Classic South Indian vegetarian",
    sources: [{ label: "HappyCow", url: "https://www.happycow.net/widget/asia/india/tirupati/" }],
  },
  {
    name: "Zodiac at Fortune Select Grand Ridge",
    budget: "upscale",
    area: "Tirupati town",
    knownFor: "Multi-cuisine with live counters (veg and non-veg; only in town, not on Tirumala)",
    sources: [{ label: "Restaurant listings", url: "https://www.makemytrip.com/tripideas/best-restaurants-food-places-in-tirupati" }],
  },
];

export interface Tour {
  name: string;
  details: string;
  sources: Source[];
}

export const TOURS: Tour[] = [
  {
    name: "IRCTC Tourism Tirupati packages",
    details: "Official IRCTC packages that bundle travel and darshan. Check inclusions and dates on the IRCTC site.",
    sources: [{ label: "IRCTC Tourism", url: "https://irctctourism.com/tirupati-tour-package" }],
  },
  {
    name: "APTDC local temples tour",
    details: "A third-party listing describes a local temples bus circuit (Tiruchanur, Govindaraja Swamy, Kodanda Rama, Srinivasa Mangapuram and more) from the Srinivasam and Vishnu Nivasam complexes. Confirm fares and timings with APTDC before relying on it.",
    sources: [{ label: "Listing (unverified)", url: "https://www.livechennai.com/tirupati_aptdc_package_tour.asp" }],
  },
];

export const SAFETY = [
  "In an emergency anywhere in India, dial 112.",
  "For a vehicle breakdown on the ghat roads, TTD lists a mobile mechanic van at 0877-2263636 (charges vary).",
];
