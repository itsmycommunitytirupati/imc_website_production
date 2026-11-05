-- One-time catch-up for sample listings that went stale before the scheduled roll-forward
-- existed (worker/samples.ts runs the same statements every few minutes).
UPDATE events SET
     end_at = CASE WHEN end_at = '' THEN '' ELSE strftime('%Y-%m-%dT%H:%M', julianday(end_at) + 28 * (CAST((julianday(strftime('%Y-%m-%dT%H:%M', 'now', '+330 minutes')) - julianday(start_at)) / 28 AS INTEGER) + 1)) END,
     start_at = strftime('%Y-%m-%dT%H:%M', julianday(start_at) + 28 * (CAST((julianday(strftime('%Y-%m-%dT%H:%M', 'now', '+330 minutes')) - julianday(start_at)) / 28 AS INTEGER) + 1)),
     updated_at = datetime('now')
   WHERE is_sample = 1 AND start_at < strftime('%Y-%m-%dT%H:%M', 'now', '+330 minutes');

UPDATE opportunities SET
     deadline = date(deadline, '+' || (28 * (CAST((julianday(date('now', '+330 minutes')) - julianday(deadline)) / 28 AS INTEGER) + 1)) || ' days'),
     updated_at = datetime('now')
   WHERE is_sample = 1 AND deadline != '' AND deadline < date('now', '+330 minutes');
