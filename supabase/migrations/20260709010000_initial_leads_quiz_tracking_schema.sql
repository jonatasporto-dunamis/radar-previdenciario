create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  campaign_id text,
  adset_id text,
  ad_id text,
  placement text,
  site_source_name text,
  referrer text,
  landing_page text,
  user_agent text,
  ip_address text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  status text default 'started',
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.quiz_sessions(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  question_id text not null,
  question_label text not null,
  answer_value text not null,
  answer_label text not null,
  benefit_context text,
  created_at timestamptz default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.quiz_sessions(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  potential_benefit text,
  score integer not null default 0,
  classification text not null,
  summary text,
  ethical_disclaimer text,
  created_at timestamptz default now()
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  session_id uuid references public.quiz_sessions(id) on delete set null,
  event_name text not null,
  event_payload jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  campaign_id text,
  adset_id text,
  ad_id text,
  placement text,
  site_source_name text,
  referrer text,
  landing_page text,
  user_agent text,
  ip_address text,
  created_at timestamptz default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  result_id uuid references public.quiz_results(id) on delete set null,
  notification_type text not null,
  recipient text not null,
  status text not null default 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_created_at_idx on public.leads (created_at);
create index if not exists leads_utm_campaign_idx on public.leads (utm_campaign);
create index if not exists quiz_sessions_lead_id_idx on public.quiz_sessions (lead_id);
create index if not exists quiz_answers_session_id_idx on public.quiz_answers (session_id);
create index if not exists quiz_results_lead_id_idx on public.quiz_results (lead_id);
create index if not exists tracking_events_event_name_idx on public.tracking_events (event_name);
create index if not exists tracking_events_created_at_idx on public.tracking_events (created_at);
create index if not exists tracking_events_lead_id_idx on public.tracking_events (lead_id);
create index if not exists notification_logs_status_idx on public.notification_logs (status);

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

drop trigger if exists set_quiz_sessions_updated_at on public.quiz_sessions;
create trigger set_quiz_sessions_updated_at
before update on public.quiz_sessions
for each row
execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_results enable row level security;
alter table public.tracking_events enable row level security;
alter table public.notification_logs enable row level security;

comment on table public.leads is
  'Lead capture records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';
comment on table public.quiz_sessions is
  'Quiz session records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';
comment on table public.quiz_answers is
  'Quiz answer records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';
comment on table public.quiz_results is
  'Quiz result records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';
comment on table public.tracking_events is
  'Tracking event records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';
comment on table public.notification_logs is
  'Notification log records. Public direct access is intentionally blocked by RLS; future writes should use Server Actions/API with service role or another secure endpoint.';

create policy "Block public direct access to leads"
on public.leads
for all
to anon, authenticated
using (false)
with check (false);

create policy "Block public direct access to quiz_sessions"
on public.quiz_sessions
for all
to anon, authenticated
using (false)
with check (false);

create policy "Block public direct access to quiz_answers"
on public.quiz_answers
for all
to anon, authenticated
using (false)
with check (false);

create policy "Block public direct access to quiz_results"
on public.quiz_results
for all
to anon, authenticated
using (false)
with check (false);

create policy "Block public direct access to tracking_events"
on public.tracking_events
for all
to anon, authenticated
using (false)
with check (false);

create policy "Block public direct access to notification_logs"
on public.notification_logs
for all
to anon, authenticated
using (false)
with check (false);
