import Link from "next/link";
import { Brand } from "@/components/brand";
import { findMemberProgress } from "@/lib/member-actions";

export default async function MemberLookupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-cream p-4">
      <div className="card w-full max-w-lg p-8">
        <Brand />
        <h1 className="mt-8 text-3xl font-black text-landal-900">Mijn voortgang bekijken</h1>
        <p className="mt-2 text-sm text-slate-600">
          Vul uw gastnummer en controlecode in. Deze staan op uw ledenkaart of kunnen door de receptie opnieuw worden gegeven.
        </p>

        {params.error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {params.error}
          </div>
        )}

        <form action={findMemberProgress} className="mt-6 space-y-4">
          <div>
            <label htmlFor="guest_number">Gastnummer</label>
            <input id="guest_number" name="guest_number" required placeholder="PHA-000128" autoCapitalize="characters" />
          </div>
          <div>
            <label htmlFor="control_code">Controlecode</label>
            <input id="control_code" name="control_code" required placeholder="7K4P" autoCapitalize="characters" maxLength={8} />
          </div>
          <button className="btn-primary w-full">Voortgang openen</button>
        </form>

        <Link href="/privacy" className="mt-4 block text-center text-sm font-semibold text-landal-700 hover:text-landal-900">
          Privacy en voorwaarden
        </Link>
      </div>
    </main>
  );
}
