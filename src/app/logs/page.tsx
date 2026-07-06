import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";
import { toDateLabel } from "@/lib/loyalty";

export default async function LogsPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data } = await supabase.from("audit_logs").select("*,employees(name),guests(guest_number)").order("created_at", { ascending: false }).limit(100);
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Activiteitenlog</h1>
      <div className="card mt-6 overflow-hidden">
        {(data || []).map((log) => (
          <div key={log.id} className="grid gap-2 border-b border-landal-100 p-5 md:grid-cols-[180px_1fr_180px]">
            <div className="text-sm text-slate-600">{toDateLabel(log.created_at)}</div>
            <div>
              <div className="font-bold text-landal-900">{log.action}</div>
              <div className="text-xs text-slate-500">{JSON.stringify(log.details || {})}</div>
            </div>
            <div className="text-sm text-slate-600">{log.employees?.name || "Gast/systeem"} · {log.guests?.guest_number || "-"}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
