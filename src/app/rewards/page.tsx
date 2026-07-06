import { requireEmployee } from "@/lib/auth";
import { updateReward } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";

export default async function RewardsPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data } = await supabase.from("rewards").select("*").order("visit_count");
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Beloningen</h1>
      <div className="mt-6 grid gap-4">
        {(data || []).map((reward) => (
          <form key={reward.id} action={updateReward.bind(null, reward.id)} className="card grid gap-4 p-5 md:grid-cols-[120px_1fr_1fr_auto]">
            <div className="text-2xl font-black text-landal-800">{reward.visit_count}x</div>
            <input name="reward_name" defaultValue={reward.reward_name} disabled={employee.role === "reception"} />
            <input name="reward_description" defaultValue={reward.reward_description || ""} disabled={employee.role === "reception"} />
            <label className="flex items-center gap-2"><input className="h-4 w-4" name="active" type="checkbox" defaultChecked={reward.active} disabled={employee.role === "reception"} /> actief</label>
            {employee.role !== "reception" && <button className="btn-secondary md:col-start-4">Opslaan</button>}
          </form>
        ))}
      </div>
    </Shell>
  );
}
