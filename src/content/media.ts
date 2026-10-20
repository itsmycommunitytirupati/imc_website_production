import { photo } from "./photos";

// Unsplash photos are hotlinked, as the Unsplash License allows.
// Swap any of these for IMC's own photos as they come in; a real shoot of a
// visiting family at Alipiri or Tirumala would beat every stock photo here.
const unsplash = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const MEDIA = {
  // Hero is a composition: Tirumala and the Seshachalam hills, with a family inset.
  hills: {
    src: unsplash("photo-1741003412854-bd4b264c4af3", 1600),
    alt: "The white gopuram of Tirumala temple against the green Seshachalam hills",
    credit: "@theushakiran",
    creditUrl: "https://unsplash.com/photos/NreNNb8Wn2M",
  },
  family: {
    src: unsplash("photo-1657912230234-87f45165424d", 700),
    alt: "A smiling young family with their toddler, out on a family trip",
    credit: "@nilankakariyawasam",
    creditUrl: "https://unsplash.com/photos/AKk37Avu6o8",
  },
  cliffs: unsplash("photo-1605357310334-5f19dd682b5c"),
  townView: unsplash("photo-1623039003809-6ecabd1e2b1c"),
  trek: unsplash("photo-1666545381278-e7c9bc5c0ac9"),
  dosa: unsplash("photo-1694849789325-914b71ab4075"),
  cricket: unsplash("photo-1706102005390-2d1f41fdddcd"),
  guitar: unsplash("photo-1791326457073-2fcd8ff789b7"),
  sketching: unsplash("photo-1757085242652-f8cd4d3de889"),
  // Real IMC moments.
  imcCircle: photo("about1"), // book club around a long table
  imcNature: photo("about2"), // Nature Retreat outing
  imcArt: photo("about3"), // Art & Craft Club
  imcCrowd: photo(10), // big group shot after a dance session
};
