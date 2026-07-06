import Link from "next/link";
import { headers } from "next/headers";
import { Gift, Plus, Trash2 } from "lucide-react";
import { requireEmployee } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { addVisit, deleteGuest, endParticipation, getReferenceData, issueReward, resendInvitation, updateGuest } from "@/lib/actions";
import { activationUrl, getPublicBaseUrl, guestUrl } from "@/lib/urls";
import { fullName, nextReward, toDateLabel } from "@/lib/loyalty";
import { QrCard } from "@/components/qr-card";
import { Progress, Shell, StatusLabel } from "@/components/ui";
import type { Guest, Visit } from "@/lib/types";

export default async function GuestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; reward?: string }> }) {
  const employee = await requireEmployee();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createAdminClient();
  const [{ data: guest }, { data: visits }, { data: issued }, refs] = await Promise.all([
    supabase.from("guests").select("*").eq("id", id).single(),
    supabase.from("visits").select("*").eq("guest_id", id).order("visit_date", { ascending: false }).limit(20),
    supabase.from("issued_rewards").select("*,rewards(reward_name,visit_count)").eq("guest_id", id).order("issued_at", { ascending: false }),
    getReferenceData(),
  ]);
  if (!guest) return <Shell employee={employee}><div className="card p-6">Gast niet gevonden.</div></Shell>;
  const activeReward = query.reward ? refs.rewards.find((reward) => reward.id === query.reward) : null;
  const next = nextReward(refs.rewards, guest.total_visits);
  const baseUrl = getPublicBaseUrl(await headers());
  const guestPage = guestUrl(guest.public_token, baseUrl);
  const invite = activationUrl(guest.activation_token, baseUrl);
  return (
    <Shell employee={employee}>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {query.created && (
            <div className="rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Conceptprofiel aangemaakt. Kopieer de activatielink en verstuur die handmatig naar de gast.
            </div>
          )}
          {activeReward && (
            <div className="rounded-lg bg-gold/15 p-5 text-landal-900">
              <div className="flex items-center gap-3 text-xl font-black"><Gift /> Gefeliciteerd! Bezoek {activeReward.visit_count} bereikt.</div>
              <p className="mt-1">Deze gast ontvangt: {activeReward.reward_name}.</p>
              <form action={issueReward.bind(null, guest.id, activeReward.id)} className="mt-4 flex gap-3">
                <button className="btn-primary">Beloning uitgegeven</button>
                <Link href={`/guests/${guest.id}`} className="btn-secondary">Later uitgeven</Link>
              </form>
            </div>
          )}
          <section className="card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3"><h1 className="text-3xl font-black text-landal-900">{fullName(guest.first_name, guest.last_name)}</h1><StatusLabel status={guest.status} /></div>
                <p className="mt-2 text-slate-600">{guest.guest_number} · code {guest.control_code || "-"} · {guest.email || "geen e-mail"}</p>
              </div>
              <div className="rounded-lg bg-landal-700 px-5 py-4 text-center text-white">
                <div className="text-sm font-bold uppercase">Totaal bezoeken</div>
                <div className="text-4xl font-black">{guest.total_visits}</div>
              </div>
            </div>
            <div className="mt-6"><Progress guest={guest as Guest} levels={refs.levels} rewards={refs.rewards} /></div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-black text-landal-900">+ Verblijf registreren</h2>
            <form action={addVisit.bind(null, guest.id)} className="mt-4 grid gap-4 md:grid-cols-4">
              <div><label>Datum</label><input name="visit_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
              <div><label>Reservering</label><input name="reservation_number" /></div>
              <div><label>Kamer</label><input name="room_number" /></div>
              <div className="flex items-end"><button className="btn-primary w-full" disabled={guest.status !== "active"}><Plus className="h-4 w-4" /> Verblijf registreren</button></div>
            </form>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <form action={updateGuest.bind(null, guest.id)} className="card grid gap-4 p-6">
              <h2 className="text-xl font-black text-landal-900">Gegevens wijzigen</h2>
              <div><label>Voornaam</label><input name="first_name" defaultValue={guest.first_name || ""} /></div>
              <div><label>Achternaam</label><input name="last_name" defaultValue={guest.last_name || ""} /></div>
              <div><label>E-mailadres</label><input name="email" type="email" defaultValue={guest.email || ""} /></div>
              <div><label>Telefoon</label><input name="phone" defaultValue={guest.phone || ""} /></div>
              <button className="btn-secondary">Opslaan</button>
            </form>
            <div className="card p-6">
              <h2 className="text-xl font-black text-landal-900">Privacy en deelname</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={endParticipation.bind(null, guest.id)}><button className="btn-secondary">Deelname beëindigen</button></form>
                <form action={deleteGuest.bind(null, guest.id)}><button className="btn-secondary text-rose-700"><Trash2 className="h-4 w-4" /> Gast verwijderen</button></form>
              </div>
            </div>
          </section>
          <section className="card overflow-hidden">
            <div className="border-b border-landal-100 p-5"><h2 className="text-xl font-black text-landal-900">Bezoekgeschiedenis</h2></div>
            {(visits || []).map((visit: Visit) => (
              <div key={visit.id} className="grid gap-2 border-b border-landal-100 p-5 md:grid-cols-3">
                <div className="font-bold">{toDateLabel(visit.visit_date)}</div>
                <div className="text-sm text-slate-600">Reservering {visit.reservation_number || "-"}</div>
                <div className="text-sm text-slate-600">Kamer {visit.room_number || "-"}</div>
              </div>
            ))}
          </section>
          <section className="card overflow-hidden">
            <div className="border-b border-landal-100 p-5"><h2 className="text-xl font-black text-landal-900">Uitgegeven beloningen</h2></div>
            {(issued || []).map((item) => (
              <div key={item.id} className="border-b border-landal-100 p-5">
                <div className="font-bold">{item.rewards?.reward_name}</div>
                <div className="text-sm text-slate-600">{toDateLabel(item.issued_at)}</div>
              </div>
            ))}
          </section>
        </div>
        <aside className="space-y-6">
          {guest.public_token && <QrCard url={guestPage} label="Persoonlijke QR-code" />}
          {guest.status === "concept" && (
            <div className="card p-5">
              <h2 className="text-lg font-black text-landal-900">Activatielink</h2>
              <p className="mt-2 break-all rounded-lg bg-landal-50 p-3 text-xs text-landal-800">{invite}</p>
              <form action={resendInvitation.bind(null, guest.id)} className="mt-3"><button className="btn-secondary w-full">Uitnodiging opnieuw maken</button></form>
            </div>
          )}
          <div className="card p-5">
            <h2 className="text-lg font-black text-landal-900">Volgende beloning</h2>
            <p className="mt-2 text-slate-700">{next ? `${next.reward_name} bij bezoek ${next.visit_count}` : "Geen volgende beloning."}</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
