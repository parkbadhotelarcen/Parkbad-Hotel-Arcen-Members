import Link from "next/link";
import { headers } from "next/headers";
import { CreditCard, Smartphone } from "lucide-react";
import { Brand } from "@/components/brand";
import { QrCard } from "@/components/qr-card";
import { createAdminClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/loyalty";
import { getPublicBaseUrl, guestUrl } from "@/lib/urls";

export default async function WalletPassPage({ params }: { params: Promise<{ public_token: string }> }) {
  const { public_token } = await params;
  const supabase = createAdminClient();
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("public_token", public_token)
    .eq("status", "active")
    .maybeSingle();

  if (!guest) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream p-4">
        <div className="card max-w-md p-6">
          Deze ledenkaart is niet actief. Neem contact op met de receptie.
        </div>
      </main>
    );
  }

  const baseUrl = getPublicBaseUrl(await headers());
  const progressUrl = guestUrl(guest.public_token, baseUrl);

  return (
    <main className="min-h-screen bg-cream px-4 py-6">
      <div className="mx-auto max-w-xl space-y-5">
        <section className="card overflow-hidden">
          <div className="bg-landal-800 p-6 text-white">
            <Brand compact />
            <p className="mt-8 text-sm font-bold uppercase tracking-wide text-gold">Parkbad Hotel Arcen Members</p>
            <h1 className="mt-2 text-3xl font-black">Digitale ledenkaart</h1>
            <p className="mt-1 text-white/80">{fullName(guest.first_name, guest.last_name)}</p>
          </div>
          <div className="p-5">
            <QrCard url={progressUrl} label="Scan of tik voor uw voortgang" guestNumber={guest.guest_number} showUrl={false} />
            <Link href={progressUrl} className="btn-primary mt-5 w-full">
              Voortgang bekijken
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-xl font-black text-landal-900">Toevoegen aan Wallet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Deze pagina is klaar voor Apple Wallet en Google Wallet. Voor het echte toevoegen zijn nog officiele
            Wallet-gegevens nodig van Apple en Google.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="btn-secondary w-full cursor-not-allowed opacity-60" disabled>
              <CreditCard className="h-4 w-4" /> Apple Wallet volgt
            </button>
            <button className="btn-secondary w-full cursor-not-allowed opacity-60" disabled>
              <Smartphone className="h-4 w-4" /> Google Wallet volgt
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Tot die koppeling actief is, kan de gast deze pagina opslaan als favoriet of de QR-code vanuit de mail openen.
          </p>
        </section>
      </div>
    </main>
  );
}
