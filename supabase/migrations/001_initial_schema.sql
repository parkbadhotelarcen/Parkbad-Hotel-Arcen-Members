create extension if not exists "pgcrypto";

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  guest_number text not null unique,
  first_name text,
  last_name text,
  email text,
  phone text,
  status text not null default 'concept' check (status in ('concept','active','ended','deleted')),
  current_level text not null default 'Explorer',
  total_visits integer not null default 0,
  activation_token text unique,
  public_token text unique,
  control_code text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  deleted_at timestamptz
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('reception','manager','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  visit_date date not null default current_date,
  reservation_number text,
  room_number text,
  added_by_employee_id uuid references employees(id),
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  visit_count integer not null unique,
  reward_name text not null,
  reward_description text,
  active boolean not null default true
);

create table if not exists issued_rewards (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  reward_id uuid not null references rewards(id),
  issued_by_employee_id uuid references employees(id),
  issued_at timestamptz not null default now(),
  notes text
);

create table if not exists levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  min_visits integer not null,
  max_visits integer,
  color text not null,
  icon text not null
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text not null,
  condition_type text not null,
  condition_value text not null
);

create table if not exists guest_badges (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (guest_id, badge_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  guest_id uuid references guests(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text
);

create index if not exists guests_status_idx on guests(status);
create index if not exists guests_public_token_idx on guests(public_token);
create index if not exists guests_activation_token_idx on guests(activation_token);
create index if not exists visits_guest_id_idx on visits(guest_id);
create index if not exists visits_lookup_idx on visits(reservation_number, room_number);

alter table guests enable row level security;
alter table visits enable row level security;
alter table rewards enable row level security;
alter table issued_rewards enable row level security;
alter table levels enable row level security;
alter table badges enable row level security;
alter table guest_badges enable row level security;
alter table employees enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;

create or replace function current_employee_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from employees where auth_user_id = auth.uid() and active = true limit 1
$$;

create or replace function is_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from employees where auth_user_id = auth.uid() and active = true)
$$;

create or replace function is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_employee_role() in ('manager','admin')
$$;

create policy "employees can read guests" on guests for select to authenticated using (is_employee());
create policy "employees can write guests" on guests for all to authenticated using (is_employee()) with check (is_employee());
create policy "employees can read visits" on visits for select to authenticated using (is_employee());
create policy "employees can insert visits" on visits for insert to authenticated with check (is_employee());
create policy "employees can read rewards" on rewards for select to authenticated using (is_employee());
create policy "managers can manage rewards" on rewards for all to authenticated using (is_manager()) with check (is_manager());
create policy "employees can read issued rewards" on issued_rewards for select to authenticated using (is_employee());
create policy "employees can issue rewards" on issued_rewards for insert to authenticated with check (is_employee());
create policy "employees can read levels" on levels for select to authenticated using (is_employee());
create policy "managers can manage levels" on levels for all to authenticated using (is_manager()) with check (is_manager());
create policy "employees can read badges" on badges for select to authenticated using (is_employee());
create policy "employees can read guest badges" on guest_badges for select to authenticated using (is_employee());
create policy "employees can read employees" on employees for select to authenticated using (is_employee());
create policy "managers can manage employees" on employees for all to authenticated using (is_manager()) with check (is_manager());
create policy "employees can read audit logs" on audit_logs for select to authenticated using (is_employee());
create policy "employees can append audit logs" on audit_logs for insert to authenticated with check (is_employee() or employee_id is null);
create policy "managers can read settings" on settings for select to authenticated using (is_manager());
create policy "managers can manage settings" on settings for all to authenticated using (is_manager()) with check (is_manager());

insert into levels (name, min_visits, max_visits, color, icon) values
('Explorer',0,1,'#006c67','○'),
('Bronze',2,4,'#a66b3f','★'),
('Silver',5,9,'#94a3b8','✦'),
('Gold',10,14,'#bf8f2e','◆'),
('Diamond',15,24,'#38bdf8','◇'),
('Platinum',25,49,'#64748b','✹'),
('Legend',50,null,'#003f3d','♛')
on conflict (name) do update set min_visits = excluded.min_visits, max_visits = excluded.max_visits, color = excluded.color, icon = excluded.icon;

insert into rewards (visit_count, reward_name, reward_description, active) values
(2,'Snoepgoed','Een kleine traktatie bij de receptie.',true),
(5,'Mini fles wijn','Een mini fles wijn als dank voor het terugkomen.',true),
(10,'Parkbad-pakket','Een Parkbad Hotel Arcen pakket voor vaste gasten.',true),
(15,'Parkbad-pakket + wijn','Een Parkbad-pakket met mini fles wijn.',true),
(20,'Gratis koffie/thee','Gratis koffie of thee tijdens het verblijf.',true),
(25,'Wellnessproduct','Een wellnessproduct voor extra ontspanning.',true),
(30,'VIP-verrassing','Een verrassing voor zeer trouwe gasten.',true),
(50,'Legend-beloning','Speciale Legend-beloning.',true)
on conflict (visit_count) do update set reward_name = excluded.reward_name, reward_description = excluded.reward_description, active = excluded.active;

insert into badges (name, description, icon, condition_type, condition_value) values
('10 bezoeken','Behaald bij 10 bezoeken','★','visits','10'),
('25 bezoeken','Behaald bij 25 bezoeken','✦','visits','25'),
('50 bezoeken','Behaald bij 50 bezoeken','♛','visits','50'),
('Thermenliefhebber','Voor wellnessfans','♨','manual','thermen'),
('Restaurantfan','Voor restaurantbezoekers','☕','manual','restaurant'),
('Wijnliefhebber','Voor wijnliefhebbers','🍷','manual','wijn'),
('Seizoensgast','Voor terugkeer in meerdere seizoenen','☘','manual','seizoen');

insert into settings (key, value) values
('hotelnaam','Parkbad Hotel Arcen'),
('clubnaam','Parkbad Hotel Arcen Members'),
('bewaartermijn_conceptprofielen','30 dagen'),
('bewaartermijn_prullenbak','30 dagen'),
('emailafzender','receptie@example.com'),
('privacytekst','Deelname is vrijwillig. We bewaren alleen noodzakelijke gegevens voor levels en beloningen.'),
('voorwaarden','De receptie kan bezoeken registreren en beloningen uitgeven. De gast kan deelname beëindigen of verwijdering aanvragen.')
on conflict (key) do update set value = excluded.value;
