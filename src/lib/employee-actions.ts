"use server";

import { revalidatePath } from "next/cache";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

async function logEmployeeAction(employeeId: string, action: string, details: Record<string, unknown>) {
  const supabase = createAdminClient();
  await supabase.from("audit_logs").insert({ employee_id: employeeId, guest_id: null, action, details });
}

export async function createEmployee(formData: FormData) {
  const currentEmployee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "reception");
  if (!email || !password || !name) throw new Error("Naam, e-mail en wachtwoord zijn verplicht.");
  if (!["reception", "manager", "admin"].includes(role)) throw new Error("Ongeldige rol.");

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Supabase heeft geen gebruiker aangemaakt.");

  const { error: employeeError } = await supabase.from("employees").insert({
    auth_user_id: authData.user.id,
    name,
    email,
    role,
    active: true,
  });
  if (employeeError) throw new Error(employeeError.message);

  await logEmployeeAction(currentEmployee.id, "medewerker aangemaakt", { email, role });
  revalidatePath("/employees");
}

export async function updateEmployeeStatus(employeeId: string, active: boolean) {
  const currentEmployee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  await supabase.from("employees").update({ active }).eq("id", employeeId);
  await logEmployeeAction(currentEmployee.id, active ? "medewerker geactiveerd" : "medewerker gedeactiveerd", { employee_id: employeeId });
  revalidatePath("/employees");
}
