import { Wing, CommunityEvent, GalleryItem } from "./types";
import image10 from "../assets/10.jpeg";
import image11 from "../assets/11.png";
import image12 from "../assets/12.png";
import image13 from "../assets/13.png";
import image14 from "../assets/14.png";
import image15 from "../assets/15.png";
import image16 from "../assets/16.png";
import image17 from "../assets/17.png";
import image18 from "../assets/18.png";
import image19 from "../assets/19.png";
import image20 from "../assets/20.png";
import image21 from "../assets/21.png";
import image22 from "../assets/22.png";
import image23 from "../assets/23.png";
import image24 from "../assets/24.png";
import image25 from "../assets/25.png";
import image26 from "../assets/26.png";
import image27 from "../assets/27.png";
import image28 from "../assets/28.png";
import image29 from "../assets/29.png";
import image30 from "../assets/30.png";
import image31 from "../assets/31.png";
import culture from "../assets/culture.jpeg";
import connect from "../assets/connect.jpeg";
import creator from "../assets/creator.jpeg";
import sports from "../assets/sports.jpeg";
import women from "../assets/women.jpeg";
import startup from "../assets/startup.jpeg";
import kids from "../assets/kids.jpeg";
import dance from "../assets/dance.jpeg";
import music from "../assets/music.jpeg";
import nature from "../assets/nature.jpeg";
import social from "../assets/social.jpeg";

import event from '../assets/members/Anudeep-event.jpeg';
import badminton from '../assets/members/Ganesh-badminton.jpeg';
import boardgame from '../assets/members/Guru-boadgame.jpeg';
import head from '../assets/members/Haasya-head.jpeg';
import cur from '../assets/members/Harshit-cue.jpeg';
import coreteam from '../assets/members/Kalyan-coreteam.jpeg';
import musiccap from '../assets/members/musiccaption.jpeg';
import volleyball from '../assets/members/Nitheesh-volleyball.jpeg';
import book from '../assets/members/Rohitha-book.jpeg';
import natures from '../assets/members/Tharun-nature.jpeg';
import cricket from '../assets/members/Uday-cricket.jpeg';
import kcore from '../assets/members/kushi-core.jpeg';
import kfounder from '../assets/members/liki-founder.jpeg'
import ajaydance from '../assets/members/ajaydance.jpeg'
import sakethpickelball from '../assets/members/sakethpickelball.jpeg'
import hostmic from '../assets/members/hostmic.jpeg'
import raveecycle from '../assets/members/raveecycle.jpeg'
import sohailteam from '../assets/members/sohailteam.jpeg'
import content from '../assets/members/content.jpeg'

export const WINGS_DATA: Wing[] = [
  {
    id: "culture",
    name: "Culture & Lifestyle",
    tagline: "Celebrating heritage, one tradition at a time.",
    iconName: "Palette",
    shortIntro: "A hub for traditional arts, local history, and the unique lifestyle of Tirupati.",
    detailedDesc: "The Culture & Lifestyle wing explores the rich tapestry of our local heritage. From food walks through ancient streets to workshops on traditional art forms like Kalamkari and local folklore, we bridge the gap between historical roots and modern daily living.",
    activities: [
      {
        title: "Heritage Food Walks",
        description: "Exploring authentic local eateries and learning the history behind traditional recipes and temple-town cuisines.",
        frequency: "Monthly"
      },
      {
        title: "Local Artisan Workshops",
        description: "Hands-on sessions with local craftsmen to learn pottery, weaving, and the traditional arts of the Rayalaseema region.",
        frequency: "Quarterly"
      }
    ],
    team: [{ name: "Rajesh Iyer", role: "Heritage Curator" }],
    accentColor: "from-violet-600 to-purple-500",
    hoverAccent: "bg-purple-500",
    image: culture,
    gradient: "from-purple-950 via-slate-900 to-black"
  },
  {
    id: "connect",
    name: "Connect Tirupati",
    tagline: "Bridging talent with opportunity.",
    iconName: "Briefcase",
    shortIntro: "The professional pulse of IMC, focused on talent acquisition and networking.",
    detailedDesc: "Connect Tirupati is our professional wing. We focus on bridging the gap between local talent and global opportunities, hosting career mixers, resume workshops, and networking events for the city's growing professional community.",
    activities: [
      {
        title: "Professional Mixers",
        description: "Structured networking events designed to connect freelancers, recruiters, and corporate professionals.",
        frequency: "Monthly"
      },
      {
        title: "Talent Spotlight",
        description: "Monthly digital features of local talent followed by offline interview-prep and referral circles.",
        frequency: "Ongoing"
      }
    ],
    team: [{ name: "Priya Sharma", role: "Networking Director" }],
    accentColor: "from-blue-600 to-cyan-500",
    hoverAccent: "bg-blue-600",
    image: connect,
    gradient: "from-blue-950 via-slate-900 to-black"
  },
  {
    id: "social",
    name: "Social Welfare Club",
    tagline: "Serve. Share. Make impact.",
    iconName: "Heart",
    shortIntro: "A purposeful space to give back, organize social drives, and build a kinder society.",
    detailedDesc: "The Social Welfare Club orchestrates environmental preservation, tree planting, food distribution campaigns, and educational activities at remote schools around Tirupati.",
    activities: [
      {
        title: "Green Tirupati Preservation",
        description: "Dedicated morning tree plantations and waste segregation awareness booths around water reservoirs.",
        frequency: "Monthly"
      },
      {
        title: "Kindness Kitchen",
        description: "Collaborative project serving home-cooked weekend meals to the homeless and those in need.",
        frequency: "Every Sunday"
      }
    ],
    team: [{ name: "Dr. Amit Prasad", role: "Director of Social Welfare" }],
    accentColor: "from-red-600 to-rose-500",
    hoverAccent: "bg-red-500",
    image: social,
    gradient: "from-rose-950 via-slate-900 to-black"
  },
  {
    id: "nature",
    name: "Nature Retreat Club",
    tagline: "Find peace in the wild.",
    iconName: "TreePine",
    shortIntro: "Eco-stays, trekking, and nature therapy for the urban soul.",
    detailedDesc: "Escape the concrete jungle. Slow mornings, muddy shoes, and the kind of quiet your phone can’t give you. Meet your tribe — people who’d rather chase a sunrise than a deadline.",
    activities: [
      // {
      //   title: "Forest Bathing",
      //   description: "Guided silent walks through the hill trails for mental rejuvenation and stress relief.",
      //   frequency: "Bi-weekly"
      // },
      // {
      //   title: "Eco-Camping",
      //   description: "Overnight stays in sustainable camps with star-gazing sessions and bonfire stories.",
      //   frequency: "Seasonal"
      // }
    ],
    team: [{ name: "Varun Teja", role: "Expedition Guide" }],
    accentColor: "from-emerald-600 to-green-500",
    hoverAccent: "bg-emerald-500",
    image: nature,
    gradient: "from-emerald-950 via-slate-900 to-black"
  },
  {
    id: "music",
    name: "IMC Music Club",
    tagline: "Where melodies bring people together.",
    iconName: "Music",
    shortIntro: "A space for singers, musicians, and everyone who simply loves music.",
    detailedDesc: "From acoustic jam sessions to live stage performances, the Music Club creates cozy spaces for people to connect through sound and rhythm. Whether you're a professional or an eager listener, there's a mic for you.",
    activities: [
      {
        title: "Sunset Jam Sessions",
        description: "Unplugged backyard circles with acoustic guitars, ukuleles, and percussions.",
        frequency: "Weekly"
      }
    ],
    team: [{ name: "Aarav Sharma", role: "Music Coordinator" }],
    accentColor: "from-indigo-600 to-blue-500",
    hoverAccent: "bg-indigo-500",
    image: music,
    gradient: "from-purple-950 via-slate-900 to-black"
  },
  {
    id: "sports",
    name: "Sports Club",
    tagline: "Play hard, stay fit.",
    iconName: "Trophy",
    shortIntro: "Bringing people together through healthy competition and team sports.",
    detailedDesc: "From weekend box cricket to high-intensity turf football, we break daily routines to spark childhood joy and physical fitness.",
    activities: [
      {
        title: "Turf Wars",
        description: "Weekend box cricket and football tournaments for all skill levels.",
        frequency: "Every Sunday"
      }
    ],
    team: [{ name: "Kiran Dev", role: "Sports Coordinator" }],
    accentColor: "from-orange-600 to-red-500",
    hoverAccent: "bg-orange-500",
    image: sports,
    gradient: "from-orange-950 via-slate-900 to-black"
  },
  {
    id: "startup",
    name: "Startup Club",
    tagline: "From Idea to Impact.",
    iconName: "Rocket",
    shortIntro: "The engine for entrepreneurs, builders, and visionaries in Tirupati.",
    detailedDesc: "We provide a launchpad for local innovators. Join us for pitch drills, mentor sessions, and co-founder matchmaking events to turn your vision into reality.",
    activities: [
      {
        title: "Pitch Perfect Sessions",
        description: "Mock pitching to investors followed by detailed peer review and business modeling.",
        frequency: "Monthly"
      }
    ],
    team: [{ name: "Sandeep Rao", role: "Startup Mentor" }],
    accentColor: "from-amber-600 to-yellow-500",
    hoverAccent: "bg-amber-600",
    image: startup,
    gradient: "from-amber-950 via-slate-900 to-black"
  },
  {
    id: "dance",
    name: "Dance Community 2.0",
    tagline: "Express through movement.",
    iconName: "Zap",
    shortIntro: "A vibrant space for choreography, fitness, and pure emotional expression.",
    detailedDesc: "Dance Community 2.0 is an evolution of rhythm. We explore contemporary, Bollywood, and folk dance as a form of fitness and creative release.",
    activities: [
      {
        title: "Choreography Labs",
        description: "Intensive 2-hour sessions learning routines from guest choreographers.",
        frequency: "Weekly"
      }
    ],
    team: [{ name: "Ishani Kapoor", role: "Lead Choreographer" }],
    accentColor: "from-pink-600 to-rose-500",
    hoverAccent: "bg-pink-500",
    image: dance,
    gradient: "from-pink-950 via-slate-900 to-black"
  },
  {
    id: "woman",
    name: "Woman Only Community",
    tagline: "Safe spaces, strong voices.",
    iconName: "Flower2",
    shortIntro: "A dedicated circle for women to network, learn, and empower each other.",
    detailedDesc: "A safe sanctuary where women share experiences, discuss career growth, and participate in wellness workshops focused on self-care and leadership.",
    activities: [
      {
        title: "Empowerment Circles",
        description: "Monthly discussions on personal finance, health, and leadership.",
        frequency: "Monthly"
      }
    ],
    team: [{ name: "Ananya Reddy", role: "Community Lead" }],
    accentColor: "from-fuchsia-600 to-pink-500",
    hoverAccent: "bg-fuchsia-500",
    image: women,
    gradient: "from-fuchsia-950 via-slate-900 to-black"
  },
  {
    id: "kids",
    name: "Kids & Parents Club",
    tagline: "Growing together.",
    iconName: "Baby",
    shortIntro: "Playful learning for kids and supportive resources for parents.",
    detailedDesc: "Modern parenting can be isolating. We create play-based learning sessions for children while providing a support network for parents to exchange advice.",
    activities: [
      {
        title: "Mini-Makers Lab",
        description: "Sensory play and creative arts for kids aged 4-10.",
        frequency: "Weekly"
      }
    ],
    team: [{ name: "Meera Nair", role: "Family Coordinator" }],
    accentColor: "from-sky-600 to-blue-500",
    hoverAccent: "bg-sky-500",
    image: kids,
    gradient: "from-sky-950 via-slate-900 to-black"
  },
  {
    id: "creator",
    name: "Creator Club",
    tagline: "Frame your story.",
    iconName: "Camera",
    shortIntro: "For the YouTubers, Photographers, and Digital Storytellers.",
    detailedDesc: "Whether it's DSLR photography or mobile reels, the Creator Club is where we master the art of storytelling in the digital age.",
    activities: [
      {
        title: "Photowalks",
        description: "Capturing the cinematic side of Tirupati's streets and architecture.",
        frequency: "Monthly"
      }
    ],
    team: [{ name: "Siddharth Roy", role: "Creative Director" }],
    accentColor: "from-rose-600 to-orange-500",
    hoverAccent: "bg-rose-500",
    image: creator,
    gradient: "from-rose-950 via-slate-900 to-black"
  }
];

export const EVENTS_DATA: CommunityEvent[] = [
  {
    id: "evt1",
    title: "Startup Pitch Night",
    wingId: "startup",
    wingName: "Startup Club",
    date: "25 May 2026",
    location: "IT Hub Center, Tirupati",
    description: "Watch 5 local founders pitch their ideas to a panel of mentors. Networking and snacks included.",
    image: startup,
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "evt2",
    title: "Forest Birdwatching",
    wingId: "nature",
    wingName: "Nature Retreat",
    date: "02 June 2026",
    location: "Seshachalam Biosphere",
    description: "An early morning guided tour to spot rare bird species in their natural habitat.",
    image: nature,
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  {
    id: "evt3",
    title: "Dance & Fitness Workshop",
    wingId: "dance",
    wingName: "Dance Community",
    date: "10 June 2026",
    location: "City Fitness Studio",
    description: "A high-energy fusion of Bollywood and contemporary dance movements.",
    image: dance,
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal1",
    url: music,
    title: "Music Jam Session",
    category: "Music"
  },
  {
    id: "gal2",
    url: startup,
    title: "Startup Brainstorming",
    category: "Startup"
  },
  {
    id: "gal3",
    url: dance,
    title: "Dance Performance prep",
    category: "Dance"
  },
  {
    id: "gal4",
    url: nature,
    title: "Nature Trekking",
    category: "Nature"
  }
];

export const TESTIMONIALS = [
  {
    quote: "Building Connect Tirupati has been about creating the social space I always felt our city was missing. It's rewarding to see strangers become family.",
    author: "Kalyan. TN",
    role: "Core Team"
  },
  {
    quote: "Every poster and design I create is a tribute to the vibrant energy of this community. I love giving a visual voice to our incredible events.",
    author: "Anudeep",
    role: "Event Design Executive"
  },
  {
    quote: "There’s a unique magic in seeing an event go from a plan on paper to a room full of smiling people. Operations is where the heart of the club beats.",
    author: "Haasya Vanteru",
    role: "Head of events & Operations"
  },
  {
    quote: "The Badminton Club isn't just about the score; it’s about that morning adrenaline and the post-match coffee that starts the day right.",
    author: "Ganesh",
    role: "Captain - Badminton Club"
  },
  {
    quote: "Music has a way of breaking down walls. In our jam sessions, I’ve seen people find their confidence and their tribe through a simple melody.",
    author: "Neeyati",
    role: "Captain - Music Community"
  },
  {
    quote: "I love watching a group of people start a board game as strangers and finish it as friends. That’s the real win at the Board Games Club.",
    author: "Guru",
    role: "Captain - Board Games Club"
  },
  {
    quote: "The Book Club is my sanctuary. There is nothing more intellectually fulfilling than diving into a story and seeing it through twelve different perspectives.",
    author: "Rohitha Reddy",
    role: "Captain - Book Club"
  },
  {
    quote: "The Cue Club is about precision and patience. It’s the perfect way for our members to switch off from work and focus on the game.",
    author: "Harshith",
    role: "Captain - Cue Club"
  },
  {
    quote: "Nothing beats the high-stakes energy of a volleyball match. It’s where I see the true grit and teamwork of our community shine.",
    author: "Nitheesh",
    role: "Captain - Volleyball Club"
  },
  {
    quote: "Leading the Nature Retreats has reminded me that peace is just a short trek away. We help people disconnect to truly reconnect.",
    author: "Tharun Reddy",
    role: "Captain - Nature Retreat"
  },
  {
    quote: "Sunday morning cricket is a ritual. It’s about keeping that childhood passion alive while building professional networks on the pitch.",
    author: "Uday",
    role: "Captain - Cricket Club"
  },
  {
    quote: "Being part of the Core Team has shown me the power of community. Every event we host is a step toward a more connected Tirupati.",
    author: "Khushi",
    role: "Core Team"
  }
];

export const STATS = [
  { label: "50+ CLUBS", description: "Specialized Communities", icon: "Layers" },
  { label: "700+ EVENTS", description: "Conducted Annually", icon: "Calendar" },
  { label: "40k+ MEMBERS", description: "Active Community", icon: "Users" },
  { label: "ONE ❤️", description: "One Heart for Tirupati", icon: "Heart" }
];

export const localImages = [image30, image10, image11, image12, image13, image14, image15, image16, image17, image18, image19, image20, image21, image22, image23, image24, image25, image26, image27, image28, image29, image31];

export interface TribeMember {
  name: string;
  role: string;
  img: string;
}

export const TRIBE_MEMBERS: TribeMember[] = [
  { name: "Likhith. KN", role: "Founder - Strategy & Growth", img: kfounder },
  { name: "Haasya Vanteru", role: "Head of events & Operations", img: head },
  { name: "Kalyan. TN", role: "Core Team", img: coreteam },
  { name: "Anudeep", role: "Event Design Executive", img: event },
  { name: "Khushi", role: "Core Team", img: kcore },
  { name: "Uday", role: "Captain - Cricket Club", img: cricket },
  { name: "Ganesh", role: "Captain - Badminton Club", img: badminton },
  { name: "Neeyati", role: "Captain - Music Community", img: musiccap },
  { name: "Rohitha Reddy", role: "Captain - Book Club", img: book },
  { name: "Harshith", role: "Captain - Cue Club", img: cur },
  { name: "Nitheesh", role: "Captain - Volleyball Club", img: volleyball },
  { name: "Tharun Reddy", role: "Captain - Nature Retreat", img: natures },
  { name: "Guru", role: "Captain - Board Games Club", img: boardgame },
  { name: "Ajay Varma", role: "Captain - Dance Club", img: ajaydance },
  { name: "Ajay Varma", role: "Captain - Pickleball", img: sakethpickelball },
  { name: "Aravind. Jv", role: "Host - Mic.tirupati", img: hostmic },
  { name: "Ravee", role: "Captain - Cycling Club", img: raveecycle },
  { name: "Sohail", role: "Organising Team", img: sohailteam },
  { name: "Nikhila", role: "Content Writer - Mic.tirupati", img: content },

];