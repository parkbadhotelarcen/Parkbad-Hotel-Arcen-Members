import { requireEmployee } from "@/lib/auth";
import { updateSetting } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";

export default async function SettingsPage() {
  const employee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  const { data } = await supabase.from("settings").select("*").order("key");
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Instellingen</h1>
      <div className="mt-6 grid gap-4">
        {(data || []).map((setting) => (
          <form key={setting.key} action={updateSetting.bind(null, setting.key)} className="card grid gap-4 p-5 md:grid-cols-[220px_1fr_auto]">
            <div className="font-bold text-landal-900">{setting.key}</div>
            <textarea name="value" defaultValue={String(setting.value || "")} />
            <button className="btn-secondary">Opslaan</button>
          </form>
        ))}
      </div>
    </Shell>
  );
}
