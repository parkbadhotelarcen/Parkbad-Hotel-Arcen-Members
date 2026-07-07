import Link from "next/link";
import { headers } from "next/headers";
import { Brand } from "@/components/brand";
import { QrCard } from "@/components/qr-card";
import { Progress } from "@/components/ui";
import { getReferenceData } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/loyalty";
import { getPublicBaseUrl, guestUrl } from "@/lib/urls";
import type { Guest } from "@/lib/types";

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
      <main className="wellness-surface grid min-h-screen place-items-center p-4">
        <div className="card max-w-md p-6">
          Deze ledenkaart is niet actief. Neem contact op met de receptie.
        </div>
      </main>
    );
  }

  const baseUrl = getPublicBaseUrl(await headers());
  const progressUrl = guestUrl(guest.public_token, baseUrl);
  const refs = await getReferenceData();

  return (
    <main className="wellness-surface min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-md">
        <aside>
          <section className="overflow-hidden rounded-lg border border-landal-100 bg-white shadow-wallet">
            <div className="bg-landal-800 p-6 text-white">
              <Brand compact />
              <p className="mt-8 text-xs font-black uppercase tracking-wide text-gold">Digitale ledenkaart</p>
              <h2 className="mt-2 text-3xl font-black">{fullName(guest.first_name, guest.last_name)}</h2>
              <p className="mt-1 text-sm text-white/75">Parkbad Hotel Arcen Members</p>
            </div>
            <div className="p-5">
              <Link href={progressUrl} aria-label="Voortgang bekijken">
                <QrCard url={progressUrl} label="Tik voor voortgang" guestNumber={guest.guest_number} showUrl={false} />
              </Link>
              <div className="mt-5 rounded-lg border border-landal-100 bg-mist p-4">
                <Progress guest={guest as Guest} levels={refs.levels} rewards={refs.rewards} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-landal-100 bg-white p-3 text-center">
                  <div className="text-2xl font-black text-landal-800">{guest.total_visits}</div>
                  <div className="text-xs font-semibold text-slate-500">Bezoeken</div>
                </div>
                <div className="rounded-lg border border-landal-100 bg-white p-3 text-center">
                  <div className="text-lg font-black text-landal-800">{guest.current_level}</div>
                  <div className="text-xs font-semibold text-slate-500">Level</div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Tik op de QR-code om uw voortgang te openen. Toon dezelfde QR-code bij de receptie.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
