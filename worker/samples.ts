// Keeps the sample listings (is_sample = 1) from going stale until IMC replaces them: any past
// sample event moves forward in steps of 28 days (same weekday and time, the seed's ~4-week
// spread is kept), and so do lapsed sample opportunity deadlines. Real content is never touched.
import type { Env } from "./env";

// Tirupati time, in the same text format the tables use.
const NOW = "strftime('%Y-%m-%dT%H:%M', 'now', '+330 minutes')";
const TODAY = "date('now', '+330 minutes')";

export const ROLL_SAMPLES_SQL = [
  `UPDATE events SET
     end_at = CASE WHEN end_at = '' THEN '' ELSE strftime('%Y-%m-%dT%H:%M', julianday(end_at) + 28 * (CAST((julianday(${NOW}) - julianday(start_at)) / 28 AS INTEGER) + 1)) END,
     start_at = strftime('%Y-%m-%dT%H:%M', julianday(start_at) + 28 * (CAST((julianday(${NOW}) - julianday(start_at)) / 28 AS INTEGER) + 1)),
     updated_at = datetime('now')
   WHERE is_sample = 1 AND start_at < ${NOW}`,
  `UPDATE opportunities SET
     deadline = date(deadline, '+' || (28 * (CAST((julianday(${TODAY}) - julianday(deadline)) / 28 AS INTEGER) + 1)) || ' days'),
     updated_at = datetime('now')
   WHERE is_sample = 1 AND deadline != '' AND deadline < ${TODAY}`,
];

export async function rollSamples(env: Env) {
  await env.DB.batch(ROLL_SAMPLES_SQL.map((sql) => env.DB.prepare(sql)));
}
