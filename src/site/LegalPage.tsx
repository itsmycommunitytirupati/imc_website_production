// Terms, Privacy and Community guidelines. Each page starts with a short plain-language summary of
// what the site actually does (translated), then IMC's full legal text, word for word, in English.
import { useMemo, useState, type ReactNode } from "react";
import { FileText, Printer, Search, ShieldCheck, Users } from "lucide-react";
import { Link } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { GUIDELINES_GROUPS, PRIVACY_GROUPS, TERMS_GROUPS, type Block, type MajorSection } from "../content/legal";

export type LegalDoc = "terms" | "privacy" | "guidelines";

const DOCS: Record<LegalDoc, { path: string; label: string; title: string; groups: MajorSection[]; Icon: typeof FileText }> = {
  terms: { path: "/terms", label: "Terms", title: "Terms of service", groups: TERMS_GROUPS, Icon: FileText },
  privacy: { path: "/privacy", label: "Privacy", title: "Privacy policy", groups: PRIVACY_GROUPS, Icon: ShieldCheck },
  guidelines: { path: "/guidelines", label: "Community guidelines", title: "Community guidelines", groups: GUIDELINES_GROUPS, Icon: Users },
};

const UPDATED = "7 November 2026";

// Plain-language summaries. They describe what the website does; the full text below governs.
const SUMMARY: Record<LegalDoc, { heading: string; points: string[] }[]> = {
  privacy: [
    {
      heading: "What we collect",
      points: [
        "Your name and a WhatsApp number or email when you RSVP or join a community.",
        "Your name, email and mobile number when you book a paid event.",
        "Whatever you write in Adda posts, opportunities, event ideas and reports.",
      ],
    },
    {
      heading: "Payments",
      points: [
        "You pay on PhonePe's own secure page. We never see your UPI PIN or card details.",
        "We keep the amount, your booking reference and whether the payment went through.",
      ],
    },
    {
      heading: "Sign-in and your device",
      points: [
        "My bookings uses a 6-digit code sent to your email. We store only a scrambled copy of it.",
        "A small cookie keeps you signed in for up to 30 days. Signing out removes it.",
        "Saved events and your language choice stay on your own phone or computer.",
      ],
    },
    {
      heading: "Analytics and the AI guide",
      points: [
        "Google Analytics counts visits and clicks. We never send it your name, number or messages.",
        "Questions to the AI guide are answered by Cloudflare's AI. Common questions are kept for a few hours to answer faster, without any link to you.",
      ],
    },
    {
      heading: "Who sees your details",
      points: [
        "The IMC team, and the host of the event you booked. Attendee lists are never published.",
        "We don't sell your data or share it with sponsors.",
      ],
    },
    {
      heading: "Photos and your choices",
      points: [
        "Photos of people go up only with their consent. Ask us to take any photo down and we usually do it within two days.",
        "You can ask for a copy of your details, a correction, or deletion at any time.",
      ],
    },
  ],
  terms: [
    {
      heading: "Booking",
      points: [
        "The price on the event page is per person and is what you pay.",
        "Your seat is held for 15 minutes while you pay. The booking is confirmed only once the payment is confirmed.",
        "Free events need only an RSVP. Please tell us if you can't come, so someone else can.",
      ],
    },
    {
      heading: "Refunds and IMC credit",
      points: [
        "If IMC cancels an event, you choose: IMC credit for the full amount, or a refund to the account you paid from.",
        "If you can't come, the cancellation terms shown on that event's page apply.",
        "Refunds go back to where you paid from. Banks usually show them within a few working days.",
        "IMC credit can be used only for IMC events. It has no cash value, can't be transferred, and stays with your email.",
      ],
    },
    {
      heading: "Taking part",
      points: [
        "Treks, rides and sports carry some risk. Follow the host's instructions and tell us about any medical condition.",
        "Opportunities are reviewed by IMC, but IMC doesn't employ or vet applicants. Never pay to apply.",
        "The visitor guide and AI guide are IMC's local notes, not TTD. Always check official TTD sources for darshan.",
      ],
    },
  ],
  guidelines: [
    {
      heading: "In short",
      points: [
        "Be kind. Disagree with ideas, not people.",
        "No harassment, discrimination or unwanted attention, online or at events.",
        "Ask before you photograph someone, and respect a no.",
        "No selling, spam or political campaigning in IMC groups.",
        "Never share someone else's number, address or private messages.",
        "If something feels wrong, tell a host or report it. You can stay anonymous.",
      ],
    },
  ],
};

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = useT();
  const d = DOCS[doc];
  usePageTitle(`${d.title} | IMC Tirupati`);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return d.groups;
    const hit = (b: Block) => (b.text ?? "").toLowerCase().includes(q) || (b.items ?? []).some((i) => i.toLowerCase().includes(q));
    return d.groups
      .map((g) => ({ ...g, subs: g.subs.filter((s) => s.title.toLowerCase().includes(q) || s.blocks.some(hit)) }))
      .filter((g) => g.subs.length);
  }, [d.groups, query]);

  return (
    <div className="bg-cream">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6">
          <nav className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4" aria-label={t("Policies")}>
            {(Object.keys(DOCS) as LegalDoc[]).map((k) => {
              const { Icon } = DOCS[k];
              return (
                <Link key={k} to={DOCS[k].path} aria-current={k === doc ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${k === doc ? "bg-ink text-white" : "bg-cream ring-1 ring-line hover:ring-brand/40"}`}>
                  <Icon className="h-4 w-4" /> {t(DOCS[k].label)}
                </Link>
              );
            })}
          </nav>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t(d.title)}</h1>
          <p className="mt-2 text-sm text-muted">{t("Updated")} {t(UPDATED)}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8" aria-labelledby="summary">
          <h2 id="summary" className="font-display text-2xl font-extrabold">{t("The short version")}</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {SUMMARY[doc].map((s) => (
              <div key={s.heading}>
                <h3 className="font-semibold text-brand">{t(s.heading)}</h3>
                <ul className="mt-2 space-y-2 text-ink/85">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />{t(p)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl bg-cream p-4 text-sm">
            {t("Questions, or want your details changed or removed?")}{" "}
            <Link to={`mailto:${CONTACT.email}`} className="font-semibold text-brand underline-offset-4 hover:underline">{CONTACT.email}</Link>{" · "}
            <Link to={CONTACT.whatsapp} className="font-semibold text-brand underline-offset-4 hover:underline">WhatsApp {CONTACT.phone}</Link>{" · "}
            <Link to="/report" className="font-semibold text-brand underline-offset-4 hover:underline">{t("Report a concern")}</Link>
          </p>
          <p className="mt-3 text-xs text-muted">{t("This summary explains how the website works. The full text below is the official version and is in English.")}</p>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">{t("Full text")}</h2>
          <div className="flex flex-1 items-center justify-end gap-2">
            <label className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search this page")} aria-label={t("Search this page")} className="w-full rounded-full border border-line bg-white py-2 pl-9 pr-4 text-sm" />
            </label>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-brand/40" aria-label={t("Print")}>
              <Printer className="h-4 w-4" /> <span className="hidden sm:inline">{t("Print")}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
          <nav className="hidden lg:block" aria-label={t("Sections")}>
            <ol className="sticky top-28 space-y-1 text-sm">
              {groups.map((g, i) => (
                <li key={g.title}><a href={`#sec-${i}`} className="block rounded-lg px-3 py-1.5 text-ink/75 hover:bg-white hover:text-brand">{g.title}</a></li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0 space-y-8">
            {!groups.length && <p className="rounded-2xl bg-white p-6 text-muted ring-1 ring-line">{t("Nothing matches that search.")}</p>}
            {groups.map((g, i) => (
              <section key={g.title} id={`sec-${i}`} className="scroll-mt-28 rounded-3xl border border-line bg-white p-6 sm:p-8" lang="en">
                <h3 className="font-display text-xl font-extrabold">{g.title}</h3>
                <div className="mt-4 space-y-5">
                  {g.subs.map((s) => (
                    <div key={`${s.num}-${s.title}`}>
                      <h4 className="font-semibold"><span className="mr-2 text-muted">{s.num}</span>{s.title}</h4>
                      <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-ink/80">{s.blocks.map((b, j) => <BlockView key={j} block={b} />)}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockView({ block }: { block: Block }): ReactNode {
  if (block.type === "list") {
    return (
      <ul className="ml-5 list-disc space-y-1">
        {(block.items ?? []).map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  return <p>{block.text}</p>;
}
