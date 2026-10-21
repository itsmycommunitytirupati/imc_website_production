import { useEffect, useRef, useState, type ComponentType, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, ArrowUp, ArrowUpRight, Baby, BadgeCheck, BedDouble, Bus, Check, CheckCheck, HeartHandshake, Info,
  MapPinned, MessageCircle, ParkingSquare, Shirt, UtensilsCrossed, WifiOff,
} from "lucide-react";
import { Link, useLocation } from "../lib/router";
import { CONTACT, LANGS, OFFICIAL, useLang, usePageTitle, type Lang } from "../lib/site";
import { useT } from "../lib/i18n";
import { answerFor, followUpPrompt, type Answer } from "../content/guide";
import { MEDIA } from "../content/media";
import { GopuramIcon, LanguageMenu, Logo } from "../site/ui";

// Guide surface: help.imctirupati.com (or /guide on the main site until that
// domain is attached). Questions go to the AI agent in the Worker
// (worker/agent.ts); if it can't answer, IMC's curated notes reply instead.

interface AiAnswer {
  title: string;
  points: string[];
  sources: { label: string; url: string }[];
  suggestions: string[];
  outOfScope?: boolean;
}

type Reply =
  | { kind: "ai"; answer: AiAnswer; tools: string[] }
  | { kind: "curated"; answer: Answer; offline: boolean };

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "imc"; reply: Reply | null };
type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

const TOPICS: { label: string; prompt: string; Icon: IconType }[] = [
  { label: "Darshan", prompt: "How does darshan booking work?", Icon: GopuramIcon },
  { label: "With elders", prompt: "We're travelling with elderly parents.", Icon: HeartHandshake },
  { label: "Getting around", prompt: "How do we get around and up to Tirumala?", Icon: Bus },
  { label: "Parking", prompt: "Where can we park?", Icon: ParkingSquare },
  { label: "Food", prompt: "Where can we eat?", Icon: UtensilsCrossed },
  { label: "Stays", prompt: "Where should we stay?", Icon: BedDouble },
  { label: "What to wear", prompt: "What should we wear for darshan?", Icon: Shirt },
  { label: "With kids", prompt: "We're visiting with young kids.", Icon: Baby },
  { label: "Nearby", prompt: "What can we see nearby?", Icon: MapPinned },
];

const TOOL_LABELS: Record<string, string> = {
  search_local_guide: "IMC local guide",
  search_places: "Stays, transport & food list",
  web_search: "Web search",
  fetch_official_page: "Official TTD page",
};

const PROGRESS = ["Checking the local guide…", "Comparing options for your budget…", "Looking up the latest information…", "Double-checking the facts…"];

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-orange-400 font-extrabold text-white shadow-sm ${small ? "h-8 w-8 text-[9px]" : "h-10 w-10 text-[10px]"}`}>IMC</span>
  );
}

// Condense earlier turns so the agent keeps context without long prompts.
function historyFor(msgs: Msg[]) {
  return msgs
    .filter((m) => m.role === "user" || m.reply)
    .slice(-6)
    .map((m) => {
      if (m.role === "user") return { role: "user" as const, content: m.text };
      const r = m.reply!;
      const a = r.kind === "ai" ? r.answer : r.answer;
      return { role: "assistant" as const, content: [a.title, ...a.points].join(" ") };
    });
}

export default function GuideApp() {
  usePageTitle("Ask the guide | IMC Tirupati", "Ask a local guide about darshan, getting around, parking, food and stays in Tirupati.");
  const t = useT();
  const [lang, setLang] = useLang();
  const { search } = useLocation();
  const onMainSite = !window.location.hostname.startsWith("help.");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const askedInitial = useRef(false);
  const msgsRef = useRef<Msg[]>([]);
  msgsRef.current = msgs;

  // `match` lets a tapped topic show in the visitor's language but fall back on its English prompt.
  const ask = async (text: string, match?: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const userMsg: Msg = { id: nextId.current, role: "user", text: q };
    const replyId = nextId.current + 1;
    nextId.current += 2;
    setMsgs((m) => [...m, userMsg, { id: replyId, role: "imc", reply: null }]);
    setDraft("");
    setBusy(true);

    let reply: Reply;
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, messages: [...historyFor(msgsRef.current), { role: "user", content: q }] }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { answer: AiAnswer; meta?: { tools?: string[] } };
      if (!data.answer?.title) throw new Error("empty");
      reply = { kind: "ai", answer: data.answer, tools: data.meta?.tools ?? [] };
    } catch {
      reply = { kind: "curated", answer: answerFor(match ?? q), offline: true };
    }
    setMsgs((m) => m.map((x) => (x.id === replyId ? { ...x, reply } : x)));
    setBusy(false);
  };

  useEffect(() => {
    // The home page passes the question and language along; keep both.
    const l = search.get("lang") as Lang | null;
    if (l && LANGS.some((x) => x.id === l) && l !== lang) setLang(l);
    const q = search.get("q");
    if (q && !askedInitial.current) {
      askedInitial.current = true;
      // Prompts from the home page are English keys; show them in the visitor's language.
      ask(t(q), q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (msgs.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  const last = [...msgs].reverse().find((m): m is Extract<Msg, { role: "imc" }> => m.role === "imc");
  const suggestions: { label: string; send: string; match?: string }[] = !last?.reply
    ? []
    : last.reply.kind === "ai"
      ? last.reply.answer.suggestions.map((s) => ({ label: s, send: s }))
      : (last.reply.answer.followUps ?? []).map((f) => {
          const { label, prompt } = followUpPrompt(f);
          return { label: t(label), send: t(prompt), match: prompt };
        });

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          {onMainSite && (
            <Link to="/" className="-ml-1 rounded-full p-1.5 hover:bg-peach" aria-label={t("Back to IMC Tirupati home")}><ArrowLeft className="h-5 w-5" /></Link>
          )}
          {onMainSite ? <Link to="/"><Logo compact /></Link> : <a href="https://imctirupati.com"><Logo compact /></a>}
          <LanguageMenu className="ml-auto" />
        </div>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-3">
          <span className="relative">
            <Avatar />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <span className="leading-tight">
            <span className="block font-semibold">{t("IMC Guide")}</span>
            <span className="text-xs text-muted">{t("AI guide · answers checked against sources")}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-48 pt-6">
        {msgs.length === 0 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="relative overflow-hidden rounded-[28px] bg-ink text-white">
              <img src={MEDIA.hills.src} alt="" className="absolute inset-0 h-full w-full object-cover object-[90%_50%] opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
              <div className="relative p-6 sm:p-10">
                <p className="font-hand text-2xl text-orange-300">నమస్కారం 🙏</p>
                <h1 className="mt-1 max-w-md font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{t("How can we help with your visit?")}</h1>
                <p className="mt-3 max-w-sm text-white/75">{t("Ask in your own words, in English, Telugu, Tamil or Hindi.")}</p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" /> {t("Best stays, transport and food for your budget")}
                </p>
              </div>
            </div>
            <p className="mt-8 text-sm font-semibold text-muted">{t("Popular topics")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TOPICS.map(({ label, prompt, Icon }, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => ask(t(prompt), prompt)}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  {t(label)}
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        <div className="mt-2 space-y-5" aria-live="polite">
          {msgs.map((m) =>
            m.role === "user" ? (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-md bg-brand px-4 py-2.5 text-white shadow-sm">
                {m.text}
                <span className="mt-0.5 flex justify-end text-white/70"><CheckCheck className="h-3.5 w-3.5" /></span>
              </motion.div>
            ) : (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
                <Avatar small />
                {!m.reply ? <Thinking /> : m.reply.kind === "ai" ? <AiBubble reply={m.reply} /> : <CuratedBubble a={m.reply.answer} offline={m.reply.offline} />}
              </motion.div>
            ),
          )}
          <div ref={endRef} />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-cream via-cream to-cream/0 pt-6">
        <div className="mx-auto max-w-3xl px-4">
          {suggestions.length > 0 && !busy && (
            <div className="scrollbar-none mb-2 flex gap-2 overflow-x-auto">
              {suggestions.map((s) => (
                <button key={s.label} onClick={() => ask(s.send, s.match)} className="shrink-0 rounded-full border border-brand/30 bg-white px-3.5 py-1.5 text-sm font-medium text-brand shadow-sm hover:bg-brand hover:text-white">
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-xl shadow-black/5">
            <label className="flex-1">
              <span className="sr-only">{t("Your question")}</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                placeholder={t("Ask anything about your visit…")}
                className="w-full bg-transparent py-2 outline-none"
              />
            </label>
            <button type="submit" disabled={!draft.trim() || busy} className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40" aria-label={t("Send")}>
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>
          <p className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 text-center text-[11px] text-muted">
            <Info className="h-3.5 w-3.5" />
            {t("AI can make mistakes. Confirm bookings on")}{" "}
            <a href={OFFICIAL.ttdBooking} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">TTD</a>
            <span aria-hidden="true">·</span>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand underline">
              <MessageCircle className="h-3 w-3" /> {t("Message a local")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Thinking() {
  const t = useT();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, PROGRESS.length - 1)), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="flex items-center gap-3 rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-sm" role="status">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/60" style={{ animationDelay: `${d}ms` }} />
        ))}
      </span>
      <motion.span key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">{t(PROGRESS[step])}</motion.span>
    </span>
  );
}

function AiBubble({ reply }: { reply: Extract<Reply, { kind: "ai" }> }) {
  const t = useT();
  const a = reply.answer;
  return (
    <div className="max-w-[88%] rounded-3xl rounded-bl-md border border-line bg-white p-4 shadow-sm sm:p-5">
      <p className="font-semibold">{a.title}</p>
      {a.points.length > 0 && (
        <ul className="mt-2.5 space-y-2 text-[15px] text-ink/80">
          {a.points.map((p) => (
            <li key={p} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-brand" />{p}</li>
          ))}
        </ul>
      )}
      {a.sources.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("Sources")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {a.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-ink/80 hover:bg-brand-soft hover:text-brand">
                {s.label} <ArrowUpRight className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
      {!a.outOfScope && (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" /> {t("Checked against sources")}
          {reply.tools.length > 0 && <span className="text-muted">· {reply.tools.map((x) => t(TOOL_LABELS[x] ?? x)).join(" · ")}</span>}
        </p>
      )}
    </div>
  );
}

function CuratedBubble({ a, offline }: { a: Answer; offline: boolean }) {
  const t = useT();
  return (
    <div className="max-w-[88%] rounded-3xl rounded-bl-md border border-line bg-white p-4 shadow-sm sm:p-5">
      <p className="font-semibold">{t(a.title)}</p>
      <ul className="mt-2.5 space-y-2 text-[15px] text-ink/75">
        {a.points.map((p) => (
          <li key={p} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-brand" />{t(p)}</li>
        ))}
      </ul>
      {a.officialLink && (
        <a href={a.officialLink.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white">
          {t(a.officialLink.label)} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {a.ask && <p className="mt-3 text-sm font-medium">{t(a.ask)}</p>}
      {offline && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
          <WifiOff className="h-3.5 w-3.5" /> {t("From IMC's saved local notes; the live guide is busy right now.")}
        </p>
      )}
    </div>
  );
}
