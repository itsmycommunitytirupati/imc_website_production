import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUp, ArrowUpRight, Bus, CalendarDays, Check, CheckCheck } from "lucide-react";
import { Link, navigate } from "../lib/router";
import { guideUrl, useLang } from "../lib/site";
import { answerFor, followUpPrompt } from "../content/guide";
import { useT } from "../lib/i18n";

// Home page "example conversation", drawn as a live chat window. It plays the
// exchange once when scrolled into view, and its input opens the real guide.

const QUESTION = "We're travelling with elderly parents.";

function GuideAvatar({ size = "h-9 w-9" }: { size?: string }) {
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-full bg-white text-[10px] font-extrabold text-brand ring-2 ring-white/60`}>
      IMC
    </span>
  );
}

const bubble = { initial: { opacity: 0, y: 8, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.25 } };

export default function ChatPreview() {
  const [lang] = useLang();
  const t = useT();
  const a = answerFor(QUESTION);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  // 0 empty, 1 question, 2 typing, 3 answer, 4 quick replies
  const [stage, setStage] = useState(reduce ? 4 : 0);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!inView || reduce) return;
    const timers = [
      setTimeout(() => setStage(1), 250),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 2100),
      setTimeout(() => setStage(4), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(guideUrl(draft || undefined, lang));
  };

  return (
    <div ref={ref} className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-xl shadow-brand/10">
      <div className="flex items-center gap-3 bg-brand px-4 py-3 text-white">
        <span className="relative">
          <GuideAvatar />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand bg-emerald-400" />
        </span>
        <span className="flex-1 leading-tight">
          <span className="block font-semibold">{t("IMC Guide")}</span>
          <span className="text-xs text-white/80">{t("Online · answers in seconds")}</span>
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">{t("Example")}</span>
      </div>

      <div className="dot-grid min-h-[330px] flex-1 space-y-3 bg-[#fbf6f0] px-3 py-4">
        <p className="mx-auto w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-medium text-muted shadow-sm">{t("Today")}</p>

        {stage >= 1 && (
          <motion.div {...bubble} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2 text-sm text-white shadow-sm">
            {t(QUESTION)}
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-white/75">
              9:41 <CheckCheck className="h-3 w-3" />
            </span>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div {...bubble} className="flex items-end gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-peach text-[8px] font-extrabold text-brand">IMC</span>
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm" aria-label={t("IMC Guide is typing")}>
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          </motion.div>
        )}

        {stage >= 3 && (
          <motion.div {...bubble} className="flex items-end gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-peach text-[8px] font-extrabold text-brand">IMC</span>
            <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-white px-3.5 py-3 text-sm shadow-sm">
              <p className="font-semibold">{t(a.title)}</p>
              <ul className="mt-2 space-y-1.5 text-muted">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{t(p)}</li>
                ))}
              </ul>
              {a.officialLink && (
                <a href={a.officialLink.url} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-brand underline underline-offset-4">
                  {t(a.officialLink.label)} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {a.ask && <p className="mt-2 text-[13px]">{t(a.ask)}</p>}
              <span className="mt-1 block text-right text-[10px] text-muted">9:41</span>
            </div>
          </motion.div>
        )}

        {stage >= 4 && a.followUps && (
          <motion.div {...bubble} className="flex flex-wrap gap-2 pl-9">
            {a.followUps.map((f) => {
              const { label, prompt } = followUpPrompt(f);
              const Icon = f === "transport" ? Bus : CalendarDays;
              return (
                <Link key={f} to={guideUrl(prompt, lang)} className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-white px-3.5 py-2 text-sm font-medium text-brand shadow-sm transition hover:bg-brand hover:text-white">
                  <Icon className="h-4 w-4" /> {t(label)}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line bg-white p-2.5">
        <label className="flex-1">
          <span className="sr-only">Ask the guide</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("Ask anything about your visit…")}
            className="w-full rounded-full bg-stone-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95" aria-label="Open the guide">
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
