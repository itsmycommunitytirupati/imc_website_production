import { useState, type FormEvent } from "react";
import { CheckCircle2, ImageOff, ShieldAlert } from "lucide-react";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { post } from "../lib/api";
import { Honeypot, HumanCheck, SubmitButton, TextArea, TextInput, useForm } from "./kit";

// One page for photo removal requests and reports about events, posts or behaviour.
export default function ReportPage() {
  const q = new URLSearchParams(window.location.search);
  const [kind, setKind] = useState<"photo_removal" | "report">(q.get("type") === "photo_removal" ? "photo_removal" : "report");
  usePageTitle(kind === "photo_removal" ? "Photo removal | IMC Tirupati" : "Report a concern | IMC Tirupati");
  const t = useT();
  const form = useForm({ name: "", contact: "", what: q.get("about") ?? "", link: "", website: "" });
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const anonymous = kind === "report";

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const v = form.values;
    const res = await form.submit(() =>
      post("/api/submissions", { kind, name: v.name, contact: v.contact, website: v.website, turnstile: token, details: { what: v.what, link: v.link } }),
    );
    if (res) setSent(true);
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex rounded-full bg-white p-1 ring-1 ring-line" role="tablist">
        {([["photo_removal", "Photo removal", ImageOff], ["report", "Report a concern", ShieldAlert]] as const).map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={kind === id} onClick={() => setKind(id)} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${kind === id ? "bg-ink text-white" : ""}`}>
            <Icon className="h-4 w-4" /> {t(label)}
          </button>
        ))}
      </div>
      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight">{kind === "photo_removal" ? t("Take a photo down") : t("Report a concern")}</h1>
      <p className="mt-2 text-muted">
        {kind === "photo_removal"
          ? t("Tell us which photo and we'll remove it, usually within two days. No questions asked.")
          : t("Something wrong with an event, a post or someone's behaviour? Tell us. You can stay anonymous.")}
      </p>
      {sent ? (
        <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-8 text-center" role="status">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 font-display text-2xl font-extrabold">{t("Thank you. The IMC team has it.")}</p>
          <p className="mt-1 text-muted">{form.values.contact ? t("We'll reply to the contact you gave.") : t("We'll act on it without needing to contact you.")}</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="relative mt-8 space-y-4 rounded-3xl border border-line bg-white p-6 shadow-sm">
          <TextArea label={kind === "photo_removal" ? t("Which photo? Describe it or where you saw it") : t("What happened?")} rows={4} value={form.values.what} onChange={(x) => form.set("what", x.target.value)} error={form.errors.what && t(form.errors.what)} />
          <TextInput label={t("Link to the page (optional)")} value={form.values.link} onChange={(x) => form.set("link", x.target.value)} placeholder="https://imctirupati.com/stories/…" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label={anonymous ? t("Name (optional)") : t("Your name")} value={form.values.name} onChange={(x) => form.set("name", x.target.value)} error={form.errors.name && t(form.errors.name)} />
            <TextInput label={anonymous ? t("Contact (optional)") : t("WhatsApp number or email")} value={form.values.contact} onChange={(x) => form.set("contact", x.target.value)} error={form.errors.contact && t(form.errors.contact)} />
          </div>
          <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
          <HumanCheck onToken={setToken} />
          {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
          <SubmitButton busy={form.submitting}>{t("Send to IMC team")}</SubmitButton>
          <p className="text-xs text-muted">{t("Only the IMC moderators see this. For emergencies, call 112.")}</p>
        </form>
      )}
    </section>
  );
}
