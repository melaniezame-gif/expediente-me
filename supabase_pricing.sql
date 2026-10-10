-- Week 3: run this in Supabase > SQL Editor > New query > Run

create table if not exists pricing_scenarios (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  scenario_type text not null,
  b2c_users integer not null check (b2c_users >= 0),
  plus_conversion numeric not null check (plus_conversion >= 0 and plus_conversion <= 100),
  plus_price numeric not null check (plus_price >= 0),
  clinics integer not null check (clinics >= 0),
  clinic_price numeric not null check (clinic_price >= 0),
  monthly_revenue numeric not null,
  annual_revenue numeric not null
);

alter table pricing_scenarios enable row level security;

create policy "Allow public insert" on pricing_scenarios
  for insert to anon
  with check (true);

create policy "Allow public select" on pricing_scenarios
  for select to anon
  using (true);

-- Newer Supabase projects do not always grant this for tables created in SQL.
grant select, insert on table pricing_scenarios to anon;
