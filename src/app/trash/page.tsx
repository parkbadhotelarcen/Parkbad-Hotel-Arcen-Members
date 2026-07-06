import { requireEmployee } from "@/lib/auth";
import { anonymizeGuest, restoreGuest } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";
import { toDateLabel } from "@/lib/loyalty";

export default async function TrashPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data } = await supabase.from("guests").select("*").eq("status", "deleted").order("deleted_at", { ascending: false });
  const canManage = employee.role !== "reception";
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Prullenbak</h1>
      <p className="mt-2 text-slate-600">Verwijderde gasten blijven 30 dagen zichtbaar voor manager/admin herstel of anonimisering.</p>
      <div className="card mt-6 overflow-hidden">
        {(data || []).map((guest) => (
          <div key={guest.id} className="grid gap-4 border-b border-landal-100 p-5 md:grid-cols-[1fr_auto]">
            <div>
              <div className="font-black text-landal-900">{guest.first_name} {guest.last_name}</div>
              <div className="text-sm text-slate-600">{guest.guest_number} · verwijderd op {toDateLabel(guest.deleted_at)}</div>
            </div>
            {canManage && (
              <div className="flex gap-3">
                <form action={restoreGuest.bind(null, guest.id)}><button className="btn-secondary">Herstellen</button></form>
                <form action={anonymizeGuest.bind(null, guest.id)}><button className="btn-secondary text-rose-700">Anonimiseren</button></form>
              </div>
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}
