-- Ejecuta esto en Supabase: Proyecto > SQL Editor > New query > Run

create table if not exists core_outputs (
  id uuid default gen_random_uuid() primary key,
  temperature numeric,
  heart_rate numeric,
  oxygen_saturation numeric,
  pain_level numeric,
  risk_score numeric,
  status text,
  recommendation text,
  created_at timestamp with time zone default now()
);

alter table core_outputs enable row level security;

create policy "Allow public insert" on core_outputs
  for insert to anon
  with check (true);

create policy "Allow public select" on core_outputs
  for select to anon
  using (true);
