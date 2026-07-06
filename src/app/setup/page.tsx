import Link from "next/link";
import { Brand } from "@/components/brand";
import { createFirstAdmin } from "@/lib/setup-actions";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getSetupState() {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase.from("employees").select("id", { count: "exact", head: true });
    if (error) return { available: false, error: error.message };
    return { available: (count || 0) === 0, error: null };
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : "Setup kan niet worden geladen." };
  }
}

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const state = await getSetupState();
  const needsSecret = Boolean(process.env.SETUP_SECRET);

  return (
    <main className="grid min-h-screen place-items-center bg-cream p-4">
      <div className="card w-full max-w-xl p-8">
        <Brand />
        <h1 className="mt-8 text-3xl font-black text-landal-900">Eerste admin aanmaken</h1>
        <p className="mt-2 text-sm text-slate-600">
          Gebruik deze pagina alleen voor de eerste installatie. Zodra er een medewerker bestaat, wordt setup automatisch gesloten.
        </p>

        {(params.error || state.error) && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {params.error || state.error}
          </div>
        )}

        {!state.available ? (
          <div className="mt-6 rounded-lg bg-landal-50 p-5">
            <p className="font-bold text-landal-900">Setup is niet beschikbaar.</p>
            <p className="mt-2 text-sm text-slate-600">
              Er bestaat al een medewerker, of Supabase is nog niet ingesteld. Log in of controleer de environment variables en database setup.
            </p>
            <Link href="/login" className="btn-primary mt-4">Naar login</Link>
          </div>
        ) : (
          <form action={createFirstAdmin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name">Naam</label>
              <input id="name" name="name" required placeholder="Naam admin" />
            </div>
            <div>
              <label htmlFor="email">E-mailadres</label>
              <input id="email" name="email" type="email" required placeholder="admin@example.com" />
            </div>
            <div>
              <label htmlFor="password">Wachtwoord</label>
              <input id="password" name="password" type="password" required minLength={8} />
            </div>
            {needsSecret && (
              <div>
                <label htmlFor="setup_secret">Setup-code</label>
                <input id="setup_secret" name="setup_secret" type="password" required />
              </div>
            )}
            <button className="btn-primary w-full">Eerste admin aanmaken</button>
          </form>
        )}
      </div>
    </main>
  );
}
