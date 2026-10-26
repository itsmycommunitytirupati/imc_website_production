-- IMC community data. Apply with:
--   npx wrangler d1 migrations apply imc-community --local    (dev)
--   npx wrangler d1 migrations apply imc-community --remote   (Cloudflare)
-- Rows with is_sample = 1 are dummy content for representation; the site badges them "Sample".

CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  interests TEXT NOT NULL DEFAULT '[]',          -- JSON array of interest ids
  owner_name TEXT NOT NULL DEFAULT '',
  owner_role TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',         -- active | forming | paused
  image TEXT NOT NULL DEFAULT '',                -- photo key (content/photos) or URL
  joining_note TEXT NOT NULL DEFAULT '',         -- what joining involves / who can join
  is_sample INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  group_id INTEGER REFERENCES groups(id),
  category TEXT NOT NULL DEFAULT 'meetups',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  start_at TEXT NOT NULL,                        -- local Tirupati time, 'YYYY-MM-DDTHH:MM'
  end_at TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  price_inr INTEGER NOT NULL DEFAULT 0,          -- 0 = free
  price_note TEXT NOT NULL DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 0,           -- 0 = no limit
  organizer_name TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  beginner_friendly INTEGER NOT NULL DEFAULT 0,  -- "Solo No More"
  first_timer_note TEXT NOT NULL DEFAULT '',
  age_note TEXT NOT NULL DEFAULT '',
  accessibility_note TEXT NOT NULL DEFAULT '',
  cancellation_terms TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled',      -- scheduled | cancelled | completed
  is_sample INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX events_start ON events(start_at);

CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  ref TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed',      -- confirmed | waitlist | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX rsvps_event ON rsvps(event_id);

CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  interests TEXT NOT NULL DEFAULT '[]',
  group_id INTEGER REFERENCES groups(id),        -- set when joining from a group page
  updates_ok INTEGER NOT NULL DEFAULT 0,         -- consented to updates
  status TEXT NOT NULL DEFAULT 'new',            -- new | added
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tirupati Adda: questions, ideas, polls and recommendations (moderated).
CREATE TABLE adda_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                            -- question | idea | poll | recommendation
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  author_name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',              -- never shown publicly
  poll_options TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'received',       -- received | reviewing | planned | in_progress | completed | not_proceeding
  admin_note TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,          -- moderator approval
  closed INTEGER NOT NULL DEFAULT 0,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE poll_votes (
  post_id INTEGER NOT NULL REFERENCES adda_posts(id),
  option_index INTEGER NOT NULL,
  voter TEXT NOT NULL,                           -- salted hash, no personal data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (post_id, voter)
);

CREATE TABLE opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,                            -- paid | volunteer | collab | internship
  compensation TEXT NOT NULL DEFAULT '',
  eligibility TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL DEFAULT '',             -- YYYY-MM-DD
  description TEXT NOT NULL DEFAULT '',
  how_to_apply TEXT NOT NULL DEFAULT '',
  posted_by TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',              -- for the moderator; shown only if how_to_apply says so
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | published | closed | rejected
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',             -- JSON array of photo keys
  group_id INTEGER REFERENCES groups(id),
  event_date TEXT NOT NULL DEFAULT '',
  consent_confirmed INTEGER NOT NULL DEFAULT 0,  -- required before publishing
  status TEXT NOT NULL DEFAULT 'draft',          -- draft | published | removed
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Everything visitors send that needs a person: event proposals, photo removal, reports.
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                            -- event_proposal | photo_removal | report
  name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',            -- JSON
  status TEXT NOT NULL DEFAULT 'received',       -- received | reviewing | done | declined
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
