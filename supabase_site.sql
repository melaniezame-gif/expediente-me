-- Week 6 — external user tests of the full site (/demo form).
-- Run once in Supabase > SQL Editor. Anon can INSERT and SELECT only (no update/delete).

create table if not exists site_tests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  tester_label text check (char_length(tester_label) <= 12),  -- a code like "U4", never a full name
  device text,                                                -- phone / laptop / tablet
  steps_completed int not null check (steps_completed between 0 and 7),
  task_completed boolean not null,
  ease int not null check (ease between 1 and 5),
  trust int not null check (trust between 1 and 5),
  would_use text not null check (would_use in ('yes', 'maybe', 'no')),
  confusing text,
  comment text
);

alter table site_tests enable row level security;

create policy "Allow public insert" on site_tests
  for insert to anon
  with check (true);

create policy "Allow public select" on site_tests
  for select to anon
  using (true);

grant select, insert on table site_tests to anon;
