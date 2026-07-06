import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell, StatCard } from "@/components/ui";

export default async function StatsPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const [guests, visits, rewards, deleted] = await Promise.all([
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("visits").select("id", { count: "exact", head: true }),
    supabase.from("issued_rewards").select("id", { count: "exact", head: true }),
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("status", "deleted"),
  ]);
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Statistieken</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="actieve gasten" value={guests.count || 0} />
        <StatCard label="totaal bezoeken" value={visits.count || 0} />
        <StatCard label="uitgegeven beloningen" value={rewards.count || 0} />
        <StatCard label="verwijderd" value={deleted.count || 0} />
      </div>
    </Shell>
  );
}
