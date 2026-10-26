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

| No. | Acceptance criterion | Status | Evidence / gap |
|---|---|---|---|
| 01 | Homepage explains IMC and offers clear next actions | Partial | Visitor-first home is clear; brief's community-first hero/CTAs pending D1. |
| 02 | Visitor can discover upcoming events and filter | Partial | `/experiences` category filter; missing date and free/paid filters; events are samples. |
| 03 | Event detail page: date/time, venue, price, organizer, registration | Not started | |
| 04 | RSVP flow with tested confirmation and error states | Not started | |
| 05 | Interest groups connect to events and activities | Partial | Circles → WhatsApp; no group pages. |
| 06 | New member takes one meaningful first action without friction | Partial | Browse-first works; no join/onboarding. |
| 07 | Organizer can submit an event/opportunity for review | Not started | |
| 08 | Community submissions: moderation, status, reporting rules | Not started | |
| 09 | Member stories/photos: consent and removal pathway | Not started | See F4. |
| 10 | Mobile, performance, accessibility, share previews checked | Partial | Mobile/perf/a11y checked; per-event share previews need server-side meta tags. |
| 11 | Analytics for discovery, registration, joins, submissions, return visits | Not started | GA4 tag present (page views only). |
| 12 | Admin can update events, stories, groups without a developer | Not started | Admin is a sample-data shell. |

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

## 5. Decisions and inputs needed from IMC

| # | Decision / input | Recommendation |
|---|---|---|
| D1 | **Homepage direction.** The brief specifies a community-first homepage ("Tirupati is home. Let's make it your community.", Explore Events / Find Your People). The current home is visitor-first from the earlier mock-up. | Adopt the brief's homepage and nav; keep the visitor guide and AI guide under **Discover** and as a "Visiting Tirupati?" band on the home page. |
| D2 | **Real launch content:** upcoming events (title, date/time, venue, price, capacity, organizer) and 4–6 active groups with an owner each | Needed before any public launch (brief: "an active, useful community beats a large set of empty features"). |
| D3 | **Verified numbers** for clubs, events, members | Hide until verified. |
| D4 | **Photo and testimonial consent** for people shown on the site | Confirm, or we swap photos. |
| D5 | **Backend go-ahead:** D1 + Cloudflare Access + Turnstile (all free tier) | Approve; admin emails for Access. |
| D6 | **Who moderates** submissions/reports, and response time | Name an owner before Adda or submissions go live. |

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

| Phase | Scope | Depends on |
|---|---|---|
| **0 (now)** | This audit; fixes F1–F5 on the preview | — |
| **1: P0 (about 2 weeks)** | Homepage + nav per D1; events list with date/free filters; event detail pages; RSVP with confirmation/error/sold-out; group pages; join + first action; D1 + admin + Access + Turnstile; analytics events; share previews | D1, D2, D5 |
| **2: participation (about 1 week)** | Tirupati Adda with moderation and idea status; organizer/opportunity submissions with review; stories with consent workflow | D6 |
| **3: signature** | Tirupati Pulse, Memory Wall, Solo No More labels, Talent Exchange pilot; Local Legend only after tracking and moderation are reliable | Real activity data |
| **Domain** | Move imctirupati.com from Vercel to the Worker, attach help./admin. subdomains | Phase 1 signed off |

Definition of done per release (from the brief): works on mobile and desktop end-to-end; no fake
counts or placeholder events as live data; every control works or says "coming soon"; loading,
empty, error and success states designed; privacy/consent documented for user content; analytics
verified; short handover on updating content.
