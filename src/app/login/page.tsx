import { signIn } from "@/lib/actions";
import { Brand } from "@/components/brand";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-4">
      <div className="card w-full max-w-md p-8">
        <Brand />
        <h1 className="mt-8 text-3xl font-black text-landal-900">Medewerkerslogin</h1>
        <p className="mt-2 text-sm text-slate-600">Log in om gasten, bezoeken en beloningen te beheren.</p>
        {params.error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{params.error}</div>}
        <form action={signIn} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email">E-mailadres</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password">Wachtwoord</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full">Inloggen</button>
        </form>
      </div>
    </main>
  );
}
