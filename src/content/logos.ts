// IMC's official community logos and banners (assets/logos/<group-slug>.webp).
// Import new ones with `node scripts/import-logos.mjs <folder>`.
const files = import.meta.glob("../../assets/logos/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

// These three are wide banners rather than square badges.
const BANNERS = new Set(["women-community", "social-welfare", "music-club"]);

export function logoFor(slug: string | null | undefined): { url: string; banner: boolean } | null {
  if (!slug) return null;
  const url = files[`../../assets/logos/${slug}.webp`];
  return url ? { url, banner: BANNERS.has(slug) } : null;
}
