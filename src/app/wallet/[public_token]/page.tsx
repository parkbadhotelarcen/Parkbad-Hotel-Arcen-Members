import Link from "next/link";
import { headers } from "next/headers";
import { CreditCard, QrCode, ScanLine } from "lucide-react";
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
    <main className="wellness-surface min-h-screen px-4 pb-24 pt-6 sm:py-10">
      <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="order-2 space-y-6 lg:order-1">
          <div className="card p-6 sm:p-8">
            <Brand />
            <p className="mt-10 text-xs font-black uppercase tracking-wide text-landal-600">Landal Vaste Gasten Club</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-landal-900 sm:text-5xl">Uw digitale ledenkaart</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Open deze kaart bij aankomst. De receptie scant de QR-code, registreert uw verblijf en uw voortgang wordt automatisch bijgewerkt.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-landal-100 bg-mist p-4">
                <QrCode className="h-5 w-5 text-landal-600" />
                <div className="mt-3 text-sm font-black text-landal-900">Kaart openen</div>
                <div className="mt-1 text-xs text-slate-600">Vanuit Wallet of deze mail.</div>
              </div>
              <div className="rounded-lg border border-landal-100 bg-mist p-4">
                <ScanLine className="h-5 w-5 text-landal-600" />
                <div className="mt-3 text-sm font-black text-landal-900">QR scannen</div>
                <div className="mt-1 text-xs text-slate-600">Alleen door de receptie.</div>
              </div>
              <div className="rounded-lg border border-landal-100 bg-mist p-4">
                <CreditCard className="h-5 w-5 text-landal-600" />
                <div className="mt-3 text-sm font-black text-landal-900">Voortgang bijwerken</div>
                <div className="mt-1 text-xs text-slate-600">Automatisch na registratie.</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="order-1 lg:sticky lg:top-8 lg:order-2">
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
