import { createEmployee, updateEmployeeStatus } from "@/lib/employee-actions";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell } from "@/components/ui";

export default async function EmployeesPage() {
  const employee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Medewerkers</h1>
      <p className="mt-2 text-slate-600">Maak medewerkersaccounts aan en beheer toegang tot de receptieomgeving.</p>

      <form action={createEmployee} className="card mt-6 grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label>Naam</label>
          <input name="name" required placeholder="Naam medewerker" />
        </div>
        <div>
          <label>E-mailadres</label>
          <input name="email" type="email" required placeholder="medewerker@example.com" />
        </div>
        <div>
          <label>Tijdelijk wachtwoord</label>
          <input name="password" type="password" required minLength={8} />
        </div>
        <div>
          <label>Rol</label>
          <select name="role" defaultValue="reception">
            <option value="reception">Receptie</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">Medewerker aanmaken</button>
        </div>
      </form>

      <div className="card mt-6 overflow-hidden">
        {(data || []).map((item) => (
          <div key={item.id} className="grid gap-4 border-b border-landal-100 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <div className="font-black text-landal-900">{item.name}</div>
              <div className="text-sm text-slate-600">{item.email} - {item.role}</div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${item.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
              {item.active ? "actief" : "inactief"}
            </div>
            <form action={updateEmployeeStatus.bind(null, item.id, !item.active)}>
              <button className="btn-secondary">{item.active ? "Deactiveren" : "Activeren"}</button>
            </form>
          </div>
        ))}
      </div>
    </Shell>
  );
}
