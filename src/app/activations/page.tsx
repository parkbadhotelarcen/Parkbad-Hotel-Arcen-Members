import Link from "next/link";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { activationUrl } from "@/lib/urls";
import { Shell } from "@/components/ui";
import { toDateLabel } from "@/lib/loyalty";

export default async function ActivationsPage() {
  const employee = await requireEmployee();
  const supabase = createAdminClient();
  const { data } = await supabase.from("guests").select("*").eq("status", "concept").order("created_at", { ascending: false });
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Activaties</h1>
      <p className="mt-2 text-slate-600">Conceptprofielen die nog toestemming van de gast nodig hebben.</p>
      <div className="card mt-6 overflow-hidden">
        {(data || []).map((guest) => (
          <Link key={guest.id} href={`/guests/${guest.id}`} className="block border-b border-landal-100 p-5 hover:bg-landal-50">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="font-black text-landal-900">{guest.first_name} {guest.last_name}</div>
                <div className="text-sm text-slate-600">{guest.email} · aangemaakt {toDateLabel(guest.created_at)}</div>
              </div>
              <div className="max-w-xl break-all rounded-lg bg-landal-50 p-3 text-xs text-landal-800">{activationUrl(guest.activation_token)}</div>
            </div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
