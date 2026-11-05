import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Lock, ShieldCheck, Ticket, Wallet } from "lucide-react";
import { Link } from "../lib/router";
import { useT } from "../lib/i18n";
import { api, formatTime, formatWhen, post, type EventItem } from "../lib/api";
import { track } from "../lib/analytics";
import { Honeypot, HumanCheck, SubmitButton, TextArea, TextInput, useForm } from "./kit";

interface Me {
  email: string;
  credit_paise: number;
}
type StartResult = { ok: true; status: "redirect"; url: string; order: string } | { ok: true; status: "confirmed"; ref: string; repeat?: boolean; paid_with?: string };

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Paid events: details → seat held → PhonePe (or IMC credit) → confirmed only after the server checks. */
export default function PayForm({ e }: { e: EventItem }) {
  const t = useT();
  const [me, setMe] = useState<Me | null>(null);
  const form = useForm({ name: "", email: "", phone: "", party_size: 1, note: "", website: "", use_credit: true });
  const [token, setToken] = useState("");
  const [done, setDone] = useState<{ ref: string; repeat?: boolean } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    api<Me>("/api/me")
      .then((m) => {
        setMe(m);
        form.set("email", m.email);
      })
      .catch(() => setMe(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = e.price_inr * 100 * form.values.party_size;
  const credit = me && form.values.use_credit && form.values.email.trim().toLowerCase() === me.email ? Math.min(me.credit_paise, total) : 0;
  const due = total - credit;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) => post<StartResult>("/api/pay/start", { ...v, slug: e.slug, use_credit: credit > 0, turnstile: token }), {
      sold_out: "The last spots just went. Try another event or join the waitlist.",
      cancelled: "This event was just cancelled.",
      past: "This event has already started.",
      payments_unavailable: "Online payment isn't available right now. Please try again later.",
      gateway_error: "We couldn't reach PhonePe. Nothing was charged, so please try again.",
      credit_changed: "Your IMC credit changed. Please try again.",
      human_check: "Please complete the check above and try again.",
    });
    if (!res) return;
    if (res.status === "confirmed") {
      setDone({ ref: res.ref, repeat: res.repeat });
      track("payment_complete", { event: e.slug, method: "credit" });
      return;
    }
    track("start_payment", { event: e.slug, party: form.values.party_size });
    setLeaving(true);
    window.location.assign(res.url);
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-display text-2xl font-extrabold">{t("You're in!")}</p>
        <p className="mt-1 text-muted">{done.repeat ? t("You'd already signed up, so here's your booking again.") : t("Paid with your IMC credit. A receipt is on its way to your email.")}</p>
        <div className="mt-5 rounded-2xl bg-cream p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("Your reference")}</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-bold tracking-wider"><Ticket className="h-5 w-5 text-brand" /> {done.ref}</p>
          <p className="mt-2 text-sm">{formatWhen(e.start_at, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(e.start_at)}</p>
        </div>
        <Link to="/bookings" className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-brand">{t("My bookings")}</Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => {
        if (!started.current) {
          started.current = true;
          track("start_registration", { event: e.slug, paid: true });
        }
      }}
      noValidate
      className="relative space-y-4 rounded-3xl border border-line bg-white p-6 shadow-lg"
    >
      <div>
        <p className="font-display text-2xl font-extrabold">{t("Book your spot")}</p>
        <p className="mt-1 text-sm text-muted">{t("Your spot is held for 15 minutes while you pay. It's confirmed only once PhonePe confirms the payment.")}</p>
      </div>
      <TextInput label={t("Your name")} autoComplete="name" value={form.values.name} onChange={(x) => form.set("name", x.target.value)} error={form.errors.name && t(form.errors.name)} />
      <TextInput label={t("Email")} type="email" autoComplete="email" value={form.values.email} onChange={(x) => form.set("email", x.target.value)} error={form.errors.email && t(form.errors.email)} hint={t("Your receipt and booking go here.")} />
      <TextInput label={t("Mobile number")} type="tel" autoComplete="tel" inputMode="tel" value={form.values.phone} onChange={(x) => form.set("phone", x.target.value)} error={form.errors.phone && t(form.errors.phone)} hint={t("Only the host uses this, for event updates.")} />
      <label className="block">
        <span className="text-sm font-semibold">{t("How many people?")}</span>
        <select value={form.values.party_size} onChange={(x) => form.set("party_size", Number(x.target.value))} className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 1 ? t("Just me") : `${n} ${t("people")}`}</option>)}
        </select>
      </label>
      <TextArea label={t("Anything the host should know? (optional)")} rows={2} value={form.values.note} onChange={(x) => form.set("note", x.target.value)} className="min-h-0" />

      {me && me.credit_paise > 0 ? (
        <label className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 text-sm">
          <input type="checkbox" checked={form.values.use_credit} onChange={(x) => form.set("use_credit", x.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
          <span><Wallet className="mr-1 inline h-4 w-4 text-emerald-700" /> {t("Use my IMC credit")} ({rupees(me.credit_paise)} {t("available")})</span>
        </label>
      ) : !me ? (
        <p className="text-xs text-muted">{t("Have IMC credit from a cancelled event?")} <Link to={`/bookings?next=/events/${e.slug}`} className="font-semibold text-brand underline">{t("Sign in to use it")}</Link></p>
      ) : null}

      <div className="rounded-2xl bg-cream p-4 text-sm">
        <div className="flex justify-between"><span>{rupees(e.price_inr * 100)} × {form.values.party_size}</span><span>{rupees(total)}</span></div>
        {credit > 0 && <div className="mt-1 flex justify-between text-emerald-700"><span>{t("IMC credit")}</span><span>−{rupees(credit)}</span></div>}
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-display text-lg font-extrabold"><span>{t("To pay")}</span><span>{rupees(due)}</span></div>
      </div>

      <Honeypot value={form.values.website} onChange={(v) => form.set("website", v)} />
      <HumanCheck onToken={setToken} />
      {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
      <SubmitButton busy={form.submitting || leaving}>{due > 0 ? `${t("Pay")} ${rupees(due)} ${t("with PhonePe")}` : t("Confirm with IMC credit")}</SubmitButton>
      <p className="flex items-start gap-2 text-xs text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" /> {t("You pay on PhonePe's secure page. IMC never sees your UPI PIN or card details.")}
      </p>
      {e.cancellation_terms && (
        <p className="flex items-start gap-2 text-xs text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> {e.cancellation_terms}</p>
      )}
    </form>
  );
}

