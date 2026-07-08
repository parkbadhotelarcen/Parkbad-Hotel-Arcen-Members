"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Plus, Search, X } from "lucide-react";
import { createGuest } from "@/lib/actions";

export function NewGuestModal({ label = "Nieuwe gast" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-5 w-5" />
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-40 bg-landal-900/30 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-xl rounded-lg bg-white p-5 shadow-wallet">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-landal-900">Nieuwe gast toevoegen</h2>
                <p className="mt-1 text-sm text-slate-600">Maak snel een conceptprofiel en activatielink aan.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-landal-700 hover:bg-landal-50" aria-label="Sluiten">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={createGuest} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label>Voornaam</label>
                <input name="first_name" required autoComplete="given-name" />
              </div>
              <div>
                <label>Achternaam</label>
                <input name="last_name" required autoComplete="family-name" />
              </div>
              <div className="sm:col-span-2">
                <label>E-mailadres</label>
                <input name="email" type="email" required autoComplete="email" />
              </div>
              <div>
                <label>Telefoon optioneel</label>
                <input name="phone" autoComplete="tel" />
              </div>
              <div>
                <label>Kamernummer optioneel</label>
                <input name="room_number" />
              </div>
              <div>
                <label>Reserveringsnummer optioneel</label>
                <input name="reservation_number" />
              </div>
              <div className="flex items-end sm:col-span-2">
                <button className="btn-primary w-full">Gast toevoegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ReceptionSearch({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <div className="card flex items-center gap-2 p-2">
      <form action="/guests" className="flex min-w-0 flex-1 items-center gap-2">
        <Search className="ml-3 h-5 w-5 shrink-0 text-landal-700" />
        <input
          name="q"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          className="border-0 bg-transparent px-1 shadow-none focus:ring-0"
          placeholder="Zoek op naam, gastnummer, kamer, reservering of code"
        />
      </form>
      <Link href="/scan" className="rounded-lg p-3 text-landal-700 hover:bg-landal-50" aria-label="QR-code scannen">
        <Camera className="h-5 w-5" />
      </Link>
      <NewGuestModal label="" />
    </div>
  );
}
