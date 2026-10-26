import { useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, CheckCircle2, Megaphone } from "lucide-react";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { istToday, post, useApi, type Opportunity } from "../lib/api";
import { track } from "../lib/analytics";
import { IMC_PHOTOS } from "../content/photos";
import { PageHero } from "./ui";
import { EmptyState, ErrorState, Field, Honeypot, HumanCheck, LoadingCards, OpportunityCard, SubmitButton, TextArea, TextInput, useForm } from "./kit";

const KINDS = [
  { id: "paid", label: "Paid" },
  { id: "volunteer", label: "Voluntary" },
  { id: "collab", label: "Collaboration" },
  { id: "internship", label: "Internship" },
] as const;

export default function OpportunitiesPage() {
  usePageTitle("Opportunities | IMC Tirupati", "Gigs, volunteer roles, collaborations and internships from people in Tirupati, plus a form to propose your own meetup.");
  const t = useT();
  const [kind, setKind] = useState("");
  const [tab, setTab] = useState<"post" | "propose">(() => (window.location.hash === "#propose" ? "propose" : "post"));
  const { data, loading, error, reload } = useApi<{ opportunities: Opportunity[] }>("/api/opportunities");
  const items = (data?.opportunities ?? []).filter((o) => !kind || o.kind === kind);

  useEffect(() => {
    const onHash = () => window.location.hash === "#propose" && setTab("propose");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const chip = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-brand/40"}`;

  return (
    <>
      <PageHero eyebrow={t("Opportunities")} title={t("Talent undhi. Team ledhu. Let's fix that.")} sub={t("Gigs, volunteer roles and collabs from people in Tirupati. Paid or voluntary is always shown upfront.")} image={IMC_PHOTOS.roundTable} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <button onClick={() => setKind("")} className={chip(!kind)} aria-pressed={!kind}>{t("All")}</button>
          {KINDS.map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)} className={chip(kind === k.id)} aria-pressed={kind === k.id}>{t(k.label)}</button>
          ))}
        </div>
        <div className="mt-6">
          {loading ? (
            <LoadingCards />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : !items.length ? (
            <EmptyState title={t("No open opportunities right now.")} action={<a href="#share" className="font-semibold text-brand underline">{t("Post one")}</a>} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((o) => <OpportunityCard key={o.id} o={o} />)}</div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">{t("IMC reviews every listing but doesn't employ or vet applicants. Never pay to apply.")}</p>
      </section>

      <section id="share" className="scroll-mt-24 bg-white py-14">
        <div id="propose" className="mx-auto max-w-3xl scroll-mt-24 px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Don't just attend the scene. Create the scene.")}</h2>
          <div className="mx-auto mt-6 flex w-fit rounded-full bg-cream p-1 ring-1 ring-line" role="tablist">
            <button role="tab" aria-selected={tab === "post"} onClick={() => setTab("post")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${tab === "post" ? "bg-ink text-white" : ""}`}>
              <Megaphone className="h-4 w-4" /> {t("Post an opportunity")}
            </button>
            <button role="tab" aria-selected={tab === "propose"} onClick={() => setTab("propose")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${tab === "propose" ? "bg-ink text-white" : ""}`}>
              <CalendarPlus className="h-4 w-4" /> {t("Propose an event")}
            </button>
          </div>
          <div className="mt-8">{tab === "post" ? <OpportunityForm /> : <ProposeForm />}</div>
        </div>
      </section>
    </>
  );
}

function Sent({ title, text, again }: { title: string; text: string; again: () => void }) {
  const t = useT();
  return (
    <div className="rounded-3xl border border-emerald-200 bg-cream p-8 text-center" role="status">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
      <p className="mt-3 font-display text-2xl font-extrabold">{title}</p>
      <p className="mt-1 text-muted">{text}</p>
      <button onClick={again} className="mt-5 font-semibold text-brand">{t("Send another")}</button>
    </div>
  );
}

const EMPTY_OPP = { kind: "", title: "", compensation: "", eligibility: "", deadline: "", description: "", how_to_apply: "", posted_by: "", contact: "", website: "" };

function OpportunityForm() {
  const t = useT();
  const form = useForm(EMPTY_OPP);
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) => post("/api/opportunities", { ...v, turnstile: token }));
    if (res) {
      setSent(true);
      track("submit_opportunity", { kind: form.values.kind });
    }
  };
  if (sent) return <Sent title={t("Thanks! It's in the review queue.")} text={t("The IMC team checks every listing. We'll contact you if anything is unclear.")} again={() => { form.setValues(EMPTY_OPP); setSent(false); }} />;
  const err = (k: string) => form.errors[k] && t(form.errors[k]);
  return (
    <form onSubmit={submit} noValidate className="relative space-y-4">
      <Field label={t("Type")} error={err("kind")}>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button type="button" key={k.id} onClick={() => form.set("kind", k.id)} aria-pressed={form.values.kind === k.id} className={`rounded-full px-4 py-2 text-sm font-semibold ${form.values.kind === k.id ? "bg-brand text-white" : "bg-cream ring-1 ring-line"}`}>{t(k.label)}</button>
          ))}
        </div>
      </Field>
      <TextInput label={t("Title")} value={form.values.title} onChange={(x) => form.set("title", x.target.value)} error={err("title")} placeholder={t("e.g. Photographer for a Saturday food walk")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={t("Pay or compensation")} value={form.values.compensation} onChange={(x) => form.set("compensation", x.target.value)} error={err("compensation")} placeholder={t("e.g. ₹1,500, or Voluntary")} />
        <TextInput label={t("Deadline (optional)")} type="date" min={istToday()} value={form.values.deadline} onChange={(x) => form.set("deadline", x.target.value)} />
      </div>
      <TextInput label={t("Who can apply (optional)")} value={form.values.eligibility} onChange={(x) => form.set("eligibility", x.target.value)} />
      <TextArea label={t("Description")} rows={4} value={form.values.description} onChange={(x) => form.set("description", x.target.value)} />
      <TextInput label={t("How to apply")} value={form.values.how_to_apply} onChange={(x) => form.set("how_to_apply", x.target.value)} error={err("how_to_apply")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={t("Your name or organisation")} value={form.values.posted_by} onChange={(x) => form.set("posted_by", x.target.value)} error={err("posted_by")} />
        <TextInput label={t("WhatsApp number or email")} value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={err("contact")} hint={t("For the IMC team only.")} />
      </div>
      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting}>{t("Send for review")}</SubmitButton>
    </form>
  );
}

const EMPTY_PROPOSAL = { name: "", contact: "", event_title: "", when: "", where: "", about: "", help: "", website: "" };

function ProposeForm() {
  const t = useT();
  const form = useForm(EMPTY_PROPOSAL);
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const v = form.values;
    const res = await form.submit(() =>
      post("/api/submissions", { kind: "event_proposal", name: v.name, contact: v.contact, website: v.website, turnstile: token, details: { event_title: v.event_title, when: v.when, where: v.where, about: v.about, help: v.help } }),
    );
    if (res) {
      setSent(true);
      track("submit_idea", { kind: "event_proposal" });
    }
  };
  if (sent) return <Sent title={t("Love it. We'll be in touch.")} text={t("A host reads every proposal and replies within a few days.")} again={() => { form.setValues(EMPTY_PROPOSAL); setSent(false); }} />;
  const err = (k: string) => form.errors[k] && t(form.errors[k]);
  return (
    <form onSubmit={submit} noValidate className="relative space-y-4">
      <TextInput label={t("What's the event called?")} value={form.values.event_title} onChange={(x) => form.set("event_title", x.target.value)} error={err("event_title")} placeholder={t("e.g. Sunday sketch walk at Swarnamukhi")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={t("When (roughly)")} value={form.values.when} onChange={(x) => form.set("when", x.target.value)} placeholder={t("e.g. Any Sunday morning")} />
        <TextInput label={t("Where (if you know)")} value={form.values.where} onChange={(x) => form.set("where", x.target.value)} />
      </div>
      <TextArea label={t("What happens there?")} rows={4} value={form.values.about} onChange={(x) => form.set("about", x.target.value)} />
      <TextInput label={t("What help do you need? (optional)")} value={form.values.help} onChange={(x) => form.set("help", x.target.value)} placeholder={t("Venue, people, promotion…")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={t("Your name")} value={form.values.name} onChange={(x) => form.set("name", x.target.value)} error={err("name")} />
        <TextInput label={t("WhatsApp number or email")} value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={err("contact")} />
      </div>
      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting}>{t("Send proposal")}</SubmitButton>
    </form>
  );
}
