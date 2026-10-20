import { useState } from "react";
import { CalendarDays, LayoutDashboard, Lock, MessageSquareText, Plus, Users } from "lucide-react";
import { usePageTitle } from "../lib/site";
import { EXPERIENCES, categoryLabel, formatDate } from "../content/experiences";
import { WINGS_DATA } from "../data";
import { Logo } from "../site/ui";

// Admin surface: admin.imctirupati.com (or /admin until that domain exists).
// UI shell with sample data. Before launch it must sit behind Cloudflare
// Access, and writes go to a Worker API backed by D1 (see claude.md).

type Tab = "overview" | "experiences" | "clubs" | "questions";

const TABS: { id: Tab; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "experiences", label: "Experiences", Icon: CalendarDays },
  { id: "clubs", label: "Clubs", Icon: Users },
  { id: "questions", label: "Guide questions", Icon: MessageSquareText },
];

// Illustrative only, until the guide logs questions.
const SAMPLE_QUESTIONS = [
  { q: "Which darshan suits elderly parents?", topic: "Darshan", count: 42 },
  { q: "Where can we park at Tirumala?", topic: "Parking", count: 31 },
  { q: "Family-friendly stay near bus stand", topic: "Stays", count: 24 },
  { q: "Things to do with half a day", topic: "Nearby", count: 18 },
];

export default function AdminApp() {
  usePageTitle("Admin | IMC Tirupati");
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div className="min-h-screen bg-stone-50 md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Logo compact />
          <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${tab === id ? "bg-brand-soft text-brand" : "text-ink/75 hover:bg-stone-100"}`}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="p-4 sm:p-8">
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            <strong>Preview with sample data.</strong> Nothing here saves yet. Before launch this page will require an IMC team sign-in through
            Cloudflare Access, and changes will publish to the live site.
          </p>
        </div>

        {tab === "overview" && (
          <>
            <h1 className="mt-6 font-display text-2xl font-extrabold">Overview</h1>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Upcoming experiences" value={EXPERIENCES.length} />
              <Stat label="Clubs" value={WINGS_DATA.length} />
              <Stat label="Guide questions (sample)" value={SAMPLE_QUESTIONS.reduce((s, q) => s + q.count, 0)} />
              <Stat label="Join requests" value="WhatsApp" />
            </div>
            <h2 className="mt-8 font-semibold">Next up</h2>
            <ExperienceTable rows={EXPERIENCES.slice(0, 4)} />
          </>
        )}

        {tab === "experiences" && (
          <>
            <div className="mt-6 flex items-center justify-between">
              <h1 className="font-display text-2xl font-extrabold">Experiences</h1>
              <button disabled className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white opacity-50" title="Available once the events database is connected">
                <Plus className="h-4 w-4" /> New experience
              </button>
            </div>
            <ExperienceTable rows={EXPERIENCES} />
          </>
        )}

        {tab === "clubs" && (
          <>
            <h1 className="mt-6 font-display text-2xl font-extrabold">Clubs</h1>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WINGS_DATA.map((w) => (
                <div key={w.id} className="rounded-xl border border-line bg-white p-4">
                  <p className="font-semibold">{w.name}</p>
                  <p className="mt-1 text-sm text-muted">{w.shortIntro}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "questions" && (
          <>
            <h1 className="mt-6 font-display text-2xl font-extrabold">Guide questions</h1>
            <p className="mt-1 text-sm text-muted">What visitors ask most. Use it to improve the visitor guide. (Sample data.)</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
              {SAMPLE_QUESTIONS.map((q) => (
                <div key={q.q} className="flex items-center justify-between gap-4 border-b border-line p-4 last:border-0">
                  <div>
                    <p className="font-medium">{q.q}</p>
                    <p className="text-xs text-muted">{q.topic}</p>
                  </div>
                  <span className="text-sm font-semibold">{q.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function ExperienceTable({ rows }: { rows: typeof EXPERIENCES }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Experience</th>
            <th className="px-4 py-3 font-semibold">Club</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="border-t border-line">
              <td className="px-4 py-3 font-medium">{e.title}</td>
              <td className="px-4 py-3">{e.club}</td>
              <td className="px-4 py-3">{categoryLabel(e.category)}</td>
              <td className="px-4 py-3">{formatDate(e.date)}</td>
              <td className="px-4 py-3">{e.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
