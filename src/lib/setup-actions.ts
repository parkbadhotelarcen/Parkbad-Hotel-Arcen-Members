"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export async function createFirstAdmin(formData: FormData) {
  const supabase = createAdminClient();
  const { count, error: countError } = await supabase.from("employees").select("id", { count: "exact", head: true });
  if (countError) redirect(`/setup?error=${encodeURIComponent(countError.message)}`);
  if ((count || 0) > 0) redirect("/login?error=Setup is al afgerond");

  const setupSecret = process.env.SETUP_SECRET;
  const submittedSecret = String(formData.get("setup_secret") || "");
  if (setupSecret && submittedSecret !== setupSecret) {
    redirect("/setup?error=Ongeldige setup-code");
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 8) {
    redirect("/setup?error=Vul naam, e-mail en een wachtwoord van minimaal 8 tekens in");
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (authError || !authData.user) {
    redirect(`/setup?error=${encodeURIComponent(authError?.message || "Account aanmaken mislukt")}`);
  }

  const { error: employeeError } = await supabase.from("employees").insert({
    auth_user_id: authData.user.id,
    name,
    email,
    role: "admin",
    active: true,
  });
  if (employeeError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    redirect(`/setup?error=${encodeURIComponent(employeeError.message)}`);
  }

  await supabase.from("audit_logs").insert({
    employee_id: null,
    guest_id: null,
    action: "eerste admin aangemaakt",
    details: { email },
  });

  redirect("/login?created=1");
}
