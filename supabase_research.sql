-- Week 2: run this in Supabase > SQL Editor > New query > Run

create table if not exists research_records (
  id uuid default gen_random_uuid() primary key,
  research_question text not null,
  target_user text not null,
  region text not null,
  source_type text not null default 'Desk research',
  key_finding text not null,
  created_at timestamp with time zone default now()
);

alter table research_records enable row level security;

create policy "Allow public insert" on research_records
  for insert to anon
  with check (true);

create policy "Allow public select" on research_records
  for select to anon
  using (true);

-- Make sure the API roles can reach the table (some newer Supabase projects
-- do not grant this automatically for tables created in SQL).
grant select, insert on table research_records to anon;
grant select, insert on table core_outputs to anon;
