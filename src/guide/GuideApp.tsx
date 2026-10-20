import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUp, ArrowUpRight, Check, Info, User } from "lucide-react";
import { Link, useLocation } from "../lib/router";
import { CONTACT, usePageTitle } from "../lib/site";
import { answerFor, followUpPrompt, type Answer } from "../content/guide";
import { LanguageSelect, Logo } from "../site/ui";

// Guide surface: help.imctirupati.com (or /guide on the main site until that
// domain is attached). Answers come from curated notes for now; the AI call
// slots in behind ask() once the Worker API route and model key exist.

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "imc"; answer: Answer };

const STARTERS = [
  "We're travelling with elderly parents.",
  "How does darshan booking work?",
  "Where can we park at Tirumala?",
  "Find a family-friendly stay",
  "What can we see nearby?",
];

export default function GuideApp() {
  usePageTitle("Ask the guide | IMC Tirupati", "Ask a local guide about darshan, getting around, parking, food and stays in Tirupati.");
  const { search } = useLocation();
  const onMainSite = !window.location.hostname.startsWith("help.");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const askedInitial = useRef(false);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [
      ...m,
      { id: nextId.current++, role: "user", text: t },
      { id: nextId.current++, role: "imc", answer: answerFor(t) },
    ]);
    setDraft("");
  };

  useEffect(() => {
    // Keep the question carried over from the home page search box.
    const q = search.get("q");
    if (q && !askedInitial.current) {
      askedInitial.current = true;
      ask(q);
    }
  }, [search]);

  useEffect(() => {
    if (msgs.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          {onMainSite ? (
            <Link to="/" className="-ml-1 p-1" aria-label="Back to IMC Tirupati home"><ArrowLeft className="h-5 w-5" /></Link>
          ) : null}
          {onMainSite ? <Link to="/"><Logo compact /></Link> : <a href="https://imctirupati.com"><Logo compact /></a>}
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">Guide</span>
          <LanguageSelect className="ml-auto" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-40 pt-6">
        <div className="flex items-start gap-2 rounded-xl border border-line bg-white p-3 text-xs text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Preview: answers come from IMC's curated local notes; the full AI guide is being connected. IMC is an independent community guide, so
            confirm bookings and timings on official TTD sources.
          </p>
        </div>

        {msgs.length === 0 && (
          <section className="mt-10">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Namaskaram! <span className="text-brand">How can we help?</span>
            </h1>
            <p className="mt-2 text-muted">Ask about darshan, getting around, parking, food, stays or things to do.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-brand/50 hover:text-brand">
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 space-y-5" aria-live="polite">
          {msgs.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex items-center justify-end gap-3">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-soft px-4 py-2.5">{m.text}</p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><User className="h-4 w-4" /></span>
              </div>
            ) : (
              <AnswerBubble key={m.id} a={m.answer} onAsk={ask} />
            ),
          )}
          <div ref={endRef} />
        </div>
      </main>

      <form onSubmit={submit} className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <label className="flex-1">
            <span className="sr-only">Your question</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What would you like help with?"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
            />
          </label>
          <button type="submit" disabled={!draft.trim()} className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white disabled:opacity-40" aria-label="Send">
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <p className="pb-2 text-center text-[11px] text-muted">
          Need a person? <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">Message the IMC team</a>
        </p>
      </form>
    </div>
  );
}

function AnswerBubble({ a, onAsk }: { a: Answer; onAsk: (q: string) => void }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-peach text-[10px] font-extrabold">IMC</span>
      <div className="flex-1 rounded-2xl rounded-tl-sm border border-line bg-white p-4">
        <p className="font-semibold">{a.title}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          {a.points.map((p) => (
            <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p}</li>
          ))}
        </ul>
        {a.followUps && (
          <div className="mt-4">
            {a.ask && <p className="text-sm font-medium">{a.ask}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {a.followUps.map((f) => {
                const { label, prompt } = followUpPrompt(f);
                return (
                  <button key={f} onClick={() => onAsk(prompt)} className="rounded-lg border border-brand/30 px-3 py-2 text-sm font-medium text-brand hover:bg-brand-soft">
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {a.officialLink && (
          <a href={a.officialLink.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand underline underline-offset-4">
            {a.officialLink.label} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
