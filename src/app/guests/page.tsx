import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { nextReward } from "@/lib/loyalty";
import { Shell, StatusLabel } from "@/components/ui";
import { NewGuestModal, ReceptionSearch } from "@/components/reception-actions";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const employee = await requireEmployee();
  const { q = "" } = await searchParams;
  const supabase = createAdminClient();
  const { data: rewards } = await supabase.from("rewards").select("*").eq("active", true).order("visit_count");
  let query = supabase.from("guests").select("*").neq("status", "deleted").order("created_at", { ascending: false }).limit(60);

  if (q) {
    const { data: matchingVisits } = await supabase
      .from("visits")
      .select("guest_id")
      .or(`reservation_number.ilike.%${q}%,room_number.ilike.%${q}%`)
      .limit(60);
    const ids = Array.from(new Set((matchingVisits || []).map((visit) => visit.guest_id)));
    const visitFilter = ids.length ? `,id.in.(${ids.join(",")})` : "";
    query = query.or(`guest_number.ilike.%${q}%,control_code.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%${visitFilter}`);
  }

  const { data } = await query;

  return (
    <Shell employee={employee}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-landal-900">Gasten</h1>
          <p className="mt-1 text-slate-600">Snel zoeken, profiel openen en verblijf registreren.</p>
        </div>
        <NewGuestModal label="Nieuwe gast" />
      </div>

      <div className="mt-6">
        <ReceptionSearch defaultValue={q} />
      </div>

      <div className="mt-6 grid gap-4">
        {(data || []).map((guest) => {
          const reward = nextReward(rewards || [], guest.total_visits);
          return (
            <article key={guest.id} className="card p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-landal-900">{guest.first_name} {guest.last_name}</h2>
                    <StatusLabel status={guest.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{guest.guest_number} - code {guest.control_code || "-"} - {guest.email || "geen e-mail"}</p>
                </div>
                <Link href={`/guests/${guest.id}`} className="btn-primary shrink-0">
                  Open profiel <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-mist p-3">
                  <div className="text-xs font-bold uppercase text-landal-700">Level</div>
                  <div className="font-black text-landal-900">{guest.current_level}</div>
                </div>
                <div className="rounded-lg bg-mist p-3">
                  <div className="text-xs font-bold uppercase text-landal-700">Bezoeken</div>
                  <div className="font-black text-landal-900">{guest.total_visits}</div>
                </div>
                <div className="rounded-lg bg-mist p-3 sm:col-span-2">
                  <div className="text-xs font-bold uppercase text-landal-700">Volgende beloning</div>
                  <div className="font-black text-landal-900">{reward ? `${reward.reward_name} bij ${reward.visit_count} bezoeken` : "Alle beloningen behaald"}</div>
                </div>
              </div>
            </article>
          );
        })}
        {!data?.length && (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-black text-landal-900">Geen gasten gevonden</h2>
            <p className="mt-2 text-slate-600">Probeer naam, gastnummer, kamer, reservering of code.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
