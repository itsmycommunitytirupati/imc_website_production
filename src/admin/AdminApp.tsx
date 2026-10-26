import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  BarChart3, CalendarDays, Check, Download, ExternalLink, FileText, Flag, Images, Inbox, LayoutDashboard, Lock, Megaphone,
  MessagesSquare, Pencil, Plus, RefreshCw, Ticket, Upload, UserPlus, UserRound, Users, X,
} from "lucide-react";
import { usePageTitle } from "../lib/site";
import { ApiError, api, formatTime, formatWhen, imageUrl, uploadImage, useApi } from "../lib/api";
import { Logo } from "../site/ui";

// Admin portal (admin.imctirupati.com, or /admin). Every request goes to /api/admin/*, which
// checks the Cloudflare Access sign-in and the ADMIN_EMAILS list (worker/admin.ts).
// Nothing is deleted from here: unpublish, cancel or change a status instead.

type Row = Record<string, unknown> & { id: number };
type Tab = "overview" | "events" | "rsvps" | "gallery" | "team" | "groups" | "members" | "adda_posts" | "opportunities" | "stories" | "submissions" | "stats";

const TABS: { id: Tab; label: string; Icon: typeof LayoutDashboard; badge?: keyof Overview }[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "events", label: "Events", Icon: CalendarDays },
  { id: "rsvps", label: "RSVPs", Icon: Ticket },
  { id: "gallery", label: "Gallery", Icon: Images },
  { id: "team", label: "Team", Icon: UserRound },
  { id: "groups", label: "Communities", Icon: Users },
  { id: "members", label: "Join requests", Icon: UserPlus, badge: "newMembers" },
  { id: "adda_posts", label: "Adda moderation", Icon: MessagesSquare, badge: "pendingAdda" },
  { id: "opportunities", label: "Opportunities", Icon: Megaphone, badge: "pendingOpportunities" },
  { id: "stories", label: "Stories", Icon: Images, badge: "draftStories" },
  { id: "submissions", label: "Proposals & reports", Icon: Inbox, badge: "openSubmissions" },
  { id: "stats", label: "Verified numbers", Icon: BarChart3 },
];

interface Overview {
  newMembers: number;
  rsvps7d: number;
  pendingAdda: number;
  pendingOpportunities: number;
  openSubmissions: number;
  draftStories: number;
  upcomingEvents: number;
}

export default function AdminApp() {
  usePageTitle("Admin | IMC Tirupati");
  const me = useApi<{ email: string }>("/api/admin/me");
  const [tab, setTab] = useState<Tab>(() => (new URLSearchParams(window.location.search).get("tab") as Tab) || "overview");
  const overview = useApi<Overview>(me.data ? "/api/admin/overview" : null);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  }, [tab]);

  if (me.loading) return <Center><RefreshCw className="h-6 w-6 animate-spin text-brand" /></Center>;
  if (me.error) return <AuthProblem error={me.error} />;

  return (
    <div className="min-h-screen bg-stone-50 md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Logo compact />
          <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {TABS.map(({ id, label, Icon, badge }) => {
            const n = badge ? overview.data?.[badge] : 0;
            return (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${tab === id ? "bg-brand-soft text-brand" : "text-ink/75 hover:bg-stone-100"}`}>
                <Icon className="h-4 w-4" /> <span className="flex-1 text-left">{label}</span>
                {n ? <span className="rounded-full bg-brand px-2 text-xs font-bold text-white">{n}</span> : null}
              </button>
            );
          })}
        </nav>
        <p className="hidden px-5 py-4 text-xs text-muted md:block">Signed in as<br /><b className="text-ink">{me.data?.email}</b></p>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">
        {tab === "overview" && <OverviewTab data={overview.data} go={setTab} />}
        {tab === "events" && <Resource key="events" config={EVENTS} onChange={overview.reload} />}
        {tab === "rsvps" && <RsvpsTab />}
        {tab === "gallery" && <Resource key="gallery" config={GALLERY} />}
        {tab === "team" && <Resource key="team" config={TEAM} />}
        {tab === "groups" && <Resource key="groups" config={GROUPS} />}
        {tab === "members" && <Resource key="members" config={MEMBERS} onChange={overview.reload} />}
        {tab === "adda_posts" && <Resource key="adda" config={ADDA} onChange={overview.reload} />}
        {tab === "opportunities" && <Resource key="opps" config={OPPORTUNITIES} onChange={overview.reload} />}
        {tab === "stories" && <Resource key="stories" config={STORIES} onChange={overview.reload} />}
        {tab === "submissions" && <Resource key="subs" config={SUBMISSIONS} onChange={overview.reload} />}
        {tab === "stats" && <StatsTab />}
      </main>
    </div>
  );
}

function Center({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-stone-50 p-6">{children}</div>;
}

function AuthProblem({ error }: { error: ApiError }) {
  const copy: Record<string, [string, string]> = {
    not_configured: ["Admin sign-in isn't set up yet", "Cloudflare Access must protect this page before the admin opens. Set ACCESS_TEAM_DOMAIN and ACCESS_AUD in wrangler.jsonc once the Access application exists (see CLAUDE.md)."],
    signed_out: ["Please sign in", "Open this page through the IMC Cloudflare Access sign-in, then reload."],
    forbidden: ["This account isn't on the admin list", "Ask the IMC team to add your email to ADMIN_EMAILS."],
  };
  const [title, text] = copy[error.code] ?? ["Couldn't reach the admin", "Check your connection and reload."];
  return (
    <Center>
      <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <Lock className="mx-auto h-8 w-8 text-brand" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-muted">{text}</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-ink px-5 py-2.5 font-semibold text-white">Reload</button>
      </div>
    </Center>
  );
}

function OverviewTab({ data, go }: { data: Overview | null; go: (t: Tab) => void }) {
  const cards: [string, number | undefined, Tab, string][] = [
    ["New join requests", data?.newMembers, "members", "Add them to their WhatsApp group, then mark added."],
    ["Adda posts to review", data?.pendingAdda, "adda_posts", "Publish, reply or mark not proceeding."],
    ["Opportunities to review", data?.pendingOpportunities, "opportunities", "Check pay, contact and legitimacy."],
    ["Open proposals & reports", data?.openSubmissions, "submissions", "Photo removals first: aim for two days."],
    ["Draft stories", data?.draftStories, "stories", "Publish only with consent confirmed."],
    ["RSVPs in the last 7 days", data?.rsvps7d, "rsvps", "Export per event for hosts."],
    ["Upcoming published events", data?.upcomingEvents, "events", "Keep at least a few each week."],
  ];
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Today at IMC</h1>
      <p className="mt-1 text-muted">What needs a moderator, at a glance.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, n, tab, hint]) => (
          <button key={label} onClick={() => go(tab)} className="rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition hover:border-brand/40">
            <p className="text-sm text-muted">{label}</p>
            <p className={`mt-1 font-display text-4xl font-extrabold ${n ? "text-brand" : ""}`}>{n ?? "–"}</p>
            <p className="mt-2 text-xs text-muted">{hint}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm">
        <p className="font-semibold">Sample content is live for representation</p>
        <p className="mt-1">Rows marked Sample show a badge on the site. Replace them with real events and communities, then untick Sample or unpublish the sample rows.</p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ generic resource */

type FieldType = "text" | "textarea" | "number" | "datetime" | "date" | "select" | "checkbox" | "list" | "group" | "image" | "images";
interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  help?: string;
  wide?: boolean;
}
interface ResourceConfig {
  table: string;
  title: string;
  intro: string;
  create?: boolean;
  defaults?: Record<string, unknown>;
  fields: FieldDef[];
  columns: { label: string; render: (r: Row) => ReactNode }[];
  filters?: { label: string; test: (r: Row) => boolean }[];
  quick?: (r: Row, save: (patch: Record<string, unknown>) => Promise<void>) => ReactNode;
  link?: (r: Row) => string | null;
  /** Show rows as photo cards instead of a table. */
  card?: (r: Row) => ReactNode;
  /** Extra controls above the list (e.g. bulk photo upload); gets a reload callback. */
  toolbar?: (reload: () => void) => ReactNode;
}

const yes = (v: unknown) => Number(v) === 1;
const Pill = ({ children, tone = "stone" }: { children: ReactNode; tone?: "stone" | "green" | "amber" | "red" | "blue" }) => {
  const cls = { stone: "bg-stone-100 text-stone-700", green: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-700", blue: "bg-sky-100 text-sky-800" }[tone];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
};
const toneFor = (s: string) => (["published", "confirmed", "completed", "done", "added", "scheduled", "active"].includes(s) ? "green" : ["pending", "received", "draft", "new", "waitlist", "reviewing", "planned", "in_progress", "forming"].includes(s) ? "amber" : ["cancelled", "rejected", "removed", "declined", "not_proceeding", "closed"].includes(s) ? "red" : "stone");

function Resource({ config, onChange }: { config: ResourceConfig; onChange?: () => void }) {
  const { data, loading, error, reload } = useApi<{ rows: Row[] }>(`/api/admin/${config.table}`);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [filter, setFilter] = useState(0);
  const [toast, setToast] = useState("");
  const rows = useMemo(() => (data?.rows ?? []).filter((r) => !config.filters || config.filters[filter].test(r)), [data, filter, config.filters]);

  const save = async (id: number, patch: Record<string, unknown>) => {
    await api(`/api/admin/${config.table}/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    setToast("Saved");
    setTimeout(() => setToast(""), 1800);
    reload();
    onChange?.();
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{config.title}</h1>
          <p className="mt-1 max-w-2xl text-muted">{config.intro}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCsv(config.table, rows)} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold"><Download className="h-4 w-4" /> CSV</button>
          {config.create && <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> New</button>}
        </div>
      </div>
      {config.filters && (
        <div className="mt-5 flex flex-wrap gap-2">
          {config.filters.map((f, i) => (
            <button key={f.label} onClick={() => setFilter(i)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === i ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>
              {f.label} <span className="opacity-60">{(data?.rows ?? []).filter(f.test).length}</span>
            </button>
          ))}
        </div>
      )}
      {config.toolbar?.(() => {
        reload();
        onChange?.();
      })}
      <div className={`mt-5 rounded-2xl ${config.card ? "" : "overflow-x-auto border border-line bg-white"}`}>
        {loading ? (
          <p className="p-6 text-muted">Loading…</p>
        ) : error ? (
          <p className="p-6 text-red-700">Couldn't load ({error.code}). <button onClick={reload} className="underline">Retry</button></p>
        ) : !rows.length ? (
          <p className="p-6 text-muted">Nothing here right now.</p>
        ) : config.card ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {rows.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <button onClick={() => setEditing(r)} className="block w-full text-left" aria-label="Edit">
                  {config.card!(r)}
                </button>
                <div className="flex flex-wrap items-center gap-2 border-t border-line p-2">{config.quick?.(r, (patch) => save(r.id, patch))}</div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-stone-50 text-left text-muted">
              <tr>
                {config.columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  {config.columns.map((c) => <td key={c.label} className="px-4 py-3">{c.render(r)}</td>)}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {config.quick?.(r, (patch) => save(r.id, patch))}
                      {config.link?.(r) && <a href={config.link(r)!} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-muted hover:bg-stone-100" aria-label="View on site"><ExternalLink className="h-4 w-4" /></a>}
                      {config.fields.length > 0 && <button onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-muted hover:bg-stone-100" aria-label="Edit"><Pencil className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editing && (
        <Editor
          config={config}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
            onChange?.();
            setToast("Saved");
            setTimeout(() => setToast(""), 1800);
          }}
        />
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xl"><Check className="h-4 w-4" /> {toast}</div>}
    </>
  );
}

function toInput(f: FieldDef, v: unknown): unknown {
  if (f.type === "list" || f.type === "images") {
    try {
      const arr = typeof v === "string" ? JSON.parse(v || "[]") : v;
      return Array.isArray(arr) ? arr.join("\n") : "";
    } catch {
      return "";
    }
  }
  if (f.type === "checkbox") return yes(v);
  return v ?? "";
}

function Editor({ config, row, onClose, onSaved }: { config: ResourceConfig; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const groups = useApi<{ rows: Row[] }>(config.fields.some((f) => f.type === "group") ? "/api/admin/groups" : null);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base = row ?? config.defaults ?? {};
    return Object.fromEntries(config.fields.map((f) => [f.key, toInput(f, base[f.key])]));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setFormError("");
    const body: Record<string, unknown> = {};
    for (const f of config.fields) {
      const v = values[f.key];
      body[f.key] = f.type === "list" || f.type === "images" ? String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean) : f.type === "checkbox" ? (v ? 1 : 0) : v;
    }
    try {
      await api(row ? `/api/admin/${config.table}/${row.id}` : `/api/admin/${config.table}`, { method: row ? "PUT" : "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      setFormError(err.code === "invalid" ? "Please fix the highlighted fields." : `Couldn't save (${err.code}).`);
    } finally {
      setBusy(false);
    }
  };

  const input = "mt-1 w-full rounded-lg border border-line px-3 py-2";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="font-display text-xl font-extrabold">{row ? "Edit" : "New"} {config.title.toLowerCase().replace(/s$/, "")}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-stone-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          {config.fields.map((f) => {
            const v = values[f.key];
            const set = (nv: unknown) => setValues((s) => ({ ...s, [f.key]: nv }));
            const wide = f.wide || f.type === "textarea" || f.type === "list" || f.type === "images";
            if (f.type === "image" || f.type === "images")
              return (
                <div key={f.key} className={wide ? "sm:col-span-2" : ""}>
                  <span className="text-sm font-semibold">{f.label}</span>
                  {f.type === "image" ? <ImageField value={String(v ?? "")} onChange={set} /> : <ImagesField value={String(v ?? "")} onChange={set} />}
                  {f.help && <span className="mt-1 block text-xs text-muted">{f.help}</span>}
                  {errors[f.key] && <span className="mt-1 block text-sm text-red-700">{errors[f.key]}</span>}
                </div>
              );
            return (
              <label key={f.key} className={`block ${wide ? "sm:col-span-2" : ""} ${f.type === "checkbox" ? "flex items-start gap-3" : ""}`}>
                {f.type === "checkbox" ? (
                  <>
                    <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
                    <span className="text-sm"><span className="font-semibold">{f.label}</span>{f.help && <span className="block text-xs text-muted">{f.help}</span>}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold">{f.label}</span>
                    {f.type === "textarea" || f.type === "list" ? (
                      <textarea value={String(v ?? "")} onChange={(e) => set(e.target.value)} rows={f.type === "list" ? 3 : 4} className={input} />
                    ) : f.type === "select" ? (
                      <select value={String(v ?? "")} onChange={(e) => set(e.target.value)} className={input}>
                        {f.options?.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                      </select>
                    ) : f.type === "group" ? (
                      <select value={String(v ?? "")} onChange={(e) => set(e.target.value ? Number(e.target.value) : "")} className={input}>
                        <option value="">No community</option>
                        {groups.data?.rows.map((g) => <option key={g.id} value={g.id}>{String(g.name)}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : "text"}
                        value={String(v ?? "")}
                        onChange={(e) => set(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                        className={input}
                      />
                    )}
                    {f.help && <span className="mt-1 block text-xs text-muted">{f.help}</span>}
                  </>
                )}
                {errors[f.key] && <span className="mt-1 block text-sm text-red-700">{errors[f.key]}</span>}
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          {formError && <p className="mr-auto text-sm text-red-700">{formError}</p>}
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-semibold">Cancel</button>
          <button disabled={busy} className="rounded-lg bg-brand px-5 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ photos */

function UploadButton({ multiple = false, onFiles, busy, label = "Upload photo" }: { multiple?: boolean; onFiles: (files: File[]) => void; busy: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple={multiple} hidden onChange={(e) => {
        const files = [...(e.target.files ?? [])];
        e.target.value = "";
        if (files.length) onFiles(files);
      }} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-brand/50 disabled:opacity-60">
        <Upload className="h-4 w-4" /> {busy ? "Uploading…" : label}
      </button>
    </>
  );
}

const uploadError = (e: unknown) =>
  e instanceof ApiError && e.code === "too_large" ? "That photo is too big even after shrinking." : e instanceof ApiError && e.status === 401 ? "Your sign-in expired. Reload the page." : "Upload failed. Try a JPEG or PNG.";

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upload = async ([file]: File[]) => {
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setErr(uploadError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-1 flex items-start gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-line">
        {value && <img src={imageUrl(value)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <UploadButton onFiles={upload} busy={busy} label={value ? "Replace photo" : "Upload photo"} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste a link" className="w-full rounded-lg border border-line px-3 py-1.5 text-xs text-muted" />
        {err && <p className="text-xs text-red-700">{err}</p>}
      </div>
    </div>
  );
}

function ImagesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const list = value.split("\n").map((s) => s.trim()).filter(Boolean);
  const upload = async (files: File[]) => {
    setBusy(true);
    setErr("");
    const added: string[] = [];
    for (const f of files) {
      try {
        added.push(await uploadImage(f));
      } catch (e) {
        setErr(uploadError(e));
      }
    }
    onChange([...list, ...added].join("\n"));
    setBusy(false);
  };
  return (
    <div className="mt-1 space-y-2">
      <div className="flex flex-wrap gap-2">
        {list.map((img, i) => (
          <div key={`${img}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-line">
            <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1 text-[10px] font-bold text-white">Cover</span>}
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i).join("\n"))} aria-label="Remove photo" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-ink"><X className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
      <UploadButton multiple onFiles={upload} busy={busy} label="Add photos" />
      {err && <p className="text-xs text-red-700">{err}</p>}
    </div>
  );
}

function GalleryUploader({ done }: { done: () => void }) {
  const groups = useApi<{ rows: Row[] }>("/api/admin/groups");
  const [groupId, setGroupId] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const upload = async (files: File[]) => {
    setBusy(true);
    setMsg("");
    let ok = 0;
    for (const [i, f] of files.entries()) {
      setMsg(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const image = await uploadImage(f);
        await api("/api/admin/gallery", {
          method: "POST",
          body: JSON.stringify({ image, caption: "", group_id: groupId ? Number(groupId) : null, consent_confirmed: consent ? 1 : 0, published: consent ? 1 : 0, sort: 100 }),
        });
        ok++;
      } catch {
        // Keep going; the summary says how many failed.
      }
    }
    setBusy(false);
    setMsg(`${ok} of ${files.length} uploaded${consent ? " and published" : " as hidden (confirm consent to publish)"}. Click a photo to add a caption.`);
    done();
  };
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/40 p-4">
      <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
        <option value="">Community (optional)</option>
        {groups.data?.rows.map((g) => <option key={g.id} value={g.id}>{String(g.name)}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4 accent-brand" />
        Everyone identifiable agreed to be shown
      </label>
      <UploadButton multiple onFiles={upload} busy={busy} label="Upload photos" />
      {msg && <p className="w-full text-sm text-muted">{msg}</p>}
    </div>
  );
}

function downloadCsv(name: string, rows: Row[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Leading = + - @ would run as formulas in spreadsheets.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `imc-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const SampleTag = ({ r }: { r: Row }) => (yes(r.is_sample) ? <Pill tone="amber">Sample</Pill> : null);
const QuickButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-brand/50 hover:text-brand">{children}</button>
);
const when = (v: unknown) => (v ? `${formatWhen(String(v))}, ${formatTime(String(v))}` : "");
const created = (v: unknown) => (v ? new Date(`${String(v).replace(" ", "T")}Z`).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "");

/* ------------------------------------------------------------------ configs */

const EVENTS: ResourceConfig = {
  table: "events",
  title: "Events",
  intro: "Times are Tirupati time. Cancel instead of deleting, so people who RSVP'd see what happened.",
  create: true,
  defaults: { status: "scheduled", category: "meetups", published: 1, beginner_friendly: 1, capacity: 30, price_inr: 0 },
  filters: [
    { label: "Upcoming", test: (r) => String(r.start_at) >= new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 16) },
    { label: "All", test: () => true },
    { label: "Unpublished", test: (r) => !yes(r.published) },
  ],
  columns: [
    { label: "Event", render: (r) => <span className="font-semibold">{String(r.title)} <SampleTag r={r} /></span> },
    { label: "When", render: (r) => when(r.start_at) },
    { label: "Booked", render: (r) => `${r.booked ?? 0}${Number(r.capacity) ? ` / ${r.capacity}` : ""}` },
    { label: "Status", render: (r) => <><Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill> {!yes(r.published) && <Pill>hidden</Pill>}</> },
  ],
  link: (r) => `/events/${r.slug}`,
  quick: (r, save) => (r.status === "scheduled" ? <QuickButton onClick={() => confirm(`Cancel "${r.title}"? People who RSVP'd will see it as cancelled.`) && save({ status: "cancelled" })}>Cancel</QuickButton> : null),
  fields: [
    { key: "title", label: "Title", wide: true },
    { key: "group_id", label: "Community", type: "group" },
    { key: "category", label: "Category", type: "select", options: ["meetups", "music", "nature", "culture", "food", "sports", "startup"] },
    { key: "summary", label: "One-line summary", wide: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "start_at", label: "Starts", type: "datetime" },
    { key: "end_at", label: "Ends", type: "datetime" },
    { key: "venue", label: "Venue" },
    { key: "area", label: "Area", help: "Used by the area filter, e.g. Tilak Road." },
    { key: "address", label: "Address", wide: true },
    { key: "price_inr", label: "Price (₹, 0 = free)", type: "number" },
    { key: "price_note", label: "Price note", help: "e.g. Includes breakfast" },
    { key: "capacity", label: "Capacity (0 = no limit)", type: "number" },
    { key: "organizer_name", label: "Host shown on page" },
    { key: "image", label: "Cover photo", type: "image", wide: true },
    { key: "first_timer_note", label: "Solo No More note", type: "textarea" },
    { key: "age_note", label: "Age note" },
    { key: "accessibility_note", label: "Accessibility note" },
    { key: "cancellation_terms", label: "Cancellation terms", wide: true },
    { key: "status", label: "Status", type: "select", options: ["scheduled", "cancelled", "completed"] },
    { key: "slug", label: "Web address", help: "Leave empty to make one from the title." },
    { key: "beginner_friendly", label: "Good for first-timers (Solo No More)", type: "checkbox" },
    { key: "published", label: "Published on the site", type: "checkbox" },
    { key: "is_sample", label: "Sample listing (shows a Sample badge)", type: "checkbox" },
  ],
};

const GROUPS: ResourceConfig = {
  table: "groups",
  title: "Communities",
  intro: "Each community needs a real host. Sort controls the order on the site.",
  create: true,
  defaults: { status: "active", published: 1, sort: 20 },
  columns: [
    { label: "Community", render: (r) => <span className="font-semibold">{String(r.name)} <SampleTag r={r} /></span> },
    { label: "Host", render: (r) => `${r.owner_name} · ${r.owner_role}` },
    { label: "Status", render: (r) => <><Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill> {!yes(r.published) && <Pill>hidden</Pill>}</> },
    { label: "Sort", render: (r) => String(r.sort) },
  ],
  link: (r) => `/communities/${r.slug}`,
  fields: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Web address", help: "Matches the logo file name in assets/logos." },
    { key: "tagline", label: "Tagline", wide: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "interests", label: "Interests (one per line)", type: "list", help: "music, sports, nature, food, culture, art, photography, books, dance, cycling, startups, volunteering, women, family, games" },
    { key: "owner_name", label: "Host name" },
    { key: "owner_role", label: "Host role" },
    { key: "status", label: "Status", type: "select", options: ["active", "forming", "paused"] },
    { key: "sort", label: "Sort", type: "number" },
    { key: "image", label: "Cover photo (used when there's no logo)", type: "image", wide: true },
    { key: "joining_note", label: "Who it's for", wide: true },
    { key: "published", label: "Published", type: "checkbox" },
    { key: "is_sample", label: "Sample (shows a badge)", type: "checkbox" },
  ],
};

const MEMBERS: ResourceConfig = {
  table: "members",
  title: "Join requests",
  intro: "People who joined on the site. Add them to their WhatsApp group, then mark them added. Contact details are for the team only.",
  filters: [
    { label: "New", test: (r) => r.status === "new" },
    { label: "All", test: () => true },
  ],
  columns: [
    { label: "Name", render: (r) => <span className="font-semibold">{String(r.name)}</span> },
    { label: "Contact", render: (r) => String(r.contact) },
    { label: "Community", render: (r) => String(r.group_name ?? "—") },
    { label: "Interests", render: (r) => (JSON.parse(String(r.interests || "[]")) as string[]).join(", ") },
    { label: "Updates", render: (r) => (yes(r.updates_ok) ? "Yes" : "No") },
    { label: "Joined", render: (r) => created(r.created_at) },
  ],
  quick: (r, save) => (r.status === "new" ? <QuickButton onClick={() => save({ status: "added" })}>Mark added</QuickButton> : <Pill tone="green">added</Pill>),
  fields: [],
};

const ADDA: ResourceConfig = {
  table: "adda_posts",
  title: "Adda moderation",
  intro: "Nothing appears on the Adda until it's published here. Ideas show their status publicly; your note appears as the IMC team reply.",
  create: true,
  defaults: { kind: "question", status: "received", published: 0 },
  filters: [
    { label: "To review", test: (r) => !yes(r.published) && r.status !== "not_proceeding" },
    { label: "Published", test: (r) => yes(r.published) },
    { label: "All", test: () => true },
  ],
  columns: [
    { label: "Post", render: (r) => <span><Pill tone="blue">{String(r.kind)}</Pill> <span className="font-semibold">{String(r.title)}</span> <SampleTag r={r} /><span className="mt-1 block max-w-md text-xs text-muted">{String(r.body ?? "").slice(0, 160)}</span></span> },
    { label: "By", render: (r) => <span>{String(r.author_name || "Anonymous")}<span className="block text-xs text-muted">{String(r.contact ?? "")}</span></span> },
    { label: "Status", render: (r) => <><Pill tone={toneFor(String(r.status))}>{String(r.status).replace(/_/g, " ")}</Pill> {yes(r.closed) && <Pill>closed</Pill>}{r.kind === "poll" && <span className="block text-xs text-muted">{String(r.vote_count)} votes</span>}</> },
    { label: "Sent", render: (r) => created(r.created_at) },
  ],
  link: (r) => (yes(r.published) ? `/adda#post-${r.id}` : null),
  quick: (r, save) =>
    yes(r.published) ? (
      <QuickButton onClick={() => save({ published: 0 })}>Unpublish</QuickButton>
    ) : (
      <>
        <QuickButton onClick={() => save({ published: 1, status: r.status === "received" ? "reviewing" : r.status })}>Publish</QuickButton>
        <QuickButton onClick={() => save({ status: "not_proceeding" })}>Decline</QuickButton>
      </>
    ),
  fields: [
    { key: "kind", label: "Type", type: "select", options: ["question", "idea", "poll", "recommendation"] },
    { key: "status", label: "Idea status", type: "select", options: ["received", "reviewing", "planned", "in_progress", "completed", "not_proceeding"] },
    { key: "title", label: "Title", wide: true },
    { key: "body", label: "Details", type: "textarea" },
    { key: "poll_options", label: "Poll options (one per line)", type: "list" },
    { key: "admin_note", label: "IMC team reply (shown publicly)", type: "textarea" },
    { key: "author_name", label: "Shown as" },
    { key: "category", label: "Category" },
    { key: "published", label: "Published", type: "checkbox" },
    { key: "closed", label: "Closed (no more votes)", type: "checkbox" },
    { key: "is_sample", label: "Sample", type: "checkbox" },
  ],
};

const OPPORTUNITIES: ResourceConfig = {
  table: "opportunities",
  title: "Opportunities",
  intro: "Check that pay is stated honestly and nobody is asked to pay to apply before publishing.",
  create: true,
  defaults: { kind: "volunteer", status: "published" },
  filters: [
    { label: "Pending", test: (r) => r.status === "pending" },
    { label: "Published", test: (r) => r.status === "published" },
    { label: "All", test: () => true },
  ],
  columns: [
    { label: "Opportunity", render: (r) => <span><span className="font-semibold">{String(r.title)}</span> <SampleTag r={r} /><span className="block text-xs text-muted">{String(r.kind)} · {String(r.compensation)}</span></span> },
    { label: "Posted by", render: (r) => <span>{String(r.posted_by)}<span className="block text-xs text-muted">{String(r.contact ?? "")}</span></span> },
    { label: "Deadline", render: (r) => String(r.deadline || "—") },
    { label: "Status", render: (r) => <Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill> },
  ],
  quick: (r, save) =>
    r.status === "pending" ? (
      <>
        <QuickButton onClick={() => save({ status: "published" })}>Publish</QuickButton>
        <QuickButton onClick={() => save({ status: "rejected" })}>Reject</QuickButton>
      </>
    ) : r.status === "published" ? (
      <QuickButton onClick={() => save({ status: "closed" })}>Close</QuickButton>
    ) : null,
  fields: [
    { key: "title", label: "Title", wide: true },
    { key: "kind", label: "Type", type: "select", options: ["paid", "volunteer", "collab", "internship"] },
    { key: "compensation", label: "Compensation" },
    { key: "eligibility", label: "Who can apply" },
    { key: "deadline", label: "Deadline", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "how_to_apply", label: "How to apply", wide: true },
    { key: "posted_by", label: "Posted by" },
    { key: "contact", label: "Contact (team only)" },
    { key: "status", label: "Status", type: "select", options: ["pending", "published", "closed", "rejected"] },
    { key: "is_sample", label: "Sample", type: "checkbox" },
  ],
};

const GALLERY: ResourceConfig = {
  table: "gallery",
  title: "Gallery",
  intro: "Photos on the site's gallery and the Communities photo wall. Upload many at once; photos only appear once consent is confirmed. Click a photo to caption it.",
  create: true,
  defaults: { published: 0, consent_confirmed: 0, sort: 100 },
  toolbar: (reload) => <GalleryUploader done={reload} />,
  filters: [
    { label: "All", test: () => true },
    { label: "On the site", test: (r) => yes(r.published) && yes(r.consent_confirmed) },
    { label: "Hidden", test: (r) => !yes(r.published) || !yes(r.consent_confirmed) },
  ],
  columns: [],
  card: (r) => (
    <>
      <img src={imageUrl(String(r.image))} alt="" loading="lazy" className="aspect-square w-full object-cover" />
      <span className="block p-2 text-xs">
        <span className="line-clamp-1 font-semibold">{String(r.caption || "Add a caption")}</span>
        <span className="mt-1 flex flex-wrap gap-1">
          {yes(r.published) && yes(r.consent_confirmed) ? <Pill tone="green">on site</Pill> : <Pill>hidden</Pill>}
          {!yes(r.consent_confirmed) && <Pill tone="red">no consent</Pill>}
        </span>
      </span>
    </>
  ),
  quick: (r, save) =>
    yes(r.published) ? (
      <QuickButton onClick={() => save({ published: 0 })}>Hide</QuickButton>
    ) : (
      <QuickButton onClick={() => save({ published: 1 })}>Show</QuickButton>
    ),
  fields: [
    { key: "image", label: "Photo", type: "image", wide: true },
    { key: "caption", label: "Caption", wide: true },
    { key: "alt", label: "Describe the photo (for screen readers)", wide: true },
    { key: "group_id", label: "Community", type: "group" },
    { key: "taken_on", label: "Taken on", type: "date" },
    { key: "sort", label: "Order (lower shows first)", type: "number" },
    { key: "consent_confirmed", label: "Everyone identifiable agreed to be shown", type: "checkbox", help: "Required to publish. Hide it right away if anyone asks." },
    { key: "published", label: "Show on the site", type: "checkbox" },
  ],
};

const TEAM: ResourceConfig = {
  table: "team",
  title: "Team",
  intro: "The people behind IMC, shown on the Team page and the Communities page. Order controls who appears first.",
  create: true,
  defaults: { kind: "captain", published: 1, sort: 50 },
  columns: [
    {
      label: "Person",
      render: (r) => (
        <span className="flex items-center gap-3">
          <img src={imageUrl(String(r.photo || ""))} alt="" className="h-10 w-10 rounded-full object-cover" />
          <span><span className="block font-semibold">{String(r.name)}</span><span className="text-xs text-muted">{String(r.role)}</span></span>
        </span>
      ),
    },
    { label: "Type", render: (r) => <Pill tone="blue">{String(r.kind)}</Pill> },
    { label: "Order", render: (r) => String(r.sort) },
    { label: "Shown", render: (r) => (yes(r.published) ? <Pill tone="green">yes</Pill> : <Pill>hidden</Pill>) },
  ],
  quick: (r, save) => (yes(r.published) ? <QuickButton onClick={() => save({ published: 0 })}>Hide</QuickButton> : <QuickButton onClick={() => save({ published: 1 })}>Show</QuickButton>),
  fields: [
    { key: "name", label: "Name" },
    { key: "role", label: "Role", help: "e.g. Captain · Cricket Club" },
    { key: "kind", label: "Type", type: "select", options: ["core", "captain", "host", "volunteer"] },
    { key: "group_id", label: "Community", type: "group" },
    { key: "photo", label: "Photo", type: "image", wide: true },
    { key: "bio", label: "Short bio (optional)", type: "textarea" },
    { key: "instagram", label: "Instagram handle (optional)", help: "Without the @" },
    { key: "sort", label: "Order (lower shows first)", type: "number" },
    { key: "published", label: "Show on the site", type: "checkbox", help: "Only with the person's agreement." },
  ],
};

const STORIES: ResourceConfig = {
  table: "stories",
  title: "Stories",
  intro: "Recaps for the memory wall. A story can't be published until you confirm consent from everyone identifiable in its photos.",
  create: true,
  defaults: { status: "draft" },
  columns: [
    { label: "Story", render: (r) => <span className="font-semibold">{String(r.title)} <SampleTag r={r} /></span> },
    { label: "Date", render: (r) => String(r.event_date ?? "") },
    { label: "Consent", render: (r) => (yes(r.consent_confirmed) ? <Pill tone="green">confirmed</Pill> : <Pill tone="red">missing</Pill>) },
    { label: "Status", render: (r) => <Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill> },
  ],
  link: (r) => (r.status === "published" ? `/stories/${r.slug}` : null),
  quick: (r, save) => (r.status === "published" ? <QuickButton onClick={() => confirm("Take this story down from the site?") && save({ status: "removed" })}>Take down</QuickButton> : null),
  fields: [
    { key: "title", label: "Title", wide: true },
    { key: "summary", label: "Summary", wide: true },
    { key: "body", label: "Story", type: "textarea" },
    { key: "photos", label: "Photos", type: "images", help: "The first photo is the cover." },
    { key: "group_id", label: "Community", type: "group" },
    { key: "event_date", label: "Event date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["draft", "published", "removed"] },
    { key: "slug", label: "Web address", help: "Leave empty to make one from the title." },
    { key: "consent_confirmed", label: "Everyone identifiable in these photos agreed to be shown", type: "checkbox", help: "Required to publish. Remove the story if anyone asks." },
    { key: "is_sample", label: "Sample", type: "checkbox" },
  ],
};

const SUBMISSIONS: ResourceConfig = {
  table: "submissions",
  title: "Proposals & reports",
  intro: "Event proposals, photo removal requests and reports. Handle photo removals first: take the story down, then mark done.",
  filters: [
    { label: "Open", test: (r) => r.status === "received" || r.status === "reviewing" },
    { label: "Photo removals", test: (r) => r.kind === "photo_removal" },
    { label: "Reports", test: (r) => r.kind === "report" },
    { label: "Proposals", test: (r) => r.kind === "event_proposal" },
    { label: "All", test: () => true },
  ],
  columns: [
    { label: "Type", render: (r) => <Pill tone={r.kind === "event_proposal" ? "blue" : "red"}>{r.kind === "photo_removal" ? <><Images className="mr-1 inline h-3 w-3" />photo removal</> : r.kind === "report" ? <><Flag className="mr-1 inline h-3 w-3" />report</> : <><FileText className="mr-1 inline h-3 w-3" />proposal</>}</Pill> },
    { label: "Details", render: (r) => <Details json={String(r.details ?? "{}")} /> },
    { label: "From", render: (r) => <span>{String(r.name || "Anonymous")}<span className="block text-xs text-muted">{String(r.contact ?? "")}</span></span> },
    { label: "Status", render: (r) => <><Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill>{r.admin_note ? <span className="mt-1 block max-w-[14rem] text-xs text-muted">{String(r.admin_note)}</span> : null}</> },
    { label: "Sent", render: (r) => created(r.created_at) },
  ],
  quick: (r, save) =>
    r.status === "received" || r.status === "reviewing" ? (
      <>
        <QuickButton onClick={() => save({ status: "done" })}>Done</QuickButton>
        <QuickButton onClick={() => save({ status: "declined" })}>Decline</QuickButton>
      </>
    ) : null,
  fields: [
    { key: "status", label: "Status", type: "select", options: ["received", "reviewing", "done", "declined"] },
    { key: "admin_note", label: "Team note (internal)", type: "textarea" },
  ],
};

function Details({ json }: { json: string }) {
  let d: Record<string, string> = {};
  try {
    d = JSON.parse(json);
  } catch {
    // Shown empty if the stored details are malformed.
  }
  return (
    <dl className="max-w-md space-y-0.5 text-xs">
      {Object.entries(d).filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="flex gap-2"><dt className="shrink-0 text-muted">{k.replace(/_/g, " ")}:</dt><dd className="break-words">{v}</dd></div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ rsvps */

function RsvpsTab() {
  const events = useApi<{ rows: Row[] }>("/api/admin/events");
  const [eventId, setEventId] = useState("");
  const rsvps = useApi<{ rows: Row[] }>(`/api/admin/rsvps${eventId ? `?event_id=${eventId}` : ""}`);
  const setStatus = async (r: Row, status: string) => {
    await api(`/api/admin/rsvps/${r.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    rsvps.reload();
  };
  const rows = (rsvps.data?.rows ?? []).filter((r) => r.ref !== "SAMPLE-FULL");
  const total = rows.filter((r) => r.status === "confirmed").reduce((n, r) => n + Number(r.party_size), 0);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">RSVPs</h1>
          <p className="mt-1 text-muted">Share the CSV with the host only. Never publish attendee lists.</p>
        </div>
        <button onClick={() => downloadCsv(`rsvps${eventId ? `-${eventId}` : ""}`, rows)} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold"><Download className="h-4 w-4" /> CSV</button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2">
          <option value="">All events</option>
          {events.data?.rows.map((e) => <option key={e.id} value={e.id}>{formatWhen(String(e.start_at))} · {String(e.title)}</option>)}
        </select>
        <span className="text-sm text-muted">{rows.length} RSVPs · {total} confirmed people</span>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        {rsvps.loading ? <p className="p-6 text-muted">Loading…</p> : !rows.length ? <p className="p-6 text-muted">No RSVPs yet.</p> : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-stone-50 text-left text-muted"><tr>{["Ref", "Name", "Contact", "People", "Event", "Note", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-mono text-xs">{String(r.ref)}</td>
                  <td className="px-4 py-3 font-semibold">{String(r.name)}</td>
                  <td className="px-4 py-3">{String(r.contact)}</td>
                  <td className="px-4 py-3">{String(r.party_size)}</td>
                  <td className="px-4 py-3">{String(r.event_title)}<span className="block text-xs text-muted">{when(r.start_at)}</span></td>
                  <td className="max-w-[12rem] px-4 py-3 text-xs text-muted">{String(r.note ?? "")}</td>
                  <td className="px-4 py-3"><Pill tone={toneFor(String(r.status))}>{String(r.status)}</Pill></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "waitlist" && <QuickButton onClick={() => setStatus(r, "confirmed")}>Confirm</QuickButton>}
                      {r.status !== "cancelled" && <QuickButton onClick={() => setStatus(r, "cancelled")}>Cancel</QuickButton>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ stats */

function StatsTab() {
  const { data, reload } = useApi<{ stats: { items: { label: string; value: string }[]; verified_by: string; verified_on: string } | null }>("/api/admin/stats");
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const base = data?.stats?.items ?? [];
    setItems([...base, ...Array.from({ length: 4 - base.length }, () => ({ label: "", value: "" }))]);
  }, [data]);
  const save = async () => {
    setMsg("");
    try {
      await api("/api/admin/stats", { method: "PUT", body: JSON.stringify({ items }) });
      setMsg("Saved. These now show on the Communities page.");
      reload();
    } catch (e) {
      setMsg(`Couldn't save (${(e as ApiError).code}).`);
    }
  };
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Verified numbers</h1>
      <p className="mt-1 max-w-2xl text-muted">The brief allows counts only when IMC can verify them. Nothing shows until you save here; leave all rows empty to hide them. Saving records your email and today's date.</p>
      <div className="mt-6 max-w-xl space-y-3 rounded-2xl border border-line bg-white p-6">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[7rem_1fr] gap-3">
            <input value={it.value} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="e.g. 12" className="rounded-lg border border-line px-3 py-2" aria-label="Value" />
            <input value={it.label} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="e.g. active communities" className="rounded-lg border border-line px-3 py-2" aria-label="Label" />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} className="rounded-lg bg-brand px-5 py-2 font-semibold text-white">Save as verified</button>
          {msg && <p className="text-sm">{msg}</p>}
        </div>
        {data?.stats && <p className="text-xs text-muted">Last verified by {data.stats.verified_by} on {data.stats.verified_on}.</p>}
      </div>
    </>
  );
}
