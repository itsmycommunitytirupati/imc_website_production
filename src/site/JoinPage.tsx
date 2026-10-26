import { useState, type FormEvent } from "react";
import { Check, EyeOff, Lock, MessageCircle, PartyPopper } from "lucide-react";
import { Link } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { post, useApi, type EventItem, type GroupItem } from "../lib/api";
import { track } from "../lib/analytics";
import { IMC_PHOTOS } from "../content/photos";
import { EventCard, Honeypot, HumanCheck, SubmitButton, TextInput, useForm } from "./kit";

export const INTERESTS = [
  { id: "music", label: "Music", emoji: "🎸" },
  { id: "sports", label: "Sports", emoji: "🏸" },
  { id: "nature", label: "Treks & nature", emoji: "⛰️" },
  { id: "food", label: "Food", emoji: "🥞" },
  { id: "culture", label: "Culture", emoji: "🪔" },
  { id: "art", label: "Art & craft", emoji: "🎨" },
  { id: "photography", label: "Photography & reels", emoji: "📸" },
  { id: "books", label: "Books", emoji: "📚" },
  { id: "dance", label: "Dance", emoji: "💃" },
  { id: "cycling", label: "Cycling", emoji: "🚲" },
  { id: "startups", label: "Startups", emoji: "💡" },
  { id: "careers", label: "Careers", emoji: "💼" },
  { id: "creators", label: "Creators", emoji: "🎬" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
  { id: "volunteering", label: "Volunteering", emoji: "🤝" },
  { id: "women", label: "Women's circle", emoji: "🌸" },
  { id: "family", label: "Parents & kids", emoji: "🧸" },
  { id: "games", label: "Board games", emoji: "🎲" },
];

interface JoinResult {
  ok: true;
  group: string | null;
  suggestions: EventItem[];
}

export default function JoinPage() {
  usePageTitle("Join IMC | IMC Tirupati", "Join IMC Tirupati in under a minute: pick your interests and get one easy first meetup to try.");
  const t = useT();
  const preset = new URLSearchParams(window.location.search).get("group") ?? "";
  return (
    <section className="dot-grid">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:py-20">
        <div>
          <p className="inline-block -rotate-2 rounded-full bg-turmeric px-4 py-1.5 text-sm font-bold">రండి! {t("Randi, come along")} 👋</p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1] tracking-[-0.04em] sm:text-6xl">{t("Join IMC")}</h1>
          <p className="mt-4 max-w-md text-lg text-muted">{t("No app, no password. Tell us what you're into and we'll suggest one easy first step.")}</p>
          <ul className="mt-8 space-y-4">
            {([
              [Lock, "What we ask", "Your name and a WhatsApp number or email. Interests are optional."],
              [EyeOff, "Who sees it", "Only the IMC team. Your details are never shown on the site or shared with sponsors."],
              [Check, "What happens next", "A host adds you to the circles you picked. Leave any time by messaging us."],
            ] as const).map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-line"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block font-semibold">{t(title)}</span>
                  <span className="text-sm text-muted">{t(text)}</span>
                </span>
              </li>
            ))}
          </ul>
          <img src={IMC_PHOTOS.meetup3} alt={t("IMC members at a meetup")} className="mt-10 hidden aspect-[16/10] w-full rotate-1 rounded-3xl object-cover shadow-xl lg:block" />
        </div>
        <JoinForm preset={preset} />
      </div>
    </section>
  );
}

export function JoinForm({ preset = "", compact = false }: { preset?: string; compact?: boolean }) {
  const t = useT();
  const { data } = useApi<{ groups: GroupItem[] }>(compact ? null : "/api/groups");
  const form = useForm({ name: "", contact: "", interests: [] as string[], group: preset, updates_ok: true, website: "" });
  const [token, setToken] = useState("");
  const [done, setDone] = useState<JoinResult | null>(null);

  const toggle = (id: string) => {
    const next = form.values.interests.includes(id) ? form.values.interests.filter((x) => x !== id) : [...form.values.interests, id];
    form.set("interests", next);
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) => post<JoinResult>("/api/join", { ...v, turnstile: token }), { human_check: "Please complete the check and try again." });
    if (res) {
      setDone(res);
      if (form.values.interests.length) track("select_interests", { count: form.values.interests.length, interests: form.values.interests.join(",") });
      track("join_group", { group: form.values.group || "none" });
    }
  };

  if (done) {
    return (
      <div className="rounded-[32px] border border-line bg-white p-6 shadow-xl sm:p-8" role="status">
        <PartyPopper className="h-10 w-10 text-brand" />
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{t("You're in. Introvert mode can remain on.")}</h2>
        <p className="mt-2 text-muted">
          {done.group ? `${t("We've noted you for")} ${done.group}. ` : ""}
          {t("A host will message you soon. No pressure to talk on day one.")}
        </p>
        {done.suggestions.length > 0 && (
          <>
            <p className="mt-6 font-semibold">{t("Your easy first step:")}</p>
            <div className="mt-3">
              <EventCard e={done.suggestions[0]} />
            </div>
            {done.suggestions.length > 1 && (
              <p className="mt-3 text-sm text-muted">
                {t("Or try")} {done.suggestions.slice(1).map((s, i) => (
                  <span key={s.slug}>{i > 0 && ", "}<Link to={`/events/${s.slug}`} className="font-semibold text-brand underline-offset-4 hover:underline">{s.title}</Link></span>
                ))}
              </p>
            )}
          </>
        )}
        <a href={`${CONTACT.whatsapp}?text=${encodeURIComponent("Hi IMC! I just joined on the website 👋")}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-brand">
          <MessageCircle className="h-4 w-4" /> {t("Say hi on WhatsApp too")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-5 rounded-[32px] border border-line bg-white p-6 shadow-xl sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={t("Your name")} autoComplete="name" value={form.values.name} onChange={(x) => form.set("name", x.target.value)} error={form.errors.name && t(form.errors.name)} />
        <TextInput label={t("WhatsApp number or email")} autoComplete="tel" value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={form.errors.contact && t(form.errors.contact)} />
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">{t("What are you into? (optional)")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = form.values.interests.includes(i.id);
            return (
              <button type="button" key={i.id} onClick={() => toggle(i.id)} aria-pressed={on} className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${on ? "bg-brand text-white shadow-md" : "bg-cream ring-1 ring-line hover:ring-brand/40"}`}>
                {i.emoji} {t(i.label)}
              </button>
            );
          })}
        </div>
      </fieldset>
      {!compact && (
        <label className="block">
          <span className="text-sm font-semibold">{t("Start with a community (optional)")}</span>
          <select value={form.values.group} onChange={(x) => form.set("group", x.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3">
            <option value="">{t("Not sure yet; suggest one")}</option>
            {data?.groups.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
          </select>
        </label>
      )}
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={form.values.updates_ok} onChange={(x) => form.set("updates_ok", x.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
        <span className="text-sm">{t("Send me a short weekly note about what's on. (You can stop any time.)")}</span>
      </label>
      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting}>{t("Join IMC")}</SubmitButton>
      <p className="text-xs text-muted">
        {t("By joining you agree to the")} <Link to="/terms" className="underline">{t("community guidelines")}</Link> {t("and")} <Link to="/privacy" className="underline">{t("privacy notice")}</Link>.
      </p>
    </form>
  );
}
