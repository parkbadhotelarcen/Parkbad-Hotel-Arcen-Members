import Link from "next/link";
import { BarChart3, FileText, Lock, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { updateSetting } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";

const adminLinks = [
  { href: "/employees", label: "Medewerkers", description: "Accounts en rollen beheren.", icon: UserCog },
  { href: "/logs", label: "Logs", description: "Activiteiten en wijzigingen terugvinden.", icon: FileText },
  { href: "/trash", label: "Prullenbak", description: "Verwijderde gasten herstellen of anonimiseren.", icon: Trash2 },
  { href: "/stats", label: "Statistieken", description: "Managementoverzicht en cijfers.", icon: BarChart3 },
];

export default async function SettingsPage() {
  const employee = await requireEmployee();
  const isManager = employee.role === "manager" || employee.role === "admin";
  const supabase = createAdminClient();
  const { data } = isManager ? await supabase.from("settings").select("*").order("key") : { data: [] };

  return (
    <Shell employee={employee}>
      <div>
        <h1 className="text-4xl font-black text-landal-900">Instellingen</h1>
        <p className="mt-1 text-slate-600">Minder gebruikte beheerfuncties staan hier rustig bij elkaar.</p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="card p-5">
          <ShieldCheck className="h-7 w-7 text-landal-700" />
          <h2 className="mt-4 text-xl font-black text-landal-900">Privacy / AVG</h2>
          <p className="mt-2 text-sm text-slate-600">Conceptprofielen blijven geblokkeerd tot de gast akkoord geeft met deelname en privacy.</p>
          <Link href="/privacy" className="btn-secondary mt-4">Privacy bekijken</Link>
        </article>

        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.href} className="card p-5">
              <Icon className="h-7 w-7 text-landal-700" />
              <h2 className="mt-4 text-xl font-black text-landal-900">{item.label}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              {isManager ? (
                <Link href={item.href} className="btn-secondary mt-4">Openen</Link>
              ) : (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
                  <Lock className="h-4 w-4" /> Manager/admin
                </div>
              )}
            </article>
          );
        })}
      </section>

      {isManager && (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-landal-900">Systeeminstellingen</h2>
          <div className="mt-4 grid gap-4">
            {(data || []).map((setting) => (
              <form key={setting.key} action={updateSetting.bind(null, setting.key)} className="card grid gap-4 p-5 md:grid-cols-[220px_1fr_auto]">
                <div className="font-bold text-landal-900">{setting.key}</div>
                <textarea name="value" defaultValue={String(setting.value || "")} />
                <button className="btn-secondary">Opslaan</button>
              </form>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
