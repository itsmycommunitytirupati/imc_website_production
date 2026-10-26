# IMC website: plan against the customer brief

Source: **IMC Website Competitive Redesign Brief**, 21 October 2026 (second customer communication).
The brief asks the builder to audit the current build first (Keep / Improve / Build), implement only
the gaps, and return a 12-point checklist with evidence. This file is that audit and the plan.

Preview audited: https://redesign-imc-website-production.itsmycommunity-tirupati.workers.dev
(branch `redesign/visitor-first-home`, audit date 26 October 2026).

---

## 1. Must-fix before anything new (brief violations in the current build)

| # | Issue | Brief rule | Where | Fix |
|---|---|---|---|---|
| F1 | Six community headings are near-copies of communitie.in ("When did you last do something for the first time?", "Experiences, together.", "Your passion, our platform.", "Your social circle, a tap away.", "Is that you in the picture?", "Keep exploring") | "Do not copy competitor headlines, layout or brand styling" | `src/site/CommunityPage.tsx` | Rewrite in IMC's own voice using the brief's microcopy (see §6). Keep proven patterns (photo cards, posters) but restyle so the page reads as IMC, not a clone. |
| F2 | "50+ clubs · 700+ events a year · 40k+ members" (carried over from the old site's `STATS`) | "Do not use made-up user counts…" | `CommunityPage.tsx`, `src/data.ts` | Remove until IMC confirms each number with a source; then show only verified figures. |
| F3 | 12 fictitious experiences shown with real dates and "I'm in" buttons | "No fake counts or placeholder events presented as live data" | `content/experiences.ts`, Experiences, Community, Home ticker | Replace with IMC's real upcoming events; until then label every card **Sample** on previews and never ship them to production. |
| F4 | Real member photos (photo wall, club cards, IG-style posts) and named testimonials used without recorded consent | "Explicit consent for identifiable photos… removal pathway" | `content/photos.ts`, `data.ts` `TESTIMONIALS` | IMC confirms consent (or swaps photos); add a "Request a photo removal" link in the footer and on the photo wall. |
| F5 | WhatsApp phone mock shows a chat and poll that never happened | "No fake… data presented as live" | `CommunityPage.tsx` `WhatsAppPocket` | Relabel as an illustration ("What the club group looks like") or replace with a real, consented screenshot. |

These are small, and should land before the customer reviews the next preview.

**Status (26 October 2026): all five fixed.** F1 headings rewritten in IMC's voice (all four
languages); F2 counts removed and replaced by admin-verified numbers only; F3 every sample event,
community, story, opportunity and Adda post carries a **Sample** badge (and event pages a banner);
F4 consent confirmed by IMC, removal pathway in footer, stories and `/report`; F5 phone mock
labelled "Illustration".

---

## 2. Feature inventory: Keep / Improve / Build

Status key: **Keep** = meets the brief; **Improve** = exists, needs changes; **Build** = missing.

### Homepage and navigation (brief §3)

| Brief item | Current build | Status | Notes |
|---|---|---|---|
| Hero: value prop, real local visual, CTAs **Explore Events** + **Find Your People** | Home hero "Feel at home in Tirupati" + Ask guide (visitor-first mock-up); Community hero with 3 CTAs | **Improve** | Depends on decision D1 (§5). |
| 02 What's happening (event cards → detail, See all) | Home "Discover the community" (3 category cards); Community poster fan; Experiences page | **Improve** | Needs real events, availability, and a detail page per event. |
| 03 Find your people (interest tiles → active group) | Community "Find your tribe" 8 circles → WhatsApp | **Improve** | Tiles must open a group page with owner, status and next event. |
| 04 Tirupati Adda (polls, questions, ideas) | — | **Build (P1)** | Only with moderation in place. |
| 05 People and stories | Photo wall, testimonial marquee | **Improve** | Consent (F4), recaps linked to next event. |
| 06 Opportunities (gigs, volunteer, collab; paid vs voluntary) | "Your passion" 3 cards → WhatsApp/email | **Build** | Opportunity board with compensation, eligibility, deadline. |
| 07 Join IMC (signup, benefits, privacy, first action) | WhatsApp "say hi" | **Build** | Lightweight join form; browse-first stays. |
| Nav: Discover · Events · Communities · Opportunities · Stories · Join IMC | Visitor guide · Experiences · Community · Contact | **Improve** | Proposal: Discover = visitor guide + AI guide. |
| Mobile-first, tap targets, light motion | Done; checked at 375/800/1200 | **Keep** | Re-check after changes; trim motion where it delays content. |

### P0 foundation (brief §4)

| Brief item | Current build | Status |
|---|---|---|
| A. Event cards: title, image, date/time, location, price/free, organizer | Experience cards have all of these | **Keep** |
| A. Filters: today / this weekend / choose date, category, free/paid, location | Category chips; grouped This week / Next week / Coming up | **Improve** |
| A. Event detail page (description, venue/address, start/end, price, organizer/contact, accessibility/age notes, cancellation terms, RSVP) | None; "I'm in" opens WhatsApp | **Build** |
| A. RSVP with backend confirmation + share link; never claim success early | WhatsApp prefill (makes no false claim) | **Build** |
| A. Empty / loading / error / sold-out / cancelled states | Empty state only | **Improve** |
| B. Group pages (name, description, interests, moderator, activity status, next event; preview before joining) | Club circles only | **Build** |
| C. Signup + first-session onboarding (minimal fields, optional interests, one recommended action, visibility explained) | No accounts; Saved is device-only | **Build** |

### P1 community (brief §5)

| Brief item | Status |
|---|---|
| D. Tirupati Adda with categories, moderation, report/close, idea status (received → completed / not proceeding) | **Build** |
| E. Organizer/creator submission form → review queue → publish; spam prevention; opportunity board | **Build** (admin today is a sample-data shell) |
| F. Event recap pages, consented photos, share cards, no attendee lists | **Build** (photo wall exists; see F4) |
| G. Local Legend badges with visible criteria, moderator control | **Build (P2)** |
| H. Guidelines, privacy, terms, event policies; report pathways; role-based admin; minimum data | **Improve**: `/privacy`, `/terms` exist (old styling, includes Code of Conduct); add removal/report paths, Cloudflare Access for admin, data retention notes |

### IMC differentiators (brief §6)

| Concept | Status | Notes |
|---|---|---|
| Tirupati Pulse (city snapshot) | **Improve** | Visitor guide, AI guide and live greeting are a strong base; add upcoming events, polls and opportunities once real. |
| Solo No More (beginner-friendly label + what to expect) | **Build** | Cheap to add to event detail once events are real. |
| IMC Talent Exchange | **Build (P2)** | |
| IMC Memory Wall | **Improve** | Photo wall → searchable recaps linked to next events, with consent. |
| Community Passport / Local Legend | **Build (P2)** | Needs contribution tracking. |
| IMC Wrapped | **Build (later)** | Real data only. |

### Already ahead of the brief (keep)
- **AI guide** (`worker/`): grounded, sourced, fact-checked answers in four languages with guardrails.
- **Visitor guide**: stays / transport / food by budget with sources and checked dates.
- **Four languages** (English, Telugu, Tamil, Hindi) with a coverage checker.
- **Performance**: WebP photos, lazy-loaded pages, reduced-motion support.

---

## 3. Handoff checklist (brief §9): status today

Updated 26 October 2026 after steps 0 to 7 landed on `redesign/visitor-first-home` (preview only).

| No. | Acceptance criterion | Status | Evidence / gap |
|---|---|---|---|
| 01 | Homepage explains IMC and offers clear next actions | Done | Community-first home: hero (Explore Events / Find Your People), What's happening, Find your people, Adda, Stories, Opportunities, Join IMC, "Visiting Tirupati?" band. Visitor home moved to `/discover`. |
| 02 | Visitor can discover upcoming events and filter | Done | `/events`: any day / today / this weekend / pick a date, category, free/paid, area, first-timer friendly; filters live in the URL. Events are **Sample** until IMC adds real ones. |
| 03 | Event detail page: date/time, venue, price, organizer, registration | Done | `/events/:slug` with maps link, price note, host, age/accessibility/cancellation notes, Solo No More note, related events. |
| 04 | RSVP flow with tested confirmation and error states | Done | Saved in D1 with a reference; field errors, sold-out → waitlist, cancelled, ended, offline, rate-limit and repeat-booking states; confirmation only after the server confirms; add-to-calendar and share. Tested locally. |
| 05 | Interest groups connect to events and activities | Done | `/communities` and `/communities/:slug` with official logos, host, status, interests, next events, past stories. |
| 06 | New member takes one meaningful first action without friction | Done | `/join` (name, one contact, optional interests and community) → "You're in. Introvert mode can remain on." with one suggested first event. Join form also on every community page. |
| 07 | Organizer can submit an event/opportunity for review | Done | `/opportunities` post form and propose-an-event form → admin review queue. |
| 08 | Community submissions: moderation, status, reporting rules | Done | Adda posts are unpublished until approved; idea statuses; poll close; report links on posts and events; `/report`; Adda rules. |
| 09 | Member stories/photos: consent and removal pathway | Done | Stories need `consent_confirmed` to publish (enforced by the API); removal links in footer, stories and story pages; `/report?type=photo_removal`. |
| 10 | Mobile, performance, accessibility, share previews checked | Done (re-check on preview) | Checked at 375/800/1280 with no sideways scroll; per-event/community/story share previews from the Worker; translations load only when chosen (main bundle 390 kB, 122 kB gzipped). |
| 11 | Analytics for discovery, registration, joins, submissions, return visits | Done (verify in GA4 after launch) | All 11 brief events fire through the existing GA4 tag; no personal data in parameters. |
| 12 | Admin can update events, stories, groups without a developer | Done, pending Access | `/admin`: overview, events, RSVPs (CSV), communities, join requests, Adda moderation, opportunities, stories, proposals & reports, verified numbers. Locked until Cloudflare Access is configured. |

---

## 4. How the P0 build would work (proposal)

- **Data:** Cloudflare D1 (free tier) with tables `events`, `groups`, `rsvps`, `members`,
  `submissions` (events / opportunities / ideas), `stories`, `consents`, `audit_log`.
- **API:** routes in the existing Worker (`worker/`): `GET /api/events`, `GET /api/events/:slug`,
  `POST /api/rsvp`, `GET /api/groups/:slug`, `POST /api/join`, `POST /api/submissions`;
  admin routes under `/api/admin/*`.
- **RSVP:** name + phone (or email) + optional interests; server confirms and returns a
  reference; capacity enforced in the database (sold-out state); confirmation screen with share
  link and "add to calendar". WhatsApp stays as the human channel.
- **Spam and safety:** Cloudflare Turnstile on every public form; rate limits; everything
  user-submitted lands in a review queue.
- **Admin:** `admin.imctirupati.com` behind Cloudflare Access (IMC team emails only);
  create/edit events, groups, stories; approve submissions; export RSVPs.
- **Pages:** `/events/:slug` and `/communities/:slug`; the Worker injects title/description/image
  meta tags so WhatsApp and Instagram show proper share previews.
- **Analytics:** GA4 events named as in the brief (`view_event_list`, `filter_events`,
  `view_event_detail`, `start_registration`, `registration_complete`, `join_group`,
  `select_interests`, `submit_idea`, `submit_opportunity`, `share_event`, `return_visit`), no
  personal data in properties.
- **Privacy:** collect only name + one contact method; retention rule (for example RSVPs deleted
  90 days after the event); privacy page updated before launch.

---

## 5. Decisions and inputs from IMC (answered 26 October 2026)

| # | Decision / input | Answer | What we do |
|---|---|---|---|
| D1 | Homepage direction | Not answered yet | Proceed with the recommendation: the brief's community-first homepage and nav, visitor guide + AI guide under **Discover** and a "Visiting Tirupati?" band. Easy to revisit. |
| D2 | Real events and 4–6 groups with owners | **Keep the dummy content for now** | Dummy events and groups stay for representation, seeded into the database with a `sample` flag and shown with a visible **Sample** badge, so nothing looks like a live listing. Swap in real ones from the admin before public launch. |
| D3 | Verified numbers (clubs, events, members) | IMC contact given: 9550815185 | Counts hidden until someone at IMC confirms each figure; then they're entered in the admin and shown. |
| D4 | Photo and testimonial consent | **Done** | Keep photos; still add a "request a photo removal" link (the brief requires a removal pathway). |
| D5 | Admin access | **itsmycommunity.tirupati@gmail.com** | Only this email gets into the admin (Cloudflare Access). |
| D6 | Moderation | **The project owner, in the admin portal** | Review queue for submissions, ideas, stories and reports in the admin. |

---

## 6. Copy direction (brief voice: funny, local, welcoming; information stays clear)

Replacements for the copied headings (F1), drawn from the brief's sample microcopy:

| Now (too close to competitor) | Proposed IMC copy |
|---|---|
| When did you last do something for the first time? | **Tirupati is home. Let's make it your community.** |
| Experiences, together. | **Weekend vachindhi. Excuses enduku?** (Weekend's here. Why the excuses?) |
| Your passion, our platform. | **Don't just attend the scene. Create the scene.** |
| (creator cards) | **Talent undhi. Team ledhu. Let's fix that.** |
| Your social circle, a tap away. | **Proof that we actually touched grass this weekend.** (stories/recaps) |
| Is that you in the picture? | **Spotted yourself? Tag a friend, or ask us to take it down.** |
| (empty states) | **Scene konchem silent ga undhi. Help us make the next one happen.** |
| (after joining) | **You're in. Introvert mode can remain on.** |

---

## 7. Delivery plan

Each step ends with a refreshed preview link and the checklist (§3) updated. Nothing goes to
`main` (the public site) until IMC signs off on Phase 1.

**Progress (26 October 2026):** steps 0 to 7 are built on `redesign/visitor-first-home` and on the
preview. Open items: Cloudflare Access for the admin (step 5), optional Turnstile keys, then
step 8 (sign-off, real content, native-speaker review, domain move).

| Step | What gets built | Checklist items | Needs from IMC |
|---|---|---|---|
| **0. Brief fixes** | F1 rewrite copied headings in IMC voice (all 4 languages); F2 hide counts; F3 **Sample** badges on dummy events/groups; F4 photo-removal link; F5 label the phone mock as an illustration | — | — |
| **1. Homepage + navigation** | Nav: Discover · Events · Communities · Opportunities · Stories · Join IMC. Home: hero (*Tirupati is home…*, Explore Events / Find Your People), What's happening, Find your people, Stories, Opportunities, Join IMC, plus a "Visiting Tirupati?" band linking the visitor guide and AI guide | 01 | — |
| **2. Backend foundation** | Cloudflare D1 database (events, groups, RSVPs, members, submissions, stories, reports) seeded with the sample content; Worker API; Turnstile spam protection on forms | — | — |
| **3. Events** | `/events` with filters (today, this weekend, pick a date, category, free/paid, area); `/events/:slug` detail (venue, start/end, price, organizer, age/accessibility notes, cancellation terms, "Solo No More" first-timer notes); RSVP saved to the database with confirmation, share link, add-to-calendar, and error, sold-out and cancelled states; WhatsApp/Instagram share previews | 02, 03, 04, 10 | — |
| **4. Communities + Join IMC** | `/communities/:slug` group pages (owner, interests, activity status, next event, related stories); preview before joining; lightweight join (name, one contact method, optional interests) with a recommended first action and a clear privacy note | 05, 06 | — |
| **5. Admin portal** | `/admin` (later admin.imctirupati.com) behind Cloudflare Access for **itsmycommunity.tirupati@gmail.com**: create/edit events and groups, swap samples for real, view/export RSVPs, verified counts, review queue for submissions/ideas/stories, reports | 08, 12 | Turn on Cloudflare Zero Trust in the dashboard (free; I'll walk you through it) |
| **6. Analytics** | GA4 events: `view_event_list`, `filter_events`, `view_event_detail`, `start_registration`, `registration_complete`, `join_group`, `select_interests`, `submit_idea`, `submit_opportunity`, `share_event`, `return_visit` | 11 | — |
| **7. Participation (P1)** | Tirupati Adda (questions, polls, ideas with status: received → completed / not proceeding); organizer and opportunity submissions → review; Opportunities board (paid vs voluntary, eligibility, deadline); Stories/recaps with consent and removal | 07, 08, 09 | — |
| **8. Sign-off + launch** | Run the full checklist with evidence; native-speaker review of Telugu/Tamil/Hindi; swap samples for real events; merge to `main`; move imctirupati.com from Vercel to the Worker; attach help./admin. subdomains | All | Real events/groups; DNS go-ahead |
| **9. Signature (P2)** | Tirupati Pulse, Memory Wall search, Talent Exchange pilot, Local Legend (after tracking and moderation are reliable), IMC Wrapped from real data | — | Real activity data |

Definition of done per release (from the brief): works on mobile and desktop end-to-end; no fake
counts or placeholder events as live data; every control works or says "coming soon"; loading,
empty, error and success states designed; privacy/consent documented for user content; analytics
verified; short handover on updating content.
