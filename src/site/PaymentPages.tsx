// Pages around payment: return from PhonePe, "My bookings" (email-code sign-in), the
// credit-or-refund choice after a cancellation, and the local-only mock checkout.
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, LogOut, Mail, Ticket, Wallet, XCircle } from "lucide-react";
import { Link, navigate } from "../lib/router";
import { usePageTitle } from "../lib/site";
import { useT } from "../lib/i18n";
import { ApiError, api, formatTime, formatWhen, post } from "../lib/api";
import { track } from "../lib/analytics";
import { ErrorState, SubmitButton, TextInput, useForm } from "./kit";
import { rupees } from "./PayForm";

const Shell = ({ children }: { children: React.ReactNode }) => <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-16">{children}</section>;

/* ------------------------------------------------------------------ return from PhonePe */

interface PayStatus {
  state: "created" | "pending" | "completed" | "failed" | "expired";
  ref: string | null;
  party_size: number;
  total_paise: number;
  event: { title: string; slug: string; start_at: string; venue: string } | null;
}

export function PayReturnPage() {
  usePageTitle("Payment | IMC Tirupati");
  const t = useT();
  const order = new URLSearchParams(window.location.search).get("o") ?? "";
  const [status, setStatus] = useState<PayStatus | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let alive = true;
    let tries = 0;
    // The server asks PhonePe each time; keep asking for about a minute while it's pending.
    const check = async () => {
      try {
        const s = await api<PayStatus>(`/api/pay/status?o=${encodeURIComponent(order)}`);
        if (!alive) return;
        setStatus(s);
        if (s.state === "completed") track("payment_complete", { event: s.event?.slug ?? "", method: "phonepe" });
        if ((s.state === "pending" || s.state === "created") && ++tries < 24) setTimeout(check, 2500);
        else if (s.state === "pending" || s.state === "created") setGaveUp(true);
      } catch (e) {
        if (alive) setError(e as ApiError);
      }
    };
    check();
    return () => {
      alive = false;
    };
  }, [order]);

  if (error) return <Shell><ErrorState error={error} onRetry={() => window.location.reload()} /></Shell>;
  if (!status || ((status.state === "pending" || status.state === "created") && !gaveUp)) {
    return (
      <Shell>
        <div className="rounded-3xl border border-line bg-white p-8 text-center" role="status">
          <Clock className="mx-auto h-10 w-10 animate-pulse text-brand" />
          <p className="mt-3 font-display text-2xl font-extrabold">{t("Checking your payment…")}</p>
          <p className="mt-1 text-muted">{t("We're confirming with PhonePe. Please keep this page open.")}</p>
        </div>
      </Shell>
    );
  }
  if (status.state === "completed") {
    return (
      <Shell>
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg" role="status">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <p className="mt-3 font-display text-3xl font-extrabold">{t("You're in!")}</p>
          <p className="mt-1 text-muted">{t("Payment received and your spot is confirmed. A receipt is on its way to your email.")}</p>
          <div className="mt-5 rounded-2xl bg-cream p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("Your reference")}</p>
            <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-bold tracking-wider"><Ticket className="h-5 w-5 text-brand" /> {status.ref}</p>
            {status.event && (
              <>
                <p className="mt-2 font-semibold">{status.event.title}</p>
                <p className="text-sm">{formatWhen(status.event.start_at, { weekday: "long", day: "numeric", month: "long" })} · {formatTime(status.event.start_at)}</p>
                <p className="text-sm text-muted">{status.event.venue} · {status.party_size} {status.party_size > 1 ? t("people") : t("person")} · {rupees(status.total_paise)}</p>
              </>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/bookings" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-brand">{t("My bookings")}</Link>
            {status.event && <Link to={`/events/${status.event.slug}`} className="rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-line">{t("Event details")}</Link>}
          </div>
        </div>
      </Shell>
    );
  }
  if (gaveUp) {
    return (
      <Shell>
        <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center" role="status">
          <Clock className="mx-auto h-10 w-10 text-amber-600" />
          <p className="mt-3 font-display text-2xl font-extrabold">{t("Still waiting for PhonePe")}</p>
          <p className="mt-1 text-muted">{t("Some payments take a few minutes. We'll email you as soon as it's confirmed. If it fails, any money taken is returned by your bank.")}</p>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-brand">{t("Check again")}</button>
        </div>
      </Shell>
    );
  }
  return (
    <Shell>
      <div className="rounded-3xl border border-red-200 bg-white p-8 text-center" role="alert">
        <XCircle className="mx-auto h-10 w-10 text-red-600" />
        <p className="mt-3 font-display text-2xl font-extrabold">{t("Payment didn't go through")}</p>
        <p className="mt-1 text-muted">{t("Your spot has been released and nothing was confirmed. You can try again.")}</p>
        {status.event && <Link to={`/events/${status.event.slug}`} className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-brand">{t("Try again")}</Link>}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ my bookings */

interface Booking {
  ref: string;
  party_size: number;
  status: string;
  title: string;
  slug: string;
  start_at: string;
  venue: string;
  event_status: string;
  total_paise: number | null;
  resolution: string | null;
}

export function BookingsPage() {
  usePageTitle("My bookings | IMC Tirupati");
  const t = useT();
  const [me, setMe] = useState<{ email: string; credit_paise: number; bookings: Booking[] } | null | undefined>(undefined);
  const load = () => api<{ email: string; credit_paise: number; bookings: Booking[] }>("/api/me").then(setMe).catch(() => setMe(null));
  useEffect(() => {
    load();
  }, []);

  if (me === undefined) return <Shell><div className="h-40 animate-pulse rounded-3xl bg-stone-200" /></Shell>;
  if (!me) return <Shell><SignIn onDone={() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/")) navigate(next);
    else load();
  }} /></Shell>;

  const now = new Date().toISOString().slice(0, 16);
  const upcoming = me.bookings.filter((b) => b.start_at >= now && b.status === "confirmed");
  const others = me.bookings.filter((b) => !upcoming.includes(b));
  const logout = async () => {
    await post("/api/auth/logout", {});
    setMe(null);
  };

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("My bookings")}</h1>
          <p className="mt-1 text-sm text-muted">{me.email}</p>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-line"><LogOut className="h-4 w-4" /> {t("Sign out")}</button>
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-3xl bg-emerald-50 p-5">
        <Wallet className="h-8 w-8 text-emerald-700" />
        <div>
          <p className="text-sm text-emerald-900">{t("IMC credit")}</p>
          <p className="font-display text-3xl font-extrabold text-emerald-900">{rupees(me.credit_paise)}</p>
          <p className="text-xs text-emerald-900/70">{t("Used automatically when you book with this email. Only for IMC events.")}</p>
        </div>
      </div>
      <h2 className="mt-10 font-display text-2xl font-extrabold">{t("Coming up")}</h2>
      {upcoming.length ? <div className="mt-4 space-y-3">{upcoming.map((b) => <BookingRow key={b.ref} b={b} />)}</div> : (
        <p className="mt-3 text-muted">{t("No upcoming bookings.")} <Link to="/events" className="font-semibold text-brand underline">{t("Browse events")}</Link></p>
      )}
      {others.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-2xl font-extrabold">{t("Past and cancelled")}</h2>
          <div className="mt-4 space-y-3">{others.map((b) => <BookingRow key={b.ref} b={b} />)}</div>
        </>
      )}
    </Shell>
  );
}

function BookingRow({ b }: { b: Booking }) {
  const t = useT();
  const label = b.status === "cancelled" ? (b.resolution === "credit" ? t("Cancelled · credit added") : b.resolution === "refund" ? t("Cancelled · refunded") : t("Cancelled")) : b.event_status === "cancelled" ? t("Event cancelled · check your email") : t("Confirmed");
  return (
    <Link to={`/events/${b.slug}`} className="block rounded-2xl border border-line bg-white p-4 hover:border-brand/40">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{b.title}</p>
        <span className="font-mono text-xs text-muted">{b.ref}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{formatWhen(b.start_at)} · {formatTime(b.start_at)} · {b.venue}</p>
      <p className="mt-1 text-xs font-semibold text-brand">{label}{b.total_paise ? ` · ${rupees(b.total_paise)}` : ""}</p>
    </Link>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const t = useT();
  const form = useForm({ email: "", code: "" });
  const [stage, setStage] = useState<"email" | "code">("email");
  const [devCode, setDevCode] = useState("");
  const send = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) => post<{ ok: true; dev_code?: string }>("/api/auth/start", { email: v.email }), {
      email_unavailable: "Email sign-in isn't switched on yet.",
      email_failed: "We couldn't send the email. Check the address and try again.",
    });
    if (res) {
      setStage("code");
      setDevCode(res.dev_code ?? "");
    }
  };
  const verify = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = await form.submit((v) => post("/api/auth/verify", { email: v.email, code: v.code }));
    if (res) onDone();
  };
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <Mail className="h-8 w-8 text-brand" />
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{t("My bookings")}</h1>
      <p className="mt-1 text-muted">{t("No password. We email you a 6-digit code.")}</p>
      {stage === "email" ? (
        <form onSubmit={send} noValidate className="mt-6 space-y-4">
          <TextInput label={t("Email")} type="email" autoComplete="email" value={form.values.email} onChange={(x) => form.set("email", x.target.value)} error={form.errors.email && t(form.errors.email)} />
          {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
          <SubmitButton busy={form.submitting}>{t("Email me a code")}</SubmitButton>
        </form>
      ) : (
        <form onSubmit={verify} noValidate className="mt-6 space-y-4">
          <p className="text-sm">{t("We sent a code to")} <b>{form.values.email}</b>.</p>
          {devCode && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Local testing: code {devCode}</p>}
          <TextInput label={t("6-digit code")} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.values.code} onChange={(x) => form.set("code", x.target.value.replace(/\D/g, ""))} error={form.errors.code && t(form.errors.code)} />
          {form.formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{t(form.formError)}</p>}
          <SubmitButton busy={form.submitting}>{t("Sign in")}</SubmitButton>
          <button type="button" onClick={() => setStage("email")} className="ml-3 text-sm font-semibold text-brand">{t("Use a different email")}</button>
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ credit or refund */

export function ChoosePage() {
  usePageTitle("Cancelled event | IMC Tirupati");
  const t = useT();
  const token = new URLSearchParams(window.location.search).get("t") ?? "";
  const [info, setInfo] = useState<{ ref: string; name: string; total_paise: number; gateway_paise: number; credit_paise: number; event: string; resolution: string } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"credit" | "refund" | null>(null);
  useEffect(() => {
    api<typeof info>(`/api/pay/claim?t=${encodeURIComponent(token)}`).then(setInfo).catch(setError);
  }, [token]);

  const choose = async (choice: "credit" | "refund") => {
    setBusy(true);
    try {
      await post("/api/pay/choose", { t: token, choice });
      setDone(choice);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  };

  if (error?.status === 404) return <Shell><p className="rounded-3xl bg-white p-8 text-center ring-1 ring-line">{t("This link has already been used or has expired. Check My bookings for your credit or refund.")}</p></Shell>;
  if (error) return <Shell><ErrorState error={error} onRetry={() => window.location.reload()} /></Shell>;
  if (!info) return <Shell><div className="h-40 animate-pulse rounded-3xl bg-stone-200" /></Shell>;
  const resolved = done ?? (info.resolution as "credit" | "refund" | "");
  return (
    <Shell>
      <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted">{info.ref}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">{info.event} {t("is cancelled")}</h1>
        <p className="mt-2 text-muted">{t("Sorry about that. You paid")} {rupees(info.total_paise)}. {t("What would you like?")}</p>
        {resolved ? (
          <p className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-900" role="status">
            <CheckCircle2 className="h-5 w-5" /> {resolved === "credit" ? t("Done. The full amount is now IMC credit.") : t("Done. Your refund has started. Banks usually show it within a few working days.")}
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            <button disabled={busy} onClick={() => choose("credit")} className="rounded-2xl bg-ink p-4 text-left text-white hover:bg-brand disabled:opacity-60">
              <span className="block font-semibold">{t("Keep it as IMC credit")} · {rupees(info.total_paise)}</span>
              <span className="text-sm text-white/75">{t("Instant. Use it for any IMC event.")}</span>
            </button>
            <button disabled={busy} onClick={() => choose("refund")} className="rounded-2xl p-4 text-left ring-1 ring-line hover:ring-brand/40 disabled:opacity-60">
              <span className="block font-semibold">{t("Refund to my account")}{info.gateway_paise ? ` · ${rupees(info.gateway_paise)}` : ""}</span>
              <span className="text-sm text-muted">{t("Back to where you paid from, usually within a few working days.")}{info.credit_paise ? ` ${t("Any credit you used comes back as credit.")}` : ""}</span>
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ mock checkout (local only) */

export function MockPayPage() {
  const q = new URLSearchParams(window.location.search);
  const order = q.get("o") ?? "";
  const back = q.get("back") ?? "/";
  const finish = async (outcome: "success" | "fail") => {
    await post("/api/pay/mock", { o: order, outcome });
    window.location.assign(back.startsWith("http") ? new URL(back).pathname + new URL(back).search : back);
  };
  return (
    <Shell>
      <div className="rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Local test checkout · not PhonePe · no money moves</p>
        <p className="mt-3 font-mono text-sm">{order}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => finish("success")} className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white">Simulate success</button>
          <button onClick={() => finish("fail")} className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white">Simulate failure</button>
        </div>
      </div>
    </Shell>
  );
}
