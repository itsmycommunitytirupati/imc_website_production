-- Paid events: PhonePe payments with 15-minute seat holds, IMC credit (a closed ledger usable
-- only for IMC events), refunds, and passwordless email login for "My bookings".

ALTER TABLE rsvps ADD COLUMN email TEXT NOT NULL DEFAULT '';
ALTER TABLE rsvps ADD COLUMN payment_id INTEGER;

-- One row per checkout attempt. A row in state created/pending with expires_at in the future
-- holds `party_size` seats; capacity checks count those alongside confirmed RSVPs.
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_order_id TEXT NOT NULL UNIQUE,     -- ours, sent to PhonePe (max 63, [A-Za-z0-9_-])
  event_id INTEGER NOT NULL REFERENCES events(id),
  ref TEXT NOT NULL UNIQUE,                   -- booking reference shown to the person
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  party_size INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  total_paise INTEGER NOT NULL,               -- price x party
  credit_paise INTEGER NOT NULL DEFAULT 0,    -- part covered by IMC credit
  gateway_paise INTEGER NOT NULL DEFAULT 0,   -- part charged through PhonePe
  state TEXT NOT NULL DEFAULT 'created',      -- created | pending | completed | failed | expired
  phonepe_order_id TEXT NOT NULL DEFAULT '',
  payment_mode TEXT NOT NULL DEFAULT '',
  transaction_id TEXT NOT NULL DEFAULT '',
  resolution TEXT NOT NULL DEFAULT '',        -- after cancellation: '' | credit | refund
  claim_token_hash TEXT NOT NULL DEFAULT '',  -- one-tap "credit or refund" link
  claim_sent_at TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL,                   -- UTC 'YYYY-MM-DD HH:MM:SS', end of the seat hold
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX payments_event ON payments (event_id, state);
CREATE INDEX payments_email ON payments (email);
CREATE INDEX payments_open ON payments (state, expires_at);

-- IMC credit: append-only ledger keyed by email. Balance = SUM(amount_paise).
CREATE TABLE credit_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,              -- + added, - spent
  reason TEXT NOT NULL,                       -- cancelled_event | spent | spend_reversed | admin
  payment_id INTEGER,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX credit_email ON credit_ledger (email);

CREATE TABLE refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_refund_id TEXT NOT NULL UNIQUE,
  payment_id INTEGER NOT NULL REFERENCES payments(id),
  amount_paise INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',      -- pending | completed | failed
  phonepe_refund_id TEXT NOT NULL DEFAULT '',
  requested_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Passwordless login: a 6-digit code by email, then a session cookie (only hashes are stored).
CREATE TABLE login_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
