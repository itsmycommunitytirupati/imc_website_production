// IMC's own event photos, as light WebP copies in assets/photos/.
// Regenerate with `node scripts/optimize-photos.mjs` after adding originals to assets/.
const files = import.meta.glob("../../assets/photos/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

export function photo(name: string | number): string {
  const url = files[`../../assets/photos/${name}.webp`];
  if (!url) throw new Error(`Missing IMC photo: ${name}.webp`);
  return url;
}

// What each photo shows, so pages can pick the right one.
export const IMC_PHOTOS = {
  danceCrowd: photo(10),
  artTable: photo(11),
  danceCrowd2: photo(12),
  meetup: photo(13),
  floorCircle: photo(14),
  festiveMeetup: photo(15),
  badminton: photo(16),
  hillsTrek: photo(17),
  nightTurf: photo(18),
  meetup2: photo(19),
  hilltop: photo(20),
  meetup3: photo(21),
  womensCircle: photo(22),
  craftCircle: photo(23),
  bookTable: photo(24),
  waterfall: photo(25),
  meetup4: photo(26),
  bikeRide: photo(27),
  nightCricket: photo(28),
  tableTalk: photo(29),
  outdoorSelfie: photo(30),
  danceStudio: photo(31),
  boardGames: photo(32),
  houseFront: photo(33),
  carrom: photo(34),
  roundTable: photo(35),
  beachVolleyball: photo(36),
  classicalDance: photo(37),
  meetup5: photo(38),
  danceCrowd3: photo(39),
  bookClub: photo("about1"),
};

// Photo wall order (mixed so similar shots don't sit together).
export const WALL = [20, 37, 16, 11, 25, 14, 22, 36, 31, 17, 34, 13, 27, 23, 10, 30, 24, 18, 15, 32, 28, 33, 35, 19, 21, 29, 26, 38, 12, "about1"].map(photo);
