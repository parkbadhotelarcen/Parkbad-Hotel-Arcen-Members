import { Gift, Settings } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { updateReward } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";

export default async function RewardsPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data } = await supabase.from("rewards").select("*").eq("active", true).order("visit_count");
  const canEdit = employee.role !== "reception";

  return (
    <Shell employee={employee}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-landal-900">Beloningen</h1>
          <p className="mt-1 text-slate-600">Rustig overzicht van mijlpalen voor vaste gasten.</p>
        </div>
        {canEdit && (
          <a href="#aanpassen" className="btn-secondary">
            <Settings className="h-4 w-4" /> Beloningen aanpassen
          </a>
        )}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(data || []).map((reward) => (
          <article key={reward.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-black uppercase tracking-wide text-landal-600">{reward.visit_count} bezoeken</div>
                <h2 className="mt-2 text-xl font-black text-landal-900">{reward.reward_name}</h2>
                {reward.reward_description && <p className="mt-2 text-sm text-slate-600">{reward.reward_description}</p>}
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mist text-landal-700">
                <Gift className="h-6 w-6" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {canEdit && (
        <section id="aanpassen" className="mt-8">
          <h2 className="text-2xl font-black text-landal-900">Beloningen aanpassen</h2>
          <div className="mt-4 grid gap-4">
            {(data || []).map((reward) => (
              <form key={reward.id} action={updateReward.bind(null, reward.id)} className="card grid gap-4 p-5 md:grid-cols-[120px_1fr_1fr_auto]">
                <div className="text-2xl font-black text-landal-800">{reward.visit_count}x</div>
                <input name="reward_name" defaultValue={reward.reward_name} />
                <input name="reward_description" defaultValue={reward.reward_description || ""} />
                <label className="flex items-center gap-2">
                  <input className="h-4 w-4" name="active" type="checkbox" defaultChecked={reward.active} /> actief
                </label>
                <button className="btn-secondary md:col-start-4">Opslaan</button>
              </form>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
