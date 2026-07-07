# Parkbad Hotel Arcen Members

Een Next.js PWA voor een digitaal loyaliteitssysteem voor hotelgasten van Parkbad Hotel Arcen. De app ondersteunt medewerkerslogin, gastactivatie, QR-codes, handmatig zoeken, bezoekregistratie, automatische beloningen, levels, audit logs en AVG-workflows.

## Installatie

```bash
npm install
npm run dev
```

Open daarna `http://localhost:3000`.

## Environment variables

Kopieer `.env.example` naar `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SETUP_SECRET=
```

Gebruik `NEXT_PUBLIC_SUPABASE_ANON_KEY` of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` voor de publieke Supabase key. `SUPABASE_SERVICE_ROLE_KEY` blijft alleen server-side. Zet deze nooit in clientcode. `SETUP_SECRET` is optioneel maar aanbevolen voor de eerste installatie.

## Supabase setup

1. Maak een Supabase project.
2. Open de SQL Editor.
3. Voer `supabase/migrations/001_initial_schema.sql` uit.
4. Zet de environment variables in Vercel, inclusief een tijdelijke `SETUP_SECRET`.
5. Open na deployment `/setup` en maak de eerste admin aan.

De setup-pagina werkt alleen zolang de tabel `employees` nog leeg is. Daarna voeg je medewerkers toe via **Medewerkers** in de app.

Rollen zijn `reception`, `manager` en `admin`.

## Medewerkersaccount aanmaken

De eerste admin maak je via `/setup`. Daarna kan een manager/admin medewerkers aanmaken in de app via **Medewerkers**.

1. Log in als admin.
2. Ga naar **Medewerkers**.
3. Vul naam, e-mail, tijdelijk wachtwoord en rol in.
4. Klik **Medewerker aanmaken**.

De app maakt automatisch een Supabase Auth-user en een `employees` record aan.

## Workflows

- Receptie logt in via `/login`.
- Nieuwe gast via `/guests/new`.
- De app maakt gastnummer, control code, public token en activation token.
- Receptie kopieert de activatielink uit het gastprofiel en stuurt die handmatig.
- Gast activeert via `/activate/[activation_token]` met privacy-akkoord.
- Actieve gast ziet `/guest/[public_token]`.
- Gast kan ook via `/member` met gastnummer + controlecode de eigen voortgang openen.
- Dezelfde QR-code opent voor ingelogde medewerkers automatisch `/guests/[id]`.
- Bezoeken worden alleen na medewerkerslogin geregistreerd.
- Bij een beloningsmijlpaal toont het profiel een melding en kan receptie de beloning uitgeven.
- Verwijderen zet een gast in de prullenbak; manager/admin kan herstellen of anonimiseren.

## Deploy naar Vercel

1. Push de repository naar GitHub.
2. Importeer de repository in Vercel.
3. Zet dezelfde environment variables in Vercel.
4. Deploy.

Gebruik HTTPS in productie. Vercel levert dat standaard.

## PWA

De PWA gebruikt `public/manifest.json` en `public/icons/icon.svg`. Receptie kan de app vanuit de browser toevoegen aan het beginscherm.

## Toekomstige module

Wallet-integratie is bewust buiten MVP gehouden. Een latere module kan Apple Wallet, Google Wallet, automatische levelmails, coupons, voorkeuren, reserveringssysteemkoppelingen, meerdere locaties en meertaligheid toevoegen.
