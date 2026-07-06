import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { Progress } from "@/components/ui";
import { getEmployee } from "@/lib/auth";
import { getReferenceData } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { fullName, toDateLabel } from "@/lib/loyalty";
import type { Badge, Guest, Visit } from "@/lib/types";

export default async function PublicGuestPage({ params }: { params: Promise<{ public_token: string }> }) {
  const { public_token } = await params;
  const supabase = createAdminClient();
  const { data: guest } = await supabase.from("guests").select("*").eq("public_token", public_token).eq("status", "active").maybeSingle();
  const employee = await getEmployee();
  if (employee && guest) redirect(`/guests/${guest.id}`);
  if (!guest) {
    return <main className="grid min-h-screen place-items-center bg-cream p-4"><div className="card max-w-md p-6">Deze ledenpagina is niet actief.</div></main>;
  }
  const [{ data: visits }, { data: badges }, refs] = await Promise.all([
    supabase.from("visits").select("*").eq("guest_id", guest.id).order("visit_date", { ascending: false }).limit(1),
    supabase.from("guest_badges").select("badges(*)").eq("guest_id", guest.id),
    getReferenceData(),
  ]);
  const awarded = (badges || []).map((item) => item.badges).filter(Boolean) as unknown as Badge[];
  const latest = ((visits || [])[0] || null) as Visit | null;
  return (
    <main className="min-h-screen bg-cream pb-20">
      <header className="bg-white px-5 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Brand compact />
          <div className="text-right text-xs font-bold uppercase tracking-[0.2em] text-landal-700">Members Club</div>
        </div>
      </header>
      <section className="bg-landal-800 px-5 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="font-serif text-3xl italic">Welkom terug,</p>
          <h1 className="text-5xl font-black">{guest.first_name}!</h1>
        </div>
      </section>
      <div className="mx-auto -mt-6 max-w-4xl space-y-5 px-5">
        <section className="card p-6">
          <Progress guest={guest as Guest} levels={refs.levels} rewards={refs.rewards} />
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-landal-100 pt-5">
            <div><div className="text-3xl font-black text-landal-800">{guest.total_visits}</div><div className="text-sm text-slate-600">Totaal bezoeken</div></div>
            <div><div className="text-lg font-black text-landal-800">{toDateLabel(guest.activated_at)}</div><div className="text-sm text-slate-600">Lid sinds</div></div>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black text-landal-900">Uw gegevens</h2>
          <p className="mt-2 text-slate-700">{fullName(guest.first_name, guest.last_name)} · {guest.guest_number}</p>
          <p className="mt-1 text-sm text-slate-600">Laatste verblijf: {latest ? toDateLabel(latest.visit_date) : "nog niet geregistreerd"}</p>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-black text-landal-900">Uw badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(awarded.length ? awarded : [{ id: "empty", name: "Start", description: "Welkom bij de club", icon: "★" } as Badge]).map((badge) => (
              <div key={badge.id} className="rounded-lg border border-landal-100 p-4 text-center">
                <div className="text-3xl">{badge.icon}</div>
                <div className="mt-2 text-sm font-bold">{badge.name}</div>
              </div>
            ))}
          </div>
        </section>
        <Link href="/privacy" className="block text-sm font-semibold text-landal-700">Privacyvoorwaarden bekijken</Link>
      </div>
    </main>
  );
}
