// Product analytics through the existing GA4 tag (index.html). Event names follow the brief;
// never send names, phone numbers, emails or free text as parameters.
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "view_event_list"
  | "filter_events"
  | "view_event_detail"
  | "start_registration"
  | "registration_complete"
  | "join_group"
  | "select_interests"
  | "submit_idea"
  | "submit_opportunity"
  | "share_event"
  | "return_visit";

export function track(event: AnalyticsEvent, params: Params = {}) {
  try {
    window.gtag?.("event", event, params);
  } catch {
    // Analytics must never break the page.
  }
}

/** Fires `return_visit` once per session when someone comes back after 30+ minutes. */
export function trackReturnVisit() {
  try {
    if (sessionStorage.getItem("imc-session")) return;
    sessionStorage.setItem("imc-session", "1");
    const last = Number(localStorage.getItem("imc-last-visit") ?? 0);
    if (last && Date.now() - last > 30 * 60_000) track("return_visit", { days_since: Math.round((Date.now() - last) / 86_400_000) });
    localStorage.setItem("imc-last-visit", String(Date.now()));
  } catch {
    // Storage blocked; skip.
  }
}
