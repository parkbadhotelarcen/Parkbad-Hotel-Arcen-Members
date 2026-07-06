import { Gift, Users, UserPlus, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell, StatCard } from "@/components/ui";

export default async function DashboardPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const [active, concepts, newToday, rewardsToday, visitsToday, topGuests, trash] = await Promise.all([
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("status", "concept"),
    supabase.from("guests").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
    supabase.from("issued_rewards").select("id", { count: "exact", head: true }).gte("issued_at", `${today}T00:00:00`),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("visit_date", today),
    supabase.from("guests").select("id,guest_number,first_name,last_name,total_visits,current_level").eq("status", "active").order("total_visits", { ascending: false }).limit(10),
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("status", "deleted"),
  ]);
  return (
    <Shell employee={employee}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-landal-900">Dashboard</h1>
          <p className="text-slate-600">Overzicht van leden, activaties, bezoeken en beloningen.</p>
        </div>
        <Link href="/guests/new" className="btn-primary">Nieuwe gast toevoegen</Link>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="actieve leden" value={active.count || 0} icon={<Users />} />
        <StatCard label="conceptprofielen" value={concepts.count || 0} icon={<UserPlus />} />
        <StatCard label="nieuwe leden vandaag" value={newToday.count || 0} icon={<Users />} />
        <StatCard label="beloningen vandaag" value={rewardsToday.count || 0} icon={<Gift />} />
        <StatCard label="bezoeken vandaag" value={visitsToday.count || 0} icon={<CalendarCheck />} />
        <StatCard label="verwijderd in prullenbak" value={trash.count || 0} icon={<Users />} />
      </section>
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-landal-100 p-5">
          <h2 className="text-xl font-black text-landal-900">Top 10 vaste gasten</h2>
        </div>
        <div className="divide-y divide-landal-100">
          {(topGuests.data || []).map((guest) => (
            <Link href={`/guests/${guest.id}`} key={guest.id} className="flex items-center justify-between p-5 hover:bg-landal-50">
              <div>
                <div className="font-bold text-landal-900">{guest.first_name} {guest.last_name}</div>
                <div className="text-sm text-slate-600">{guest.guest_number} · {guest.current_level}</div>
              </div>
              <div className="text-2xl font-black text-landal-800">{guest.total_visits}</div>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
