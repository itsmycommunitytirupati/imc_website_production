import { useState, type FormEvent } from "react";
import { CheckCircle2, Flag, Lightbulb, Lock, MessageCircleQuestion, Plus, Sparkles, Trash2, Vote } from "lucide-react";
import { Link } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { post, useApi, type AddaPost } from "../lib/api";
import { track } from "../lib/analytics";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, Honeypot, HumanCheck, SampleBadge, SubmitButton, TextArea, TextInput, useForm } from "./kit";

const KINDS = [
  { id: "question", label: "Question", Icon: MessageCircleQuestion },
  { id: "idea", label: "Idea", Icon: Lightbulb },
  { id: "poll", label: "Poll", Icon: Vote },
  { id: "recommendation", label: "Recommendation", Icon: Sparkles },
] as const;

// Idea statuses, in the order the brief describes them.
const STATUS: Record<string, { label: string; cls: string }> = {
  received: { label: "Received", cls: "bg-stone-100 text-stone-700" },
  reviewing: { label: "Under review", cls: "bg-sky-100 text-sky-800" },
  planned: { label: "Planned", cls: "bg-violet-100 text-violet-800" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-800" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800" },
  not_proceeding: { label: "Not proceeding", cls: "bg-red-100 text-red-700" },
};

const VOTES_KEY = "imc-poll-votes";
function readVotes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export default function AddaPage() {
  usePageTitle("Tirupati Adda | IMC Tirupati", "Ask Tirupati, pitch an idea, vote on the next meetup. Every post is moderated by the IMC team.");
  const t = useT();
  const [kind, setKind] = useState<string>("");
  const { data, loading, error, reload } = useApi<{ posts: AddaPost[] }>("/api/adda");
  const posts = (data?.posts ?? []).filter((p) => !kind || p.kind === kind);

  return (
    <>
      <PageHero eyebrow={t("Tirupati Adda")} title={t("Chai, charcha, plans.")} sub={t("Ask the city, pitch an idea, vote on the next meetup. A moderator reads every post before it goes up.")} image={IMC_PHOTOS.tableTalk} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
            <button onClick={() => setKind("")} className={chip(!kind)} aria-pressed={!kind}>{t("All")}</button>
            {KINDS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setKind(id)} className={`${chip(kind === id)} inline-flex items-center gap-1.5`} aria-pressed={kind === id}>
                <Icon className="h-4 w-4" /> {t(label)}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              [0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-stone-200" />)
            ) : error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : !posts.length ? (
              <EmptyState action={<a href="#post" className="font-semibold text-brand underline">{t("Start the conversation")}</a>} />
            ) : (
              posts.map((p) => <PostCard key={p.id} p={p} onVoted={reload} />)
            )}
          </div>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <NewPostForm />
          <Guidelines />
        </aside>
      </div>
    </>
  );
}

const chip = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-brand/40"}`;

function PostCard({ p, onVoted }: { p: AddaPost; onVoted: () => void }) {
  const t = useT();
  const kind = KINDS.find((k) => k.id === p.kind) ?? KINDS[0];
  const status = STATUS[p.status];
  return (
    <article id={`post-${p.id}`} className="scroll-mt-32 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 font-bold text-brand"><kind.Icon className="h-3.5 w-3.5" /> {t(kind.label)}</span>
        {p.kind === "idea" && status && <span className={`rounded-full px-2.5 py-1 font-bold ${status.cls}`}>{t(status.label)}</span>}
        {p.closed === 1 && <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-bold text-stone-600"><Lock className="h-3 w-3" /> {t("Closed")}</span>}
        {p.is_sample === 1 && <SampleBadge />}
        <span className="ml-auto text-muted">{p.author_name || t("A member")}</span>
      </div>
      <h3 className="mt-3 font-display text-xl font-extrabold leading-snug">{p.title}</h3>
      {p.body && <p className="mt-2 whitespace-pre-line text-ink/80">{p.body}</p>}
      {p.kind === "poll" && <Poll p={p} onVoted={onVoted} />}
      {p.admin_note && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> <span><b>{t("IMC team")}:</b> {p.admin_note}</span>
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Link to={`/report?type=report&about=${encodeURIComponent(`Adda post #${p.id}: ${p.title}`)}`} className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-700">
          <Flag className="h-3.5 w-3.5" /> {t("Report")}
        </Link>
      </div>
    </article>
  );
}

function Poll({ p, onVoted }: { p: AddaPost; onVoted: () => void }) {
  const t = useT();
  const [mine, setMine] = useState<number | undefined>(() => readVotes()[p.id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const total = p.votes.reduce((a, b) => a + b, 0);
  const showResults = mine !== undefined || p.closed === 1;

  const vote = async (i: number) => {
    setBusy(true);
    setErr("");
    try {
      await post(`/api/adda/${p.id}/vote`, { option: i });
      const all = { ...readVotes(), [p.id]: i };
      try {
        localStorage.setItem(VOTES_KEY, JSON.stringify(all));
      } catch {
        // Storage blocked; the vote still counts.
      }
      setMine(i);
      onVoted();
    } catch {
      setErr(t("Your vote didn't go through. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {p.poll_options.map((o, i) => {
        const pct = total ? Math.round((p.votes[i] / total) * 100) : 0;
        return showResults ? (
          <div key={i} className="relative overflow-hidden rounded-xl bg-cream px-4 py-2.5">
            <div className={`absolute inset-y-0 left-0 ${mine === i ? "bg-brand/25" : "bg-stone-200"}`} style={{ width: `${pct}%` }} />
            <div className="relative flex justify-between text-sm">
              <span className="font-medium">{o} {mine === i && "✓"}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
          </div>
        ) : (
          <button key={i} disabled={busy} onClick={() => vote(i)} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium ring-1 ring-line transition hover:bg-brand-soft hover:ring-brand/40 disabled:opacity-60">
            {o}
          </button>
        );
      })}
      <p className="text-xs text-muted">
        {total} {t("votes")}
        {mine !== undefined && p.closed !== 1 && (
          <button onClick={() => setMine(undefined)} className="ml-2 font-semibold text-brand">{t("Change vote")}</button>
        )}
      </p>
      {err && <p className="text-sm text-red-700" role="alert">{err}</p>}
    </div>
  );
}

function NewPostForm() {
  const t = useT();
  const form = useForm({ kind: "question", title: "", body: "", category: "general", name: "", contact: "", website: "", options: ["", ""] });
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) =>
      post("/api/adda", { kind: v.kind, title: v.title, body: v.body, category: v.category, name: v.name, contact: v.contact, website: v.website, poll_options: v.kind === "poll" ? v.options : [], turnstile: token }),
    );
    if (res) {
      setSent(true);
      track("submit_idea", { kind: form.values.kind });
    }
  };

  if (sent) {
    return (
      <div id="post" className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg" role="status">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        <p className="mt-3 font-display text-xl font-extrabold">{t("Got it. A moderator will take a look.")}</p>
        <p className="mt-1 text-sm text-muted">{t("Approved posts usually appear within a day. Ideas get a status you can follow here.")}</p>
        <button onClick={() => { form.setValues({ kind: "question", title: "", body: "", category: "general", name: "", contact: "", website: "", options: ["", ""] }); setSent(false); }} className="mt-4 text-sm font-semibold text-brand">{t("Post something else")}</button>
      </div>
    );
  }

  const setOption = (i: number, v: string) => form.set("options", form.values.options.map((o, j) => (j === i ? v : o)));

  return (
    <form id="post" onSubmit={submit} noValidate className="relative scroll-mt-32 space-y-4 rounded-3xl border border-line bg-white p-6 shadow-lg">
      <p className="font-display text-xl font-extrabold">{t("Post to the Adda")}</p>
      <div className="grid grid-cols-2 gap-2">
        {KINDS.map(({ id, label, Icon }) => (
          <button type="button" key={id} onClick={() => form.set("kind", id)} aria-pressed={form.values.kind === id} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${form.values.kind === id ? "bg-ink text-white" : "bg-cream ring-1 ring-line"}`}>
            <Icon className="h-4 w-4" /> {t(label)}
          </button>
        ))}
      </div>
      <TextInput label={t("Title")} value={form.values.title} onChange={(x) => form.set("title", x.target.value)} error={form.errors.title && t(form.errors.title)} maxLength={140} />
      <TextArea label={t("Details (optional)")} rows={3} value={form.values.body} onChange={(x) => form.set("body", x.target.value)} maxLength={1000} className="min-h-0" />
      {form.values.kind === "poll" && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{t("Options")}</legend>
          {form.values.options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input value={o} onChange={(x) => setOption(i, x.target.value)} maxLength={60} placeholder={`${t("Option")} ${i + 1}`} className="w-full rounded-xl border border-line px-3 py-2.5" />
              {form.values.options.length > 2 && (
                <button type="button" onClick={() => form.set("options", form.values.options.filter((_, j) => j !== i))} aria-label={t("Remove option")} className="px-2 text-muted"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
          {form.values.options.length < 5 && (
            <button type="button" onClick={() => form.set("options", [...form.values.options, ""])} className="inline-flex items-center gap-1 text-sm font-semibold text-brand"><Plus className="h-4 w-4" /> {t("Add option")}</button>
          )}
          {form.errors.poll_options && <p className="text-sm text-red-700" role="alert">{t(form.errors.poll_options)}</p>}
        </fieldset>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <TextInput label={t("Name (optional)")} value={form.values.name} onChange={(x) => form.set("name", x.target.value)} />
        <TextInput label={t("Contact (optional)")} value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={form.errors.contact && t(form.errors.contact)} hint={t("Only if you'd like a reply. Never shown.")} />
      </div>
      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting}>{t("Send for review")}</SubmitButton>
    </form>
  );
}

function Guidelines() {
  const t = useT();
  return (
    <div className="rounded-3xl bg-peach/70 p-6 text-sm">
      <p className="font-semibold">{t("Adda rules, short version")}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
        <li>{t("Be kind. Disagree with ideas, not people.")}</li>
        <li>{t("No selling, spam or political campaigning.")}</li>
        <li>{t("No phone numbers or personal details of others.")}</li>
        <li>{t("For darshan bookings and timings, use official TTD sources.")}</li>
      </ul>
      <Link to="/terms" className="mt-3 inline-block font-semibold text-brand underline-offset-4 hover:underline">{t("Full community guidelines")}</Link>
    </div>
  );
}
