-- Week 5: run this in Supabase > SQL Editor > New query > Run

-- 1) One row per finished test conversation ("Finish & save test summary" on /chat)
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  session_id text not null,
  tester_label text,                       -- optional code like "U1", never a full name
  who_for text check (who_for in ('self', 'other')),
  age_group text check (age_group in ('18-64', '65+', 'under18')),
  red_flag text,
  vitals jsonb,                            -- { temperature, heartRate, oxygenSaturation, painLevel }
  triage_status text check (triage_status in ('Stable', 'Review', 'Attention')),
  triage_score int check (triage_score between 0 and 8),
  guardrails text[] not null default '{}', -- e.g. {emergency, medication, pii}
  needs_review boolean not null default false,
  review_reasons text[] not null default '{}',
  overall_rating int not null check (overall_rating between 1 and 5),
  tester_comment text,
  message_count int not null default 0,
  transcript jsonb not null default '[]'   -- redacted in the browser before insert
);

alter table chat_sessions enable row level security;

create policy "Allow public insert" on chat_sessions
  for insert to anon
  with check (true);

create policy "Allow public select" on chat_sessions
  for select to anon
  using (true);

grant select, insert on table chat_sessions to anon;

-- 2) Thumbs up / down on individual assistant answers
create table if not exists chat_feedback (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  session_id text not null,
  message_id text not null,
  intent text not null,
  rating smallint not null check (rating in (-1, 1)),
  bot_text text not null
);

alter table chat_feedback enable row level security;

create policy "Allow public insert" on chat_feedback
  for insert to anon
  with check (true);

create policy "Allow public select" on chat_feedback
  for select to anon
  using (true);

grant select, insert on table chat_feedback to anon;
