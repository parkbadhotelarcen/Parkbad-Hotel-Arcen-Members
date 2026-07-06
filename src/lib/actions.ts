"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { formatGuestNumber, levelForVisits, makeControlCode, makeToken } from "@/lib/loyalty";
import type { Level, Reward } from "@/lib/types";

async function logAction(employeeId: string | null, guestId: string | null, action: string, details: Record<string, unknown> = {}) {
  const supabase = createAdminClient();
  await supabase.from("audit_logs").insert({ employee_id: employeeId, guest_id: guestId, action, details });
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent("Inloggen mislukt")}`);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createGuest(formData: FormData) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { count } = await supabase.from("guests").select("id", { count: "exact", head: true });
  const guestNumber = formatGuestNumber((count || 0) + 128);
  const reservationNumber = String(formData.get("reservation_number") || "").trim();
  const roomNumber = String(formData.get("room_number") || "").trim();
  const payload = {
    guest_number: guestNumber,
    first_name: String(formData.get("first_name") || "").trim(),
    last_name: String(formData.get("last_name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: String(formData.get("phone") || "").trim() || null,
    status: "concept",
    current_level: "Explorer",
    total_visits: reservationNumber || roomNumber ? 1 : 0,
    activation_token: makeToken(),
    public_token: makeToken(),
    control_code: makeControlCode(),
  };
  const { data, error } = await supabase.from("guests").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  if (reservationNumber || roomNumber) {
    await supabase.from("visits").insert({
      guest_id: data.id,
      reservation_number: reservationNumber || null,
      room_number: roomNumber || null,
      added_by_employee_id: employee.id,
    });
    await logAction(employee.id, data.id, "verblijf toegevoegd", { reservation_number: reservationNumber || null, room_number: roomNumber || null });
  }
  await logAction(employee.id, data.id, "gast aangemaakt", { guest_number: guestNumber });
  redirect(`/guests/${data.id}?created=1`);
}

export async function activateGuest(token: string, formData: FormData) {
  const privacy = formData.get("privacy") === "on";
  const participate = formData.get("participate") === "on";
  if (!privacy || !participate) redirect(`/activate/${token}?error=${encodeURIComponent("Akkoord is verplicht")}`);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guests")
    .update({ status: "active", activated_at: new Date().toISOString(), activation_token: null })
    .eq("activation_token", token)
    .eq("status", "concept")
    .select("id,public_token")
    .single();
  if (error || !data) redirect(`/activate/${token}?error=${encodeURIComponent("Activatielink is ongeldig")}`);
  await logAction(null, data.id, "gast geactiveerd", {});
  redirect(`/guest/${data.public_token}`);
}

export async function resendInvitation(guestId: string) {
  const employee = await requireEmployee();
  const token = makeToken();
  const supabase = createAdminClient();
  const { error } = await supabase.from("guests").update({ activation_token: token }).eq("id", guestId).eq("status", "concept");
  if (error) throw new Error(error.message);
  await logAction(employee.id, guestId, "uitnodiging opnieuw verstuurd", { mode: "copy-link" });
  revalidatePath(`/guests/${guestId}`);
}

export async function addVisit(guestId: string, formData: FormData) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data: guest } = await supabase.from("guests").select("*").eq("id", guestId).single();
  if (!guest || guest.status !== "active") throw new Error("Alleen actieve gasten kunnen bezoeken krijgen.");
  await supabase.from("visits").insert({
    guest_id: guestId,
    reservation_number: String(formData.get("reservation_number") || "").trim() || null,
    room_number: String(formData.get("room_number") || "").trim() || null,
    visit_date: String(formData.get("visit_date") || new Date().toISOString().slice(0, 10)),
    added_by_employee_id: employee.id,
  });
  const newTotal = (guest.total_visits || 0) + 1;
  const { data: levels } = await supabase.from("levels").select("*").order("min_visits");
  const level = levelForVisits((levels || []) as Level[], newTotal);
  await supabase.from("guests").update({ total_visits: newTotal, current_level: level?.name || "Explorer" }).eq("id", guestId);
  const { data: reward } = await supabase.from("rewards").select("*").eq("active", true).eq("visit_count", newTotal).maybeSingle();
  await logAction(employee.id, guestId, "verblijf toegevoegd", { total_visits: newTotal, reward: reward?.reward_name || null });
  redirect(`/guests/${guestId}${reward ? `?reward=${encodeURIComponent(reward.id)}` : ""}`);
}

export async function issueReward(guestId: string, rewardId: string, formData?: FormData) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  await supabase.from("issued_rewards").insert({
    guest_id: guestId,
    reward_id: rewardId,
    issued_by_employee_id: employee.id,
    notes: String(formData?.get("notes") || "").trim() || null,
  });
  await logAction(employee.id, guestId, "beloning uitgegeven", { reward_id: rewardId });
  revalidatePath(`/guests/${guestId}`);
}

export async function updateGuest(guestId: string, formData: FormData) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  await supabase
    .from("guests")
    .update({
      first_name: String(formData.get("first_name") || "").trim(),
      last_name: String(formData.get("last_name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phone: String(formData.get("phone") || "").trim() || null,
    })
    .eq("id", guestId);
  await logAction(employee.id, guestId, "gegevens gewijzigd", {});
  revalidatePath(`/guests/${guestId}`);
}

export async function endParticipation(guestId: string) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  await supabase.from("guests").update({ status: "ended" }).eq("id", guestId);
  await logAction(employee.id, guestId, "deelname beëindigd", {});
  revalidatePath(`/guests/${guestId}`);
}

export async function deleteGuest(guestId: string) {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  await supabase
    .from("guests")
    .update({ status: "deleted", deleted_at: new Date().toISOString(), public_token: null, activation_token: null, control_code: null })
    .eq("id", guestId);
  await logAction(employee.id, guestId, "gast verwijderd", {});
  redirect("/trash");
}

export async function restoreGuest(guestId: string) {
  const employee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  await supabase.from("guests").update({ status: "ended", deleted_at: null, public_token: makeToken(), control_code: makeControlCode() }).eq("id", guestId);
  await logAction(employee.id, guestId, "gast hersteld", {});
  revalidatePath("/trash");
}

export async function anonymizeGuest(guestId: string) {
  const employee = await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  await supabase
    .from("guests")
    .update({
      first_name: "Verwijderde",
      last_name: "gast",
      email: null,
      phone: null,
      status: "deleted",
      activation_token: null,
      public_token: null,
      control_code: null,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", guestId);
  await logAction(employee.id, guestId, "gast definitief verwijderd", { anonymized: true });
  revalidatePath("/trash");
}

export async function updateReward(rewardId: string, formData: FormData) {
  await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  await supabase
    .from("rewards")
    .update({
      reward_name: String(formData.get("reward_name") || ""),
      reward_description: String(formData.get("reward_description") || ""),
      active: formData.get("active") === "on",
    })
    .eq("id", rewardId);
  revalidatePath("/rewards");
}

export async function updateSetting(key: string, formData: FormData) {
  await requireEmployee(["manager", "admin"]);
  const supabase = createAdminClient();
  await supabase.from("settings").upsert({ key, value: String(formData.get("value") || "") }, { onConflict: "key" });
  revalidatePath("/settings");
}

export async function qrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: "#003f3d", light: "#ffffff" } });
}

export async function getReferenceData() {
  const supabase = createAdminClient();
  const [{ data: levels }, { data: rewards }] = await Promise.all([
    supabase.from("levels").select("*").order("min_visits"),
    supabase.from("rewards").select("*").eq("active", true).order("visit_count"),
  ]);
  return { levels: (levels || []) as Level[], rewards: (rewards || []) as Reward[] };
}
