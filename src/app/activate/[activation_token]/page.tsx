import { activateGuest } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";

export default async function ActivatePage({ params, searchParams }: { params: Promise<{ activation_token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { activation_token } = await params;
  const query = await searchParams;
  const supabase = createAdminClient();
  const { data: guest } = await supabase.from("guests").select("*").eq("activation_token", activation_token).eq("status", "concept").maybeSingle();
  return (
    <main className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-3xl py-8">
        <Brand />
        <section className="card mt-8 p-6 md:p-8">
          <h1 className="text-3xl font-black text-landal-900">Activeer uw Members Club</h1>
          {!guest ? (
            <p className="mt-4 text-slate-700">Deze activatielink is ongeldig of al gebruikt.</p>
          ) : (
            <>
              <p className="mt-4 text-slate-700">
                Welkom {guest.first_name}. Deelname aan Parkbad Hotel Arcen Members is vrijwillig. We bewaren alleen gegevens die nodig zijn om bezoeken, levels en beloningen te tonen.
              </p>
              {query.error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{query.error}</div>}
              <div className="mt-6 rounded-lg bg-landal-50 p-5 text-sm text-landal-900">
                <h2 className="font-black">Privacy en voorwaarden</h2>
                <p className="mt-2">Uw gegevens worden gebruikt voor Parkbad Hotel Arcen Members. U kunt deelname beëindigen of verwijdering aanvragen bij de receptie.</p>
              </div>
              <form action={activateGuest.bind(null, activation_token)} className="mt-6 space-y-4">
                <label className="flex gap-3 rounded-lg border border-landal-100 bg-white p-4"><input className="mt-1 h-4 w-4" name="privacy" type="checkbox" /> Ik ga akkoord met de privacyverklaring.</label>
                <label className="flex gap-3 rounded-lg border border-landal-100 bg-white p-4"><input className="mt-1 h-4 w-4" name="participate" type="checkbox" /> Ik wil deelnemen aan Parkbad Hotel Arcen Members.</label>
                <button className="btn-primary">Account activeren</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
