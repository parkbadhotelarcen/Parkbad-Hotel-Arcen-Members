import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, Gift, Hotel, Info, LayoutGrid, Star, User, Waves, Wine } from "lucide-react";
import { Brand } from "@/components/brand";
import { QrCard } from "@/components/qr-card";
import { getEmployee } from "@/lib/auth";
import { getReferenceData } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { fullName, nextReward, progressToReward } from "@/lib/loyalty";
import { getPublicBaseUrl, guestUrl } from "@/lib/urls";
import type { Badge, Visit } from "@/lib/types";

const fallbackBadges = [
  { name: "Bronze Gast", icon: Star },
  { name: "Thermen Liefhebber", icon: Waves },
  { name: "Wijn Liefhebber", icon: Wine },
  { name: "Herfst Gast", icon: Hotel },
];

function shortDate(value?: string | null, monthOnly = false) {
  if (!value) return "Nog geen";
  return new Intl.DateTimeFormat("nl-NL", monthOnly ? { month: "short", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-landal-100 bg-white p-3 text-center shadow-card">
      <div className="mx-auto flex h-8 w-8 items-center justify-center text-landal-800">{icon}</div>
      <div className="mt-2 min-h-10 text-balance text-base font-black leading-tight text-landal-900">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function BadgeTile({ badge, index }: { badge: Badge | null; index: number }) {
  const fallback = fallbackBadges[index % fallbackBadges.length];
  const Icon = fallback.icon;
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-landal-100 bg-mist text-landal-700 shadow-sm">
        {badge?.icon && badge.icon.length <= 3 ? <span className="text-2xl">{badge.icon}</span> : <Icon className="h-8 w-8" />}
      </div>
      <div className="mt-2 text-sm font-bold leading-tight text-landal-900">{badge?.name || fallback.name}</div>
    </div>
  );
}

export default async function PublicGuestPage({ params }: { params: Promise<{ public_token: string }> }) {
  const { public_token } = await params;
  const supabase = createAdminClient();
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("public_token", public_token)
    .eq("status", "active")
    .maybeSingle();

  const employee = await getEmployee();
  if (employee && guest) redirect(`/guests/${guest.id}`);

  if (!guest) {
    return (
      <main className="wellness-surface grid min-h-screen place-items-center p-4">
        <div className="card max-w-md p-6">Deze ledenpagina is niet actief.</div>
      </main>
    );
  }

  const [{ data: visits }, { data: badges }, refs] = await Promise.all([
    supabase.from("visits").select("*").eq("guest_id", guest.id).order("visit_date", { ascending: false }).limit(1),
    supabase.from("guest_badges").select("badges(*)").eq("guest_id", guest.id),
    getReferenceData(),
  ]);

  const awarded = (badges || []).map((item) => item.badges).filter(Boolean) as unknown as Badge[];
  const latest = ((visits || [])[0] || null) as Visit | null;
  const baseUrl = getPublicBaseUrl(await headers());
  const progressUrl = guestUrl(guest.public_token, baseUrl);
  const reward = nextReward(refs.rewards, guest.total_visits);
  const progress = progressToReward(guest.total_visits, reward);
  const firstName = guest.first_name || "Gast";
  const levelName = `${guest.current_level} Member`;

  return (
    <main className="min-h-screen bg-[#f7fbf8] pb-28 text-landal-900">
      <div className="mx-auto min-h-screen max-w-md bg-[#f7fbf8]">
        <header className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <Brand compact />
            <button className="relative rounded-full p-2 text-landal-700" aria-label="Meldingen">
              <Bell className="h-7 w-7" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-landal-500" />
            </button>
          </div>
        </header>

        <section className="relative mx-4 mt-5 overflow-hidden rounded-[1.65rem] bg-landal-800 text-white shadow-wallet">
          <Image src="/parkbad-hero.svg" alt="Parkbad Hotel Arcen aan het water" fill priority className="object-cover" />
          <div className="relative min-h-[13.5rem] p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">Welkom terug</p>
            <h1 className="mt-2 text-4xl font-black leading-none">{fullName(firstName, guest.last_name)}</h1>
            <p className="mt-3 text-lg text-white/90">Parkbad Hotel Arcen Members</p>
          </div>
        </section>

        <section className="relative z-10 mx-7 -mt-10 rounded-[1.8rem] bg-white p-5 text-center shadow-soft">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-landal-600">
            <Gift className="h-4 w-4" />
            Jouw digitale ledenkaart
          </div>
          <Link href={progressUrl} aria-label="Digitale ledenkaart openen">
            <QrCard url={progressUrl} label="Digitale ledenkaart" guestNumber={guest.guest_number} showUrl={false} showLabel={false} bare />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Info className="h-4 w-4 text-landal-700" />
            Laat deze QR-code scannen bij elk bezoek.
          </div>
        </section>

        <section className="mx-4 mt-5 rounded-[1.4rem] border border-landal-100 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-landal-600">Jouw level</p>
              <h2 className="mt-1 text-3xl font-black text-landal-900">{levelName}</h2>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#d8a25f] to-[#8d5528] text-white shadow-card">
              <Star className="h-9 w-9 fill-current" />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-landal-900">
              <span>
                {progress.current} / {progress.target} bezoeken
              </span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-landal-100">
              <div className="h-full rounded-full bg-gradient-to-r from-landal-600 via-landal-500 to-[#45763e]" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
          <Link href="#beloningen" className="mt-5 flex items-center gap-4 rounded-[1.2rem] bg-mist p-4 transition hover:bg-landal-50">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-landal-100 bg-white text-landal-700">
              <Gift className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-black uppercase tracking-wide text-landal-600">Volgende beloning</p>
              <h3 className="truncate text-lg font-black text-landal-900">{reward ? reward.reward_name : "Alle beloningen behaald"}</h3>
              <p className="text-sm text-slate-600">{reward ? `Nog ${progress.remaining} bezoeken tot deze beloning.` : "U heeft alle mijlpalen gehaald."}</p>
            </div>
            <ChevronRight className="h-6 w-6 text-landal-700" />
          </Link>
        </section>

        <section className="mx-4 mt-5 grid grid-cols-4 gap-2">
          <StatTile icon={<CalendarDays className="h-7 w-7" />} value={guest.total_visits} label="Bezoeken" />
          <StatTile icon={<Star className="h-7 w-7" />} value={guest.current_level} label="Level" />
          <StatTile icon={<CalendarDays className="h-7 w-7" />} value={shortDate(guest.activated_at, true)} label="Lid sinds" />
          <StatTile icon={<Hotel className="h-7 w-7" />} value={latest ? shortDate(latest.visit_date) : "Nog geen"} label="Laatste verblijf" />
        </section>

        <section className="mx-4 mt-5 rounded-[1.4rem] border border-landal-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-landal-600">Jouw badges</h2>
            <Link href="#badges" className="flex items-center gap-1 text-sm font-bold text-landal-700">
              Bekijk alle <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <BadgeTile key={awarded[index]?.id || index} badge={awarded[index] || null} index={index} />
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-landal-100 bg-white/95 px-4 pb-4 pt-2 shadow-soft backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          {[
            ["Overzicht", LayoutGrid, "#"],
            ["Beloningen", Gift, "#beloningen"],
            ["Bezoeken", CalendarDays, "#bezoeken"],
            ["Mijn profiel", User, "#profiel"],
          ].map(([label, Icon, href]) => (
            <Link
              key={label as string}
              href={href as string}
              className={`flex flex-col items-center gap-1 rounded-full px-2 py-2 text-xs font-semibold ${
                label === "Overzicht" ? "bg-landal-50 text-landal-800" : "text-slate-600"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label as string}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
