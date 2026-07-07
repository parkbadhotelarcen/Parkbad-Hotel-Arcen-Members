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
2. Open SQL Editor.
3. Voer `supabase/migrations/001_initial_schema.sql` uit.
4. Zet de environment variables in Vercel, inclusief een tijdelijke `SETUP_SECRET`.
5. Open na deployment `/setup` en maak de eerste admin aan.

De setup-pagina werkt alleen zolang de tabel `employees` nog leeg is. Daarna voeg je medewerkers toe via **Medewerkers** in de app.

Rollen zijn `reception`, `manager` en `admin`.

## Workflows

- Receptie logt in via `/login`.
- Nieuwe gast via `/guests/new`.
- De app maakt gastnummer, control code, public token en activation token.
- Receptie kopieert de activatielink uit het gastprofiel en stuurt die handmatig.
- Gast activeert via `/activate/[activation_token]` met privacy-akkoord.
- Actieve gast ziet `/guest/[public_token]`.
- Gast kan ook via `/member` met gastnummer + controlecode de eigen voortgang openen.
- Receptie kan de wallet-link `/wallet/[public_token]` mailen; daar staat de QR-code met gastnummer eronder.
- De QR-code op de digitale ledenkaart opent direct de voortgangspagina van de gast.
- Dezelfde QR-code opent voor ingelogde medewerkers automatisch `/guests/[id]`.
- Bezoeken worden alleen na medewerkerslogin geregistreerd.
- Bij een beloningsmijlpaal toont het profiel een melding en kan receptie de beloning uitgeven.
- Verwijderen zet een gast in de prullenbak; manager/admin kan herstellen of anonimiseren.

## Wallet-flow

De MVP heeft een wallet-klare ledenkaart via `/wallet/[public_token]`. Deze pagina is bedoeld voor de mail naar de gast. De gast ziet daar de QR-code, het gastnummer en een knop naar de eigen voortgang.

Echte Apple Wallet en Google Wallet knoppen vereisen later extra setup:

- Apple Developer account met Wallet Pass certificate.
- Google Wallet issuer account.
- Server-side ondertekening/generatie van de wallet pass.

De knoppen staan daarom alvast op de juiste plek, maar zijn nog niet actief totdat die officiele gegevens beschikbaar zijn.

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
