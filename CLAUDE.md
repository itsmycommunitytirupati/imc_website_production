# IMC Tirupati — project guide

IMC (It's My Community) is a people-first community in Tirupati. This repo is its website, which is
being rebuilt from the old club showcase into a **visitor-first site**: a local welcome for people
coming to Tirupati, plus a youth-oriented community hub inspired by [communitie.in](https://communitie.in).

## The three surfaces

One Vite + React build serves all three. `src/App.tsx` picks the surface from the hostname, with
path fallbacks so previews and `workers.dev` can reach every surface.

| Surface | Production host | Preview path | Code | Purpose |
|---|---|---|---|---|
| Site | `imctirupati.com` | `/` | `src/site/` | Home (visitor-first), Visitor guide, Experiences, Community, Saved |
| Guide | `help.imctirupati.com` | `/guide` | `src/guide/` | AI assistant for visitors: darshan, transport, parking, food, stays, nearby |
| Admin | `admin.imctirupati.com` | `/admin` | `src/admin/` | Team dashboard: experiences, clubs, guide questions |

Site routes: `/`, `/visitor-guide` (anchors `#tirumala`, `#getting-around`, `#food-stays`,
`#things-to-do`), `/experiences` (`?c=<category>`), `/community` (anchors `#about`, `#clubs`,
`#get-involved`), `/saved`, `/privacy` and `/terms` (old legal page). Routing is a tiny
History-API router in `src/lib/router.tsx`; use `<Link to>` and `navigate()`, never full reloads.

The home page follows the "visitor-first concept" mock-up: hero search ("Ask guide", popular
questions) → topic chips → official TTD band → "Plan for the way you travel" (trip types that open
the guide with a prompt) → example conversation, "Make it your visit", "Discover the community" →
"Before you go" checklist and distances → a warm "Namaskaram" closing band. Mobile has a bottom
tab bar (Guide / Explore / Saved). The hero image is a composition: Tirumala gopuram and the
Seshachalam hills, with a family photo inset. It must always say *Tirupati* at a glance.

## Deploy pipeline (verified 2026-10-21)

```
push to GitHub ──► Cloudflare Workers Builds ──► Worker "imc-website-production"
itsmycommunitytirupati/                         https://imc-website-production.itsmycommunity-tirupati.workers.dev
imc_website_production   └──► Vercel (legacy) ──► www.imctirupati.com (current public domain)
```

- **Repo:** `itsmycommunitytirupati/imc_website_production`, production branch `main`.
- **Cloudflare:** account `itsmycommunity.tirupati@gmail.com` (id `cebb5851f945ae9fe3d02d832b36dc1f`).
  Build command `npm run build`, deploy command `npx wrangler deploy`, root `/`. `wrangler.jsonc`
  serves `dist/` as static assets in SPA mode. Keep it: preview builds (`wrangler versions upload`)
  fail without it. A push to `main` is live on workers.dev in about 50 seconds.
- **Vercel** (project `imc2026/imctirupati`) still serves `imctirupati.com` and also redeploys on
  every push (about 20 seconds). It retires when the domain moves to the Worker.
- **Every push to `main` is live for the public.** Work on a branch, check its preview, then merge.
  Non-production branches get preview builds on Cloudflare (Workers Builds "Previews") and Vercel.
- `public/deploy-check.txt` is a harmless probe: change it, push, and fetch
  `/deploy-check.txt` to confirm a deploy landed.

## Commands

```bash
npm ci            # install
npm run dev       # http://localhost:3000 (also /guide and /admin)
npm run build     # production build into dist/
npx tsc --noEmit  # type-check; the old src/components/ still has known errors, new code must be clean
```

Wrangler on this machine is logged in to the IMC Cloudflare account (`npx wrangler whoami`). If a
login is needed, `npx wrangler login --browser=false` works more reliably than the browser flow.
That OAuth login can't read Workers Builds settings or DNS; check those in the dashboard.

## Code map

```
src/
  App.tsx              surface + route switch
  lib/router.tsx       Link, navigate, useLocation
  lib/site.ts          contacts, official TTD links, GUIDE_BASE, language + saved hooks, usePageTitle
  content/             all copy and data, kept out of components
    visitor.ts         visitor guide topics
    experiences.ts     sample experiences (fictitious) + categories
    guide.ts           curated guide answers + keyword matcher (grounding notes for the future AI)
    media.ts           stock photos (Unsplash hotlinks) + a few IMC photos
    photos.ts          IMC's own event photos (assets/photos/*.webp), named by what they show
    community.ts       club circles, get-involved cards, FAQs, poster colours
  site/                main site pages; ui.tsx = Logo, GopuramIcon, Header, Footer, MobileTabBar
  guide/GuideApp.tsx   chat UI; reads ?q= and ?lang= from the home search
  admin/AdminApp.tsx   dashboard shell with sample data
  data.ts, types.ts    real IMC clubs (WINGS_DATA), testimonials, stats, team (from the old site)
  components/          OLD site components. Only LegalPage and Maintenance are still used.
                       Don't build on them; delete once nothing imports them.
  config/Maintenance.ts  set IS_MAINTENANCE = true to show the maintenance page everywhere
```

## Content rules

- **IMC is an independent community guide, not TTD.** Anything about darshan slots, prices,
  timings, dress code or rules must stay general and link to the official sources in
  `OFFICIAL` (`tirupatibalaji.ap.gov.in` for bookings, `tirumala.org` for info). Never invent
  exact timings, prices or step counts.
- **Experiences in `content/experiences.ts` are fictitious placeholders** (names, venues, dates),
  written in a Tirupati voice (Seven Hills Unplugged, Talakona Trail Weekend, Kalamkari Canvas Lab,
  Rayalaseema Ruchulu Food Walk, Alipiri Morning Run Club and so on). Club names are real. Replace
  them with real events from the admin once the events store exists. Avoid deity names and
  prasadam in event names, for respect.
- Joining is via WhatsApp (`CONTACT.whatsapp`, prefilled text). There are no accounts; "Saved" lives
  in `localStorage` on the device.
- **Languages: English, Telugu, Tamil, Hindi.** Every visitor-facing string goes through
  `useT()` (`src/lib/i18n.ts`); dictionaries in `src/i18n/{te,ta,hi}.ts` are keyed by the English
  text, and missing keys fall back to English. After changing any copy, run
  `node scripts/check-i18n.mjs` (add `te --list` to see gaps) and translate the new keys in all
  three files. Event names, venues and member quotes stay as written. The guide also matches
  Telugu/Tamil/Hindi keywords (`NATIVE_KEYWORDS` in `content/guide.ts`). Headlines in Indic
  scripts get extra line-height via `html:lang(..)` rules in `index.css`. The translations are
  machine-quality: have native speakers review them before launch.
- Photos: the hero is a South Indian family (Unsplash, credited in `media.ts`). Prefer IMC's own
  photos as they come in; keep `alt` text meaningful.

## Design system

- Tokens live in `src/index.css` under `@theme` (Tailwind v4): `brand` #c2410c (saffron),
  `brand-dark`, `brand-soft`, `cream` (page background), `peach` (bands), `ink`, `muted`, `line`.
- Type: **Plus Jakarta Sans** extra-bold for headings (`font-display`), **Inter** for body text.
- Light theme only. Rounded-xl cards with a 1px `line` border and a soft shadow; brand-coloured
  icons (lucide-react, plus `GopuramIcon` for temple topics).
- Community page (`site/CommunityPage.tsx`) follows communitie.in's richness with IMC's own
  content: dotted hero with a turmeric marker highlight and floating polaroids, a "Coming up"
  ticker, a scrolling photo wall behind "Welcome to IMC.", photo cards for the eight club circles
  (hover or tap to join), fanned event posters, a WhatsApp phone mock-up, tilted "Your passion"
  polaroids with handwritten notes (`font-hand`, Caveat), Instagram-style posts, a testimonial
  marquee, FAQs and a saffron "See you this Sunday?" close. Telugu touches ("రండి! Randi") are
  welcome. Visitor pages stay calm and practical.
- The home page's example conversation is `site/ChatPreview.tsx`: a chat window that plays the
  exchange on scroll, and whose input opens the real guide.
- Shared building blocks in `site/ui.tsx`: `LanguageMenu`, `HillsSilhouette` (seven-ridge
  signature used in heroes and the footer), `PageHero` (photo header for inner pages), the
  scroll-aware `Header`, full-screen `MobileMenu` (rendered outside the header because its
  backdrop blur would trap a fixed overlay), and the dark `Footer`.
- Home signature pieces: live Telugu greeting by Tirupati time (`content/hills.ts`) and the
  interactive "Seven hills. One welcome." section. Visitor guide: sticky topic bar with
  scroll-spy, "Your journey up the hills" timeline, "Free on the hill". Experiences: "This week's
  pick", grouping by This week / Next week / Coming up. Guide: hills banner, topic cards,
  thinking indicator, follow-up chips above the composer.
- Pages other than Home load on demand (`React.lazy` in `App.tsx`).
- Photos: put originals in `assets/`, run `node scripts/optimize-photos.mjs`, and use the WebP
  copies via `content/photos.ts`. Never ship the 2 MB originals to a page.
- Motion: wrap sections in `site/Reveal.tsx` (fade-up on scroll; respects reduced motion). Cards
  lift slightly on hover. Keep it subtle.
- Photos must match their subject: real IMC photos for clubs (`imcNature`, `imcArt`, `imcCircle`,
  `imcCrowd`), stock photos only where IMC has none.
- Check every change at 375px, 800px and 1200px or wider. The home page must keep matching the mock-up.

## Roadmap

1. **Subdomains:** attach `help.imctirupati.com` and `admin.imctirupati.com` as Worker custom
   domains (in `wrangler.jsonc`: `routes: [{ pattern, custom_domain: true }]`), then set
   `GUIDE_BASE` in `lib/site.ts` to `https://help.imctirupati.com`.
2. **Admin protection:** Cloudflare Access (Zero Trust) policy on `admin.imctirupati.com` *and*
   `imctirupati.com/admin*`, allowing only the IMC team's emails.
3. **AI guide:** add a Worker script (`/api/guide`) that calls the model with `content/guide.ts` and
   `content/visitor.ts` as grounding, plus official-source links in every answer. The model key goes
   in a Worker secret (`npx wrangler secret put ...`), never in the repo or the chat.
4. **Events store:** Cloudflare D1 for experiences and join requests; the admin writes through the
   Worker API.
5. **Domain cutover:** point `imctirupati.com` and `www` at the Worker, remove the Vercel DNS
   records, and disconnect Vercel.
6. Telugu and Hindi content; restyle `/privacy` to the new design; trim the old `assets/` PNGs
   (about 2 MB each) and the unused `src/components/`.
