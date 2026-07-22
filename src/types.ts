export interface TeamMember {
  name: string;
  role: string;
  image?: string;
}

export interface Activity {
  title: string;
  description: string;
  frequency: string;
}

export interface Wing {
  id: string;
  name: string;
  tagline: string;
  iconName: string; // Lucide icon identifier
  shortIntro: string;
  detailedDesc: string;
  activities: Activity[];
  team: TeamMember[];
  accentColor: string; // hex or tailwind class
  hoverAccent: string;
  image: string;
  gradient: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  wingId: string;
  wingName: string;
  date: string;
  location: string;
  description: string;
  image: string;
  badgeColor: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface EnquiryForm {
  fullName: string;
  email: string;
  phone: string;
  wing: string;
  enquiryType: string;
  message: string;
}
