import Link from "next/link";
import { headers } from "next/headers";
import { ChevronDown, Gift, Plus, Send, Trash2 } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { addVisit, deleteGuest, endParticipation, getReferenceData, issueReward, resendInvitation, updateGuest } from "@/lib/actions";
import { activationUrl, getPublicBaseUrl, guestUrl, walletUrl } from "@/lib/urls";
import { fullName, nextReward, toDateLabel } from "@/lib/loyalty";
import { QrCard } from "@/components/qr-card";
import { Progress, Shell, StatusLabel } from "@/components/ui";
import type { Guest, Visit } from "@/lib/types";

export default async function GuestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; email?: string; reward?: string }>;
}) {
  const employee = await requireEmployee();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createAdminClient();
  const [{ data: guest }, { data: visits }, { data: issued }, refs] = await Promise.all([
    supabase.from("guests").select("*").eq("id", id).single(),
    supabase.from("visits").select("*").eq("guest_id", id).order("visit_date", { ascending: false }).limit(20),
    supabase.from("issued_rewards").select("*,rewards(id,reward_name,visit_count)").eq("guest_id", id).order("issued_at", { ascending: false }),
    getReferenceData(),
  ]);

  if (!guest) return <Shell employee={employee}><div className="card p-6">Gast niet gevonden.</div></Shell>;

  const baseUrl = getPublicBaseUrl(await headers());
  const guestPage = guest.public_token ? guestUrl(guest.public_token, baseUrl) : "";
  const walletPage = guest.public_token ? walletUrl(guest.public_token, baseUrl) : "";
  const invite = guest.activation_token ? activationUrl(guest.activation_token, baseUrl) : "";
  const issuedRewardIds = new Set((issued || []).map((item) => item.reward_id));
  const readyReward = refs.rewards.find((reward) => reward.visit_count === guest.total_visits && !issuedRewardIds.has(reward.id));
  const activeReward = query.reward ? refs.rewards.find((reward) => reward.id === query.reward) : readyReward;
  const next = nextReward(refs.rewards, guest.total_visits);

  return (
    <Shell employee={employee}>
      <div className="space-y-5">
        {query.created && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            {query.email === "sent" ? "Gast toegevoegd en activatiemail verzonden." : "Gast toegevoegd en activatielink aangemaakt."}
          </div>
        )}
        {query.email === "resent" && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Activatiemail opnieuw verzonden.
          </div>
        )}
        {query.email === "failed" && (
          <div className="rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            De gast is opgeslagen, maar de activatiemail kon niet worden verzonden. Controleer RESEND_API_KEY en EMAIL_FROM in Vercel.
          </div>
        )}

        {activeReward && (
          <div className="rounded-lg bg-gold/15 p-5 text-landal-900 shadow-card">
            <div className="flex items-center gap-3 text-xl font-black">
              <Gift className="h-6 w-6" />
              Beloning klaar
            </div>
            <p className="mt-1">Deze gast ontvangt: {activeReward.reward_name}.</p>
            <form action={issueReward.bind(null, guest.id, activeReward.id)} className="mt-4">
              <button className="btn-primary">Beloning uitgegeven</button>
            </form>
          </div>
        )}

        <section className="card p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-landal-900">{fullName(guest.first_name, guest.last_name)}</h1>
                <StatusLabel status={guest.status} />
              </div>
              <p className="mt-2 text-slate-600">{guest.guest_number} - code {guest.control_code || "-"} - {guest.email || "geen e-mail"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-landal-700 px-5 py-4 text-center text-white">
                <div className="text-xs font-bold uppercase">Bezoeken</div>
                <div className="text-3xl font-black">{guest.total_visits}</div>
              </div>
              <div className="rounded-lg bg-mist px-5 py-4 text-center">
                <div className="text-xs font-bold uppercase text-landal-700">Level</div>
                <div className="text-lg font-black text-landal-900">{guest.current_level}</div>
              </div>
              <div className="rounded-lg bg-mist px-5 py-4 text-center">
                <div className="text-xs font-bold uppercase text-landal-700">Volgende</div>
                <div className="text-sm font-black text-landal-900">{next ? next.reward_name : "Klaar"}</div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Progress guest={guest as Guest} levels={refs.levels} rewards={refs.rewards} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-black text-landal-900">Verblijf registreren</h2>
          <form action={addVisit.bind(null, guest.id)} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <label>Datum</label>
              <input name="visit_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label>Reservering</label>
              <input name="reservation_number" />
            </div>
            <div>
              <label>Kamer</label>
              <input name="room_number" />
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full whitespace-nowrap text-base" disabled={guest.status !== "active"}>
                <Plus className="h-5 w-5" /> Verblijf registreren
              </button>
            </div>
          </form>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="card overflow-hidden">
              <div className="border-b border-landal-100 p-5">
                <h2 className="text-xl font-black text-landal-900">Bezoekgeschiedenis</h2>
              </div>
              {(visits || []).map((visit: Visit) => (
                <div key={visit.id} className="grid gap-2 border-b border-landal-100 p-5 md:grid-cols-3">
                  <div className="font-bold">{toDateLabel(visit.visit_date)}</div>
                  <div className="text-sm text-slate-600">Reservering {visit.reservation_number || "-"}</div>
                  <div className="text-sm text-slate-600">Kamer {visit.room_number || "-"}</div>
                </div>
              ))}
              {!visits?.length && <p className="p-5 text-sm text-slate-500">Nog geen bezoeken geregistreerd.</p>}
            </section>

            <section className="card overflow-hidden">
              <div className="border-b border-landal-100 p-5">
                <h2 className="text-xl font-black text-landal-900">Beloningen</h2>
              </div>
              {(issued || []).map((item) => (
                <div key={item.id} className="border-b border-landal-100 p-5">
                  <div className="font-bold">{item.rewards?.reward_name}</div>
                  <div className="text-sm text-slate-600">{toDateLabel(item.issued_at)}</div>
                </div>
              ))}
              {!issued?.length && <p className="p-5 text-sm text-slate-500">Nog geen beloningen uitgegeven.</p>}
            </section>

            <section className="card p-5">
              <h2 className="text-xl font-black text-landal-900">Notities</h2>
              <p className="mt-2 text-sm text-slate-600">Notities kunnen in een volgende versie worden gekoppeld aan het gastprofiel.</p>
            </section>
          </div>

          <aside className="space-y-5">
            {guest.public_token && <QrCard url={guestPage} label="QR-code en gastnummer" guestNumber={guest.guest_number} />}
            {walletPage && (
              <div className="card p-5">
                <h2 className="text-lg font-black text-landal-900">Wallet-link voor mail</h2>
                <p className="mt-3 break-all rounded-lg bg-landal-50 p-3 text-xs text-landal-800">{walletPage}</p>
              </div>
            )}
            {invite && (
              <div className="card p-5">
                <h2 className="text-lg font-black text-landal-900">Activatielink</h2>
                <p className="mt-3 break-all rounded-lg bg-landal-50 p-3 text-xs text-landal-800">{invite}</p>
                <form action={resendInvitation.bind(null, guest.id)} className="mt-3">
                  <button className="btn-secondary w-full">
                    <Send className="h-4 w-4" /> Activatiemail opnieuw versturen
                  </button>
                </form>
              </div>
            )}

            <details className="card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-black text-landal-900">
                Beheer <ChevronDown className="h-5 w-5" />
              </summary>
              <div className="mt-5 space-y-5">
                <form action={updateGuest.bind(null, guest.id)} className="grid gap-4">
                  <div>
                    <label>Voornaam</label>
                    <input name="first_name" defaultValue={guest.first_name || ""} />
                  </div>
                  <div>
                    <label>Achternaam</label>
                    <input name="last_name" defaultValue={guest.last_name || ""} />
                  </div>
                  <div>
                    <label>E-mailadres</label>
                    <input name="email" type="email" defaultValue={guest.email || ""} />
                  </div>
                  <div>
                    <label>Telefoon</label>
                    <input name="phone" defaultValue={guest.phone || ""} />
                  </div>
                  <button className="btn-secondary">Gegevens wijzigen</button>
                </form>
                <div className="flex flex-col gap-3">
                  <form action={endParticipation.bind(null, guest.id)}>
                    <button className="btn-secondary w-full">Deelname beeindigen</button>
                  </form>
                  <form action={deleteGuest.bind(null, guest.id)}>
                    <button className="btn-secondary w-full text-rose-700">
                      <Trash2 className="h-4 w-4" /> Gast verwijderen
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
