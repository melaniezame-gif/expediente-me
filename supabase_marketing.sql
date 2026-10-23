-- Week 4: run this in Supabase > SQL Editor > New query > Run

-- 1) Saved marketing assets (Save button on /marketing)
create table if not exists marketing_assets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  asset_id text not null,            -- P1..P10, S1..S3, L1..L8
  asset_type text not null check (asset_type in ('social_post', 'video_script', 'landing_copy')),
  channel text not null,
  title text not null,
  body text not null
);

alter table marketing_assets enable row level security;

create policy "Allow public insert" on marketing_assets
  for insert to anon
  with check (true);

create policy "Allow public select" on marketing_assets
  for select to anon
  using (true);

grant select, insert on table marketing_assets to anon;

-- 2) A/B test events (homepage headline + CTA tests)
create table if not exists ab_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  test_id text not null check (test_id in ('hero_headline', 'cta_text')),
  variant text not null check (variant in ('A', 'B')),
  event text not null check (event in ('view', 'click')),
  visitor_id text not null
);

alter table ab_events enable row level security;

create policy "Allow public insert" on ab_events
  for insert to anon
  with check (true);

create policy "Allow public select" on ab_events
  for select to anon
  using (true);

grant select, insert on table ab_events to anon;
