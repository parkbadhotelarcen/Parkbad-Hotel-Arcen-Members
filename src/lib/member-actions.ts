"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export async function findMemberProgress(formData: FormData) {
  const guestNumber = String(formData.get("guest_number") || "").trim().toUpperCase();
  const controlCode = String(formData.get("control_code") || "").trim().toUpperCase();

  if (!guestNumber || !controlCode) {
    redirect("/member?error=Vul gastnummer en controlecode in");
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("guests")
    .select("public_token")
    .eq("guest_number", guestNumber)
    .eq("control_code", controlCode)
    .eq("status", "active")
    .maybeSingle();

  if (!data?.public_token) {
    redirect("/member?error=Geen actief lid gevonden met deze combinatie");
  }

  redirect(`/guest/${data.public_token}`);
}
