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
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` blijft alleen server-side. Zet deze nooit in clientcode.

## Supabase setup

1. Maak een Supabase project.
2. Open de SQL Editor.
3. Voer `supabase/migrations/001_initial_schema.sql` uit.
4. Maak een medewerker aan in Supabase Auth.
5. Voeg daarna in SQL een employee-record toe:

```sql
insert into employees (auth_user_id, name, email, role)
values ('AUTH_USER_ID_HIER', 'Manager', 'manager@example.com', 'admin');
```

Rollen zijn `reception`, `manager` en `admin`.

## Medewerkersaccount aanmaken

Een medewerker krijgt een account via Supabase Auth plus een record in de tabel `employees`.

1. Ga in Supabase naar **Authentication → Users**.
2. Klik **Add user** of **Invite user**.
3. Vul het e-mailadres en een tijdelijk wachtwoord in.
4. Kopieer de `User UID` van deze Auth-user.
5. Ga naar **SQL Editor** en voer dit uit:

```sql
insert into employees (auth_user_id, name, email, role, active)
values (
  'AUTH_USER_ID_HIER',
  'Naam medewerker',
  'medewerker@example.com',
  'reception',
  true
);
```

Gebruik als rol `reception`, `manager` of `admin`. Daarna kan de medewerker inloggen via `/login` met het Supabase Auth e-mailadres en wachtwoord.

## Workflows

- Receptie logt in via `/login`.
- Nieuwe gast via `/guests/new`.
- De app maakt gastnummer, control code, public token en activation token.
- Receptie kopieert de activatielink uit het gastprofiel en stuurt die handmatig.
- Gast activeert via `/activate/[activation_token]` met privacy-akkoord.
- Actieve gast ziet `/guest/[public_token]`.
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
