import Link from "next/link";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Shell, StatusLabel } from "@/components/ui";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const employee = await requireEmployee();
  const { q = "" } = await searchParams;
  const supabase = createAdminClient();
  let query = supabase.from("guests").select("*").neq("status", "deleted").order("created_at", { ascending: false }).limit(50);
  if (q) {
    const { data: matchingVisits } = await supabase
      .from("visits")
      .select("guest_id")
      .or(`reservation_number.ilike.%${q}%,room_number.ilike.%${q}%`)
      .limit(50);
    const ids = Array.from(new Set((matchingVisits || []).map((visit) => visit.guest_id)));
    const visitFilter = ids.length ? `,id.in.(${ids.join(",")})` : "";
    query = query.or(`guest_number.ilike.%${q}%,control_code.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%${visitFilter}`);
  }
  const { data } = await query;
  return (
    <Shell employee={employee}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-landal-900">Gasten</h1>
          <p className="text-slate-600">Zoek op gastnummer, control code, naam, e-mail, reservering of kamer.</p>
        </div>
        <Link href="/guests/new" className="btn-primary">Nieuwe gast</Link>
      </div>
      <form className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Zoek gast..." />
        <button className="btn-primary">Zoeken</button>
      </form>
      <div className="card mt-6 overflow-hidden">
        {(data || []).map((guest) => (
          <Link key={guest.id} href={`/guests/${guest.id}`} className="grid gap-3 border-b border-landal-100 p-5 hover:bg-landal-50 md:grid-cols-[1fr_auto_auto]">
            <div>
              <div className="font-black text-landal-900">{guest.first_name} {guest.last_name}</div>
              <div className="text-sm text-slate-600">{guest.guest_number} · {guest.email} · code {guest.control_code || "-"}</div>
            </div>
            <StatusLabel status={guest.status} />
            <div className="text-xl font-black text-landal-800">{guest.total_visits} bezoeken</div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
