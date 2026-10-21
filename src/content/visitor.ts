// Visitor guide content. Keep it practical and point to official TTD sources
// for anything that changes (slots, prices, timings, rules).

export type TopicId = "tirumala" | "getting-around" | "food-stays" | "things-to-do";

export interface Topic {
  id: TopicId;
  title: string;
  summary: string;
  sections: { heading: string; points: string[] }[];
  askPrompts: string[];
}

export const TOPICS: Topic[] = [
  {
    id: "tirumala",
    title: "Tirumala visit",
    summary: "Darshan options, what to wear and carry, and walking up the hills.",
    sections: [
      {
        heading: "Darshan options",
        points: [
          "Free (Sarva) darshan needs no booking, but the wait can run many hours on weekends and festival days.",
          "Special Entry Darshan gives you a time slot. Book it on the official TTD portal; slots are released in advance and go quickly.",
          "Walking up? Footpath pilgrims can get darshan tokens on the route when they are being issued. Check the current status before you start.",
          "Travelling with elders or someone with a disability? Look for the senior-citizen and differently-abled quota on the official portal.",
        ],
      },
      {
        heading: "Before you go up",
        points: [
          "Carry a government photo ID for every adult. It is needed for darshan and room bookings.",
          "Traditional dress is expected for darshan: dhoti or kurta-pyjama for men; saree, half-saree or churidar with dupatta for women.",
          "Phones, cameras and bags are not allowed inside the temple. Use the free deposit counters.",
          "Vehicles and bags are checked at the Alipiri toll gate at the foot of the ghat road.",
        ],
      },
      {
        heading: "Walking up the hills",
        points: [
          "Alipiri is the longer, traditional footpath that starts in Tirupati town.",
          "Srivari Mettu is shorter and steeper, starting near Srinivasa Mangapuram outside town.",
          "You can send luggage up from Alipiri and collect it at the top.",
          "Start early, carry water, and take it slow. There are rest points along both routes.",
        ],
      },
    ],
    askPrompts: ["Which darshan suits elderly parents?", "What should we wear for darshan?"],
  },
  {
    id: "getting-around",
    title: "Getting around",
    summary: "Arriving in Tirupati, getting up to Tirumala, and parking.",
    sections: [
      {
        heading: "Arriving",
        points: [
          "Tirupati railway station is in the town centre; Renigunta Junction is about 10 km away.",
          "Tirupati airport is at Renigunta, roughly 15 km from town.",
          "Autos and app cabs are easy to find at the station, bus stand and airport.",
        ],
      },
      {
        heading: "Up to Tirumala",
        points: [
          "APSRTC buses run often from the Tirupati bus stand to Tirumala. The ghat drive takes about an hour.",
          "Taxis and cabs go up too, and the drivers know the ghat-road rules.",
          "Up on the hill, free TTD buses connect the main stops.",
        ],
      },
      {
        heading: "Parking",
        points: [
          "Tirumala has several large parking areas, but they fill up early on weekends and festival days.",
          "Walking up? Park near Alipiri and come back down by bus.",
          "Parking in town near the temple streets is tight. An auto is usually easier.",
        ],
      },
    ],
    askPrompts: ["Where can we park at Tirumala?", "How do we get from the station to Tirumala?"],
  },
  {
    id: "food-stays",
    title: "Food & stays",
    summary: "Free meals on the hill, local breakfasts, and where to stay.",
    sections: [
      {
        heading: "Food",
        points: [
          "TTD's annaprasadam complex at Tirumala serves free meals to pilgrims through the day.",
          "In town, try a local breakfast: pesarattu, idli, upma and strong filter coffee.",
          "Tirumala is vegetarian. Alcohol, meat and tobacco are not allowed on the hill.",
        ],
      },
      {
        heading: "Stays",
        points: [
          "TTD rooms at Tirumala and Tirupati are booked on the official portal.",
          "Tirupati town has hotels for every budget near the bus stand and railway station.",
          "Book early for weekends, Brahmotsavam and school holidays.",
        ],
      },
    ],
    askPrompts: ["Find a family-friendly stay near the bus stand", "Where can we eat breakfast near Tirumala?"],
  },
  {
    id: "things-to-do",
    title: "Things to do",
    summary: "Temples, forts, waterfalls and the people of the city.",
    sections: [
      {
        heading: "Around Tirupati",
        points: [
          "Sri Padmavathi Ammavari Temple at Tiruchanur is about 5 km from town.",
          "Kapila Theertham, a temple and waterfall at the foot of the hills.",
          "Chandragiri Fort, a Vijayanagara-era fort with a small museum, is about 15 km away.",
          "Sri Kalahasti Temple is about 35 km away; the town is also home to Kalamkari art.",
          "Talakona Waterfall sits inside the Sri Venkateswara National Park, a couple of hours' drive away.",
          "The Sri Venkateswara Zoological Park is big, green and great with kids.",
        ],
      },
      {
        heading: "Meet the city",
        points: [
          "Join an IMC experience: food walks, sunrise runs, music evenings and treks, most of them open to visitors.",
        ],
      },
    ],
    askPrompts: ["What can we do with half a day free?", "Any nature spots near Tirupati?"],
  },
];

// Home page: plan by who's travelling. Each opens the guide with a prompt.
export const TRIP_TYPES = [
  { id: "first", title: "First visit", tip: "Book darshan early, carry ID, and keep the whole day free.", prompt: "It's our first visit to Tirumala. How should we plan?" },
  { id: "elders", title: "With elders", tip: "Take the bus up the ghat, plan rest breaks, and check the senior-citizen quota.", prompt: "We're travelling with elderly parents." },
  { id: "kids", title: "With little ones", tip: "Plan around naps, carry snacks, and save the zoo park for the afternoon.", prompt: "We're visiting with young kids." },
  { id: "walk", title: "Walking up", tip: "Alipiri or Srivari Mettu: start early and send your luggage up ahead.", prompt: "We want to walk up to Tirumala." },
  { id: "day", title: "Just one day", tip: "Darshan, a free meal on the hill, then Tiruchanur in the evening.", prompt: "Suggest a relaxed day plan around Tirupati" },
  { id: "weekend", title: "A long weekend", tip: "Add Chandragiri Fort, Sri Kalahasti, or a forest trail to Talakona.", prompt: "We have a weekend. What else can we see nearby?" },
] as const;

export const BEFORE_YOU_GO = [
  "Photo ID for every adult",
  "Traditional clothes for darshan",
  "Booking confirmations from the official portal",
  "Phones and bags go into the free deposit counters",
  "Water, a light snack and comfortable footwear",
  "A little cash; UPI works almost everywhere",
];

// Approximate, from Tirupati town centre.
export const DISTANCES = [
  { place: "Tirumala (by ghat road)", value: "about 20 km" },
  { place: "Tiruchanur temple", value: "about 5 km" },
  { place: "Renigunta Junction", value: "about 10 km" },
  { place: "Tirupati airport", value: "about 15 km" },
  { place: "Chandragiri Fort", value: "about 15 km" },
  { place: "Sri Kalahasti", value: "about 35 km" },
];

// Visitor guide: the usual flow of a Tirumala visit, start to finish.
export const JOURNEY = [
  { title: "Arrive in Tirupati", text: "By train, bus, or a flight into Renigunta." },
  { title: "Reach Alipiri", text: "The foot of the hills, where vehicles and bags are checked." },
  { title: "Go up the hills", text: "By bus or cab on the ghat road, or on foot." },
  { title: "Settle in at Tirumala", text: "Check in, deposit phones and bags, freshen up." },
  { title: "Darshan", text: "At your booked slot, in traditional clothes." },
  { title: "Annaprasadam", text: "A free meal, served to every pilgrim." },
  { title: "Back down and beyond", text: "Tiruchanur, Kapila Theertham, or an IMC evening." },
];

export const FREE_ON_THE_HILL = [
  { title: "Free meals", text: "Annaprasadam for every pilgrim" },
  { title: "Free buses", text: "Between the main stops on the hill" },
  { title: "Free luggage", text: "Sent up from Alipiri for walkers" },
  { title: "Free deposit counters", text: "For phones, cameras and bags" },
];
