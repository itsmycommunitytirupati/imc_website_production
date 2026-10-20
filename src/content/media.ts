import imcCircle from "../../assets/about1.jpeg";
import imcMoment2 from "../../assets/about2.jpeg";
import imcMoment3 from "../../assets/about3.jpeg";
import imcMoment4 from "../../assets/10.jpeg";

// Unsplash photos are hotlinked, as the Unsplash License allows.
// Swap any of these for IMC's own photos as they come in.
const unsplash = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const MEDIA = {
  hero: {
    src: unsplash("photo-1730130596425-197566414dc4", 1600),
    alt: "A South Indian family in traditional silk clothes sharing a festive moment at home",
    credit: "Photo: @cr029 on Unsplash",
    creditUrl: "https://unsplash.com/photos/LvelDKbCeZg",
  },
  meetups: unsplash("photo-1779903595001-b99b829e5ca3"),
  nature: unsplash("photo-1666545381278-e7c9bc5c0ac9"),
  culture: unsplash("photo-1757085242652-f8cd4d3de889"),
  // Real IMC moments.
  imcCircle,
  imcMoment2,
  imcMoment3,
  imcMoment4,
};
