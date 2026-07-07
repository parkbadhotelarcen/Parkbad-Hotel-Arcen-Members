import Link from "next/link";
import { Award, BarChart3, Gift, Home, LogOut, QrCode, Search, Settings, Trash2, UserCheck, UserCog, Users } from "lucide-react";
import { signOut } from "@/lib/actions";
import { Brand } from "@/components/brand";
import type { Employee, Guest, Level, Reward } from "@/lib/types";
import { nextReward, progressToReward } from "@/lib/loyalty";

const nav = [
  ["/dashboard", Home, "Dashboard"],
  ["/guests", Users, "Gasten"],
  ["/guests/new", Award, "Nieuwe gast"],
  ["/scan", QrCode, "QR scannen"],
  ["/rewards", Gift, "Beloningen"],
  ["/stats", BarChart3, "Statistieken"],
  ["/activations", UserCheck, "Activaties"],
  ["/trash", Trash2, "Prullenbak"],
  ["/settings", Settings, "Instellingen"],
  ["/employees", UserCog, "Medewerkers"],
  ["/logs", Search, "Logs"],
] as const;

export function Shell({ employee, children }: { employee: Employee; children: React.ReactNode }) {
  return (
    <div className="wellness-surface min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-landal-100/80 bg-white/95 p-6 shadow-card lg:block">
        <Brand />
        <nav className="mt-10 space-y-1">
          {nav.map(([href, Icon, label]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-landal-800 transition hover:bg-landal-50 hover:text-landal-900">
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-landal-100/70 bg-white/90 px-4 py-4 text-landal-900 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black uppercase tracking-wide text-landal-700">Receptie - Dashboard</div>
            <div className="flex items-center gap-3 text-sm">
              <span>{employee.name}</span>
              <form action={signOut}>
                <button className="rounded-lg p-2 text-landal-700 hover:bg-landal-50" title="Uitloggen">
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-landal-100 bg-white/95 p-2 shadow-card backdrop-blur lg:hidden">
        {nav.slice(0, 5).map(([href, Icon, label]) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold text-landal-800">
            <Icon className="h-5 w-5" />
            {label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="text-landal-700">{icon}</div>
      <div className="mt-3 text-3xl font-black text-landal-800">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
    </div>
  );
}

export function StatusLabel({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    concept: "bg-amber-100 text-amber-800",
    ended: "bg-slate-100 text-slate-700",
    deleted: "bg-rose-100 text-rose-800",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${styles[status] || styles.ended}`}>{status}</span>;
}

export function Progress({ guest, levels, rewards }: { guest: Guest; levels: Level[]; rewards: Reward[] }) {
  const reward = nextReward(rewards, guest.total_visits);
  const progress = progressToReward(guest.total_visits, reward);
  const level = levels.find((item) => item.name === guest.current_level);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-landal-700">Uw level</div>
          <div className="text-2xl font-black text-landal-900">{guest.current_level} Member</div>
        </div>
        <div className="rounded-lg bg-landal-700 px-4 py-3 text-center text-sm font-black text-white">{level?.icon || "★"}</div>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm font-semibold text-landal-800">
          <span>{progress.current} / {progress.target} bezoeken</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-landal-100">
          <div className="h-full rounded-full bg-gradient-to-r from-landal-600 via-landal-500 to-gold" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
      <div className="rounded-lg border border-landal-100 bg-mist p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-landal-700">Volgende beloning</div>
        <div className="mt-1 text-xl font-black text-landal-900">{reward ? reward.reward_name : "Alle beloningen behaald"}</div>
        {reward && <div className="text-sm text-slate-600">Nog {progress.remaining} bezoeken tot deze beloning.</div>}
      </div>
    </div>
  );
}
