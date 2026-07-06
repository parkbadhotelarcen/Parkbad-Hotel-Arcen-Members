import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Employee, EmployeeRole } from "@/lib/types";

export async function getEmployee(): Promise<Employee | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", userData.user.id)
    .eq("active", true)
    .maybeSingle();
  return (data as Employee | null) || null;
}

export async function requireEmployee(roles?: EmployeeRole[]) {
  const employee = await getEmployee();
  if (!employee) redirect("/login");
  if (roles && !roles.includes(employee.role)) redirect("/dashboard");
  return employee;
}
