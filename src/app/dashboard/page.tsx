import Link from "next/link";
import { Gift, MailWarning, Users } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell, StatusLabel } from "@/components/ui";
import { NewGuestModal, ReceptionSearch } from "@/components/reception-actions";
import { nextReward, toDateLabel } from "@/lib/loyalty";

export default async function DashboardPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const [{ count: visitsToday }, { data: concepts }, { data: guests }, { data: visits }, { data: rewards }] = await Promise.all([
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("visit_date", today),
    supabase.from("guests").select("id,first_name,last_name,guest_number,status,created_at").eq("status", "concept").order("created_at", { ascending: false }).limit(5),
    supabase.from("guests").select("id,first_name,last_name,guest_number,total_visits,current_level,status").eq("status", "active").order("total_visits", { ascending: false }).limit(8),
    supabase.from("visits").select("id,visit_date,room_number,reservation_number,guests(id,first_name,last_name,guest_number)").order("created_at", { ascending: false }).limit(5),
    supabase.from("rewards").select("*").eq("active", true).order("visit_count"),
  ]);

  const readyRewards = (guests || []).filter((guest) => rewards?.some((reward) => reward.visit_count === guest.total_visits)).slice(0, 5);

  return (
    <Shell employee={employee}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-landal-900">Vandaag</h1>
          <p className="mt-1 text-slate-600">Snelle acties voor de receptie</p>
        </div>
        <NewGuestModal label="Nieuwe gast" />
      </div>

      <div className="mt-6">
        <ReceptionSearch autoFocus />
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/guests" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
          <Users className="h-7 w-7 text-landal-700" />
          <div className="mt-4 text-3xl font-black text-landal-900">{visitsToday || 0}</div>
          <div className="text-sm font-semibold text-slate-600">Vaste gasten vandaag</div>
        </Link>
        <Link href="/rewards" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
          <Gift className="h-7 w-7 text-landal-700" />
          <div className="mt-4 text-3xl font-black text-landal-900">{readyRewards.length}</div>
          <div className="text-sm font-semibold text-slate-600">Beloningen klaar</div>
        </Link>
        <Link href="/activations" className="card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
          <MailWarning className="h-7 w-7 text-landal-700" />
          <div className="mt-4 text-3xl font-black text-landal-900">{concepts?.length || 0}</div>
          <div className="text-sm font-semibold text-slate-600">Activaties open</div>
        </Link>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-xl font-black text-landal-900">Nog activeren</h2>
          <div className="mt-4 space-y-3">
            {(concepts || []).map((guest) => (
              <Link href={`/guests/${guest.id}`} key={guest.id} className="block rounded-lg border border-landal-100 p-4 hover:bg-landal-50">
                <div className="font-bold text-landal-900">{guest.first_name} {guest.last_name}</div>
                <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                  <span>{guest.guest_number}</span>
                  <StatusLabel status={guest.status} />
                </div>
              </Link>
            ))}
            {!concepts?.length && <p className="text-sm text-slate-500">Geen open activaties.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-black text-landal-900">Beloningen klaar</h2>
          <div className="mt-4 space-y-3">
            {readyRewards.map((guest) => {
              const reward = rewards ? rewards.find((item) => item.visit_count === guest.total_visits) : null;
              return (
                <Link href={`/guests/${guest.id}`} key={guest.id} className="block rounded-lg border border-landal-100 p-4 hover:bg-landal-50">
                  <div className="font-bold text-landal-900">{guest.first_name} {guest.last_name}</div>
                  <div className="text-sm text-slate-600">{reward?.reward_name || nextReward(rewards || [], guest.total_visits)?.reward_name}</div>
                </Link>
              );
            })}
            {!readyRewards.length && <p className="text-sm text-slate-500">Geen beloningen die nu klaarstaan.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-black text-landal-900">Laatste bezoeken</h2>
          <div className="mt-4 space-y-3">
            {(visits || []).map((visit) => (
              <Link href={`/guests/${(Array.isArray(visit.guests) ? visit.guests[0] : visit.guests)?.id || "#"}`} key={visit.id} className="block rounded-lg border border-landal-100 p-4 hover:bg-landal-50">
                <div className="font-bold text-landal-900">
                  {(Array.isArray(visit.guests) ? visit.guests[0] : visit.guests)?.first_name} {(Array.isArray(visit.guests) ? visit.guests[0] : visit.guests)?.last_name}
                </div>
                <div className="text-sm text-slate-600">{toDateLabel(visit.visit_date)} - kamer {visit.room_number || "-"}</div>
              </Link>
            ))}
            {!visits?.length && <p className="text-sm text-slate-500">Nog geen bezoeken geregistreerd.</p>}
          </div>
        </div>
      </section>
    </Shell>
  );
}
