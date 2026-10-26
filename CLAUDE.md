# IMC Tirupati — project guide

IMC (It's My Community) is a people-first community in Tirupati. This repo is its website, rebuilt from the old club showcase into a **community-first site**
(events, communities, join, Adda, opportunities, stories, per the customer's brief), with a
visitor guide and AI guide for people coming to Tirupati under **Discover**. communitie.in is a
benchmark for product patterns only.

## The three surfaces

One Vite + React build serves all three. `src/App.tsx` picks the surface from the hostname, with
path fallbacks so previews and `workers.dev` can reach every surface.

| Surface | Production host | Preview path | Code | Purpose |
|---|---|---|---|---|
| Site | `imctirupati.com` | `/` | `src/site/` | Home, Discover (visitor), Events, Communities, Adda, Opportunities, Stories, Join, Saved |
| Guide | `help.imctirupati.com` | `/guide` | `src/guide/` | AI assistant for visitors: darshan, transport, parking, food, stays, nearby |
| Admin | `admin.imctirupati.com` | `/admin` | `src/admin/` | Team portal on the D1 API: events, RSVPs, communities, moderation, stories, verified numbers |

Site routes (switch in `App.tsx`; dynamic segments are split by hand):

| Route | Page | Notes |
|---|---|---|
| `/` | `site/HomePage.tsx` | Brief homepage: hero (Explore Events / Find Your People), What's happening, Find your people, Adda, Stories, Opportunities, Join band, "Visiting Tirupati?" band |
| `/discover` | `site/DiscoverPage.tsx` | The old visitor-first home (mock-up): Ask guide search, trip types, chat preview, seven hills |
| `/visitor-guide` | `VisitorGuidePage.tsx` | Anchors `#tirumala`, `#getting-around`, `#food-stays`, `#things-to-do` |
| `/events`, `/events/:slug` | `EventsPage.tsx`, `EventPage.tsx` | Filters in the URL (`when`, `date`, `category`, `price`, `area`, `beginner`); RSVP form, add-to-calendar |
| `/communities`, `/communities/:slug` | `CommunityPage.tsx`, `GroupPage.tsx` | Group pages with logo, host, next events, stories, join form |
| `/join` | `JoinPage.tsx` | `?group=<slug>` preselects a community; `INTERESTS` ids live here |
| `/adda` | `AddaPage.tsx` | Moderated posts, polls (`#post-<id>`), idea statuses, new-post form |
| `/opportunities` | `OpportunitiesPage.tsx` | Board, post form, propose-an-event form (`#propose`) |
| `/stories`, `/stories/:slug` | `StoriesPage.tsx`, `StoryPage.tsx` | Memory wall; removal links |
| `/report` | `ReportPage.tsx` | `?type=photo_removal` or report; `?about=` prefills |
| `/saved` | `SavedPage.tsx` | Bookmarked events (device only) |
| `/privacy`, `/terms` | old `LegalPage` | |

`/experiences` and `/community` redirect to `/events` and `/communities` (`?c=` becomes
`?category=`). Routing is a tiny History-API router in `src/lib/router.tsx`; use `<Link to>` and
`navigate()`, never full reloads. Desktop nav (lg and up): Discover · Events · Communities ·
Opportunities · Stories + Join IMC; below lg a full-screen menu. Mobile tab bar: Home · Events ·
People · Discover · Saved.

`/discover` keeps the "visitor-first concept" mock-up: hero search ("Ask guide", popular questions),
topic chips, official TTD band, trip types, example conversation, "Before you go" and a
"Namaskaram" close. Its hero (Tirumala gopuram, Seshachalam hills, family inset) must always say
*Tirupati* at a glance.

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

## AI guide (Worker agent)

`worker/` is the Worker entry (`wrangler.jsonc` → `main`). It serves `dist/` and answers
`POST /api/guide` (`GET /api/health` shows the model and search backend). The guide page calls it;
if it fails or times out (e.g. the free Workers AI allowance is used up, or on the Vercel copy),
the page falls back to the curated answers in `content/guide.ts`.

- **Model:** Workers AI `@cf/google/gemma-4-26b-a4b-it` (env `GUIDE_MODEL`), thinking switched off
  (`worker/llm.ts`), about 1 s per step. Free daily allowance: 10,000 neurons, roughly 50 to 80
  questions a day; first questions are cached for 6 hours (Cache API) to stretch it.
- **Agent loop (`worker/agent.ts`):** JSON protocol, max 5 steps. Tools (`worker/tools.ts`):
  `search_local_guide` (IMC notes, `worker/kb.ts`), `search_places` (directory in
  `content/places.ts`, filter by kind and budget), `web_search` (Tavily if `TAVILY_API_KEY` is set,
  else Wikipedia), `fetch_official_page` (allow-listed TTD/government hosts only).
- **Guardrails:** input length cap, per-IP rate limit, prompt-injection regex, Llama Guard 3 screen
  (`worker/guardrails.ts`); must gather evidence before answering; over-refusal guard for clearly
  on-topic questions; a second fact-check pass with the question and evidence; then hard rules in
  code: every number in an answer must appear in the evidence, links only from evidence,
  markdown/evidence labels stripped, max 6 points. Answers reply in the visitor's language.
- **Web search key (optional):** create a free Tavily key, then run `npx wrangler secret put TAVILY_API_KEY`
  yourself (never paste keys into chat or code).
- **Test:** `npx wrangler dev --port 8787`, then `node scripts/eval-guide.mjs` (10 cases incl.
  Telugu/Hindi, injection, off-topic, invented-phone and live-timing baits). Run it after any
  prompt or data change. For the UI, run `npm run dev` too (Vite proxies `/api` to 8787).
- **Places directory (`content/places.ts`):** stays, transport, food and tours by budget, each
  with sources and `CHECKED` date; shown in the visitor guide (`site/PlacesSections.tsx`) and used
  by the agent. Re-research and update the date at least monthly; never state a price without a source.

## Community backend (D1 + Worker API)

- **Database:** D1 `imc-community` (binding `DB`, id in `wrangler.jsonc`). Schema and seed in
  `migrations/` (0001 schema, 0002 sample seed, 0003 official community names, 0004 interest ids).
  Apply with `npx wrangler d1 migrations apply imc-community --local` (dev) or `--remote` (live).
  Add new migrations as numbered files; never edit applied ones.
- **Public API (`worker/community.ts`):** `GET /api/events|groups|adda|opportunities|stories|stats|config`,
  detail routes, `POST /api/rsvp|join|adda|adda/:id/vote|opportunities|submissions`. Validation errors
  return 422 `{error:"invalid", fields}` with messages forms show via `t()`. Spam control: honeypot
  field `website`, per-IP rate limits, and Cloudflare Turnstile once `TURNSTILE_SITE_KEY` (var) and
  `TURNSTILE_SECRET` (secret, set by the user) exist. RSVP capacity is enforced in one SQL statement;
  repeat RSVPs return the existing booking.
- **Admin API (`worker/admin.ts`):** `/api/admin/*`, Cloudflare Access JWT checked against
  `ACCESS_TEAM_DOMAIN` + `ACCESS_AUD`, email must be in `ADMIN_EMAILS`. Until those vars are set it
  answers 503 `not_configured` (localhost is allowed for dev). No deletes: unpublish or change status.
  Stories cannot be published without `consent_confirmed = 1`.
- **Share previews (`worker/meta.ts`):** `/events/*`, `/communities/*`, `/stories/*` run the Worker
  first (`run_worker_first`) to rewrite title/description/og tags from D1.
- **Sample content:** every seeded row has `is_sample = 1` and shows a **Sample** badge. IMC
  replaces them from the admin; untick Sample or unpublish when real content exists.
- **Counts:** no member/event numbers in code. The Communities page shows only what the admin
  saves under "Verified numbers" (`settings.stats`, with who verified and when).
- **Analytics (`src/lib/analytics.ts`):** GA4 events from the brief (`view_event_list`,
  `filter_events`, `view_event_detail`, `start_registration`, `registration_complete`, `join_group`,
  `select_interests`, `submit_idea`, `submit_opportunity`, `share_event`, `return_visit`). Never send
  names, contacts or free text.
- **Local dev:** `npx wrangler dev --port 8787` and `npm run dev`; open `http://127.0.0.1:3000`
  (on this machine another app answers on `localhost:3000` over IPv6).

## Commands

```bash
npm ci            # install
npm run dev       # http://127.0.0.1:3000 (also /guide and /admin); needs wrangler dev on 8787 for /api
npm run build     # production build into dist/
npx tsc --noEmit  # type-check; the old src/components/ still has known errors, new code must be clean
node scripts/check-i18n.mjs   # translation coverage (must be 0 missing)
```

Wrangler on this machine is logged in to the IMC Cloudflare account (`npx wrangler whoami`). If a
login is needed, `npx wrangler login --browser=false` works more reliably than the browser flow.
That OAuth login can't read Workers Builds settings or DNS; check those in the dashboard.
Branch previews: `npx wrangler versions upload --preview-alias redesign` (Workers Builds previews
fail), served at `https://redesign-imc-website-production.itsmycommunity-tirupati.workers.dev`.

## Code map

```
src/
  App.tsx              surface + route switch, old-route redirects
  lib/router.tsx       Link, navigate, useLocation
  lib/site.ts          contacts, official TTD links, GUIDE_BASE, language + saved hooks, usePageTitle
  lib/api.ts           API client: types, api/post, useApi (loading/error/reload), imageUrl, IST date helpers
  lib/analytics.ts     track() and trackReturnVisit() over GA4
  lib/i18n.ts          useT(); dictionaries load on demand per language
  content/             all copy and data, kept out of components
    visitor.ts         visitor guide topics
    guide.ts           curated guide answers + keyword matcher (fallback when the AI is down)
    places.ts          stays/transport/food/tours by budget, with sources and CHECKED date
    media.ts           stock photos (Unsplash hotlinks) + a few IMC photos
    photos.ts          IMC's own event photos (assets/photos/*.webp), named by what they show
    logos.ts           official community logos (assets/logos/<group-slug>.webp), logoFor(slug)
    community.ts       get-involved cards, FAQs, poster colours
  site/                pages; ui.tsx = Logo, GopuramIcon, Header, Footer, MobileTabBar, PageHero
  site/kit.tsx         shared: SampleBadge, loading/error/empty states, useForm + fields, Honeypot,
                       HumanCheck (Turnstile), ShareButton, EventCard, GroupCard, StoryCard, OpportunityCard
  guide/GuideApp.tsx   chat UI; reads ?q= and ?lang= from the home search
  admin/AdminApp.tsx   admin portal; generic Resource table + Editor driven by per-table configs
worker/                index.ts (routing), community.ts, admin.ts, meta.ts, http.ts, AI guide files
migrations/            D1 schema and seed
  data.ts, types.ts    real IMC clubs (WINGS_DATA), testimonials, stats, team (from the old site)
  components/          OLD site components. Only LegalPage and Maintenance are still used.
                       Don't build on them; delete once nothing imports them.
  config/Maintenance.ts  set IS_MAINTENANCE = true to show the maintenance page everywhere
```

## Customer brief (governs priorities)

`PLAN.md` holds the audit of the build against the customer's **Competitive Redesign Brief**
(21 Oct 2026): Keep / Improve / Build inventory, the 12-point handoff checklist, decisions pending
from IMC, and the phased plan (P0 events, RSVP, groups, join; P1 Adda, submissions, stories;
P2 signature features). Update its checklist statuses as work lands. Non-negotiables from the brief:

- **Do not copy competitor headlines, layout or brand styling** (communitie.in is a benchmark for
  product patterns only). Write in IMC's own Telugu-English voice.
- **No made-up counts, ratings or "biggest/best" claims; no placeholder events presented as live.**
- **Consent** for identifiable photos, member spotlights and testimonials, with a removal pathway.
- Every control works or is labelled "coming soon"; design loading, empty, error and success states.
- Never claim an RSVP/registration succeeded until the backend confirms it.

## Content rules

- **IMC is an independent community guide, not TTD.** Anything about darshan slots, prices,
  timings, dress code or rules must stay general and link to the official sources in
  `OFFICIAL` (`tirupatibalaji.ap.gov.in` for bookings, `tirumala.org` for info). Never invent
  exact timings, prices or step counts.
- **Sample events, stories, opportunities and Adda posts (seeded in D1) are fictitious
  placeholders** written in a Tirupati voice (Seven Hills Unplugged, Talakona Trail Weekend,
  Kalamkari Canvas Lab, Rayalaseema Ruchulu Food Walk, Alipiri Morning Run Club and so on), always
  badged **Sample**. Community names match IMC's official logos; hosts of the original eight are
  real captains. Avoid deity names and prasadam in event names, for respect.
- Joining: `/join` (or a community page) stores a join request; a host then adds the person to the
  WhatsApp group. There are no accounts or passwords; "Saved" lives in `localStorage`.
- Brief microcopy in use: "Tirupati is home. Let's make it your community.", "Weekend vachindhi.
  Excuses enduku?", "Don't just attend the scene. Create the scene.", "Talent undhi. Team ledhu.
  Let's fix that.", "Proof that we actually touched grass this weekend.", "Spotted yourself? Tag a
  friend, or ask us to take it down.", "Scene konchem silent ga undhi.", "You're in. Introvert mode
  can remain on."
- **Languages: English, Telugu, Tamil, Hindi.** Every visitor-facing string goes through
  `useT()` (`src/lib/i18n.ts`); dictionaries in `src/i18n/{te,ta,hi}.ts` are keyed by the English
  text, and missing keys fall back to English. After changing any copy, run
  `node scripts/check-i18n.mjs` (add `te --list` to see gaps) and translate the new keys in all
  three files (`node scripts/i18n-merge.mjs <file.json>` merges a `{ en: { te, ta, hi } }` file;
  `--unused` lists stale keys). The checker also collects the Worker's validation messages and
  skips meta descriptions. Event names, venues and member quotes stay as written. The guide also matches
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
- Communities page (`site/CommunityPage.tsx`) uses product patterns benchmarked on communitie.in
  with IMC's own copy and data: dotted hero ("Introvert mode allowed. Your people are here."), a
  "Coming up" ticker and fanned posters from live events, a scrolling photo wall behind "Welcome to
  IMC." with admin-verified numbers only, community cards with official logos, a WhatsApp mock-up
  labelled as an illustration, "Create the scene" cards, a stories teaser with a removal link,
  testimonials, FAQs and a saffron "See you this Sunday?" close. Telugu touches ("రండి! Randi") are
  welcome. Visitor pages stay calm and practical.
- The home page's example conversation is `site/ChatPreview.tsx`: a chat window that plays the
  exchange on scroll, and whose input opens the real guide.
- Shared building blocks in `site/ui.tsx`: `LanguageMenu`, `HillsSilhouette` (seven-ridge
  signature used in heroes and the footer), `PageHero` (photo header for inner pages), the
  scroll-aware `Header`, full-screen `MobileMenu` (rendered outside the header because its
  backdrop blur would trap a fixed overlay), and the dark `Footer`.
- Home signature pieces: live Telugu greeting by Tirupati time (`content/hills.ts`) and the
  interactive "Seven hills. One welcome." section. Visitor guide: sticky topic bar with
  scroll-spy, "Your journey up the hills" timeline, "Free on the hill". Events: sticky filter bar,
  grouping by This week / Next week / Later. Guide: hills banner, topic cards,
  thinking indicator, follow-up chips above the composer.
- Pages other than Home load on demand (`React.lazy` in `App.tsx`).
- Photos: put originals in `assets/`, run `node scripts/optimize-photos.mjs`, and use the WebP
  copies via `content/photos.ts`. Never ship the 2 MB originals to a page.
- Motion: wrap sections in `site/Reveal.tsx` (fade-up on scroll; respects reduced motion). Cards
  lift slightly on hover. Keep it subtle.
- Photos must match their subject: real IMC photos for clubs (`imcNature`, `imcArt`, `imcCircle`,
  `imcCrowd`), stock photos only where IMC has none.
- Check every change at 375px, 800px and 1200px or wider, with no sideways scroll. `/discover`
  keeps matching the visitor-first mock-up.
- Community logos: put IMC's originals in a folder and run `node scripts/import-logos.mjs <folder>`
  (map in the script); wide banners are listed in `content/logos.ts`.

## Roadmap

1. **Admin protection (blocks the admin):** Cloudflare Zero Trust → Access application covering
   `admin.imctirupati.com`, `imctirupati.com/admin*`, `imctirupati.com/api/admin/*` and the
   workers.dev equivalents, allowing `itsmycommunity.tirupati@gmail.com`. Then put the team domain
   and the AUD tag(s) in `wrangler.jsonc` vars (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`; several AUDs comma-separated).
2. **Turnstile (optional):** create a widget, put the site key in `TURNSTILE_SITE_KEY` and run
   `npx wrangler secret put TURNSTILE_SECRET` yourself.
3. **Sign-off and launch (PLAN.md step 8):** real events and communities from the admin, native
   review of te/ta/hi, apply migrations `--remote`, merge to `main`.
4. **Subdomains:** attach `help.imctirupati.com` and `admin.imctirupati.com` as Worker custom
   domains (`routes: [{ pattern, custom_domain: true }]`), then set `GUIDE_BASE` in `lib/site.ts`.
5. **Domain cutover:** point `imctirupati.com` and `www` at the Worker, remove the Vercel DNS
   records, and disconnect Vercel (Vercel has no D1, so the community pages only work on the Worker).
6. Restyle `/privacy` and `/terms`; trim the old `assets/` PNGs and the unused `src/components/`.
