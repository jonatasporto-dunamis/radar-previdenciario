create table if not exists public.external_tracking_deliveries (
  id uuid primary key default gen_random_uuid(),
  tracking_event_id uuid
    references public.tracking_events(id)
    on delete cascade,
  lead_id uuid
    references public.leads(id)
    on delete set null,
  session_id uuid
    references public.quiz_sessions(id)
    on delete set null,
  result_id uuid
    references public.quiz_results(id)
    on delete set null,
  event_name text not null,
  event_id text not null,
  provider text not null,
  channel text not null,
  status text not null default 'pending',
  attempt integer not null default 0,
  test_event boolean not null default false,
  request_payload_hash text,
  provider_event_id text,
  queued_at timestamptz,
  processing_started_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_tracking_deliveries_status_check
    check (status in ('pending', 'processing', 'sent', 'failed', 'retrying', 'ignored', 'cancelled')),
  constraint external_tracking_deliveries_provider_check
    check (provider in ('meta_pixel', 'meta_capi', 'ga4', 'gtm')),
  constraint external_tracking_deliveries_channel_check
    check (channel in ('browser', 'server')),
  constraint external_tracking_deliveries_attempt_check
    check (attempt >= 0),
  constraint external_tracking_deliveries_event_id_length_check
    check (length(event_id) <= 160),
  constraint external_tracking_deliveries_payload_hash_length_check
    check (request_payload_hash is null or length(request_payload_hash) <= 64)
);

create unique index if not exists external_tracking_deliveries_event_provider_channel_unique
on public.external_tracking_deliveries(event_id, provider, channel);

create index if not exists external_tracking_deliveries_tracking_event_id_idx
on public.external_tracking_deliveries(tracking_event_id);

create index if not exists external_tracking_deliveries_lead_id_idx
on public.external_tracking_deliveries(lead_id);

create index if not exists external_tracking_deliveries_session_id_idx
on public.external_tracking_deliveries(session_id);

create index if not exists external_tracking_deliveries_result_id_idx
on public.external_tracking_deliveries(result_id);

create index if not exists external_tracking_deliveries_status_idx
on public.external_tracking_deliveries(status, provider, channel);

create index if not exists external_tracking_deliveries_created_at_idx
on public.external_tracking_deliveries(created_at desc);

drop trigger if exists set_external_tracking_deliveries_updated_at
on public.external_tracking_deliveries;

create trigger set_external_tracking_deliveries_updated_at
before update on public.external_tracking_deliveries
for each row
execute function public.set_updated_at();

alter table public.external_tracking_deliveries enable row level security;

drop policy if exists "Block public direct access to external_tracking_deliveries"
on public.external_tracking_deliveries;

create policy "Block public direct access to external_tracking_deliveries"
on public.external_tracking_deliveries
for all
to anon, authenticated
using (false)
with check (false);

comment on table public.external_tracking_deliveries is
  'External tracking delivery audit records for Meta Pixel, Meta CAPI, GA4, and GTM. Public direct access is blocked by RLS.';

comment on column public.external_tracking_deliveries.event_id is
  'Shared browser/server event identifier used for provider deduplication. Must not contain PII.';

comment on column public.external_tracking_deliveries.request_payload_hash is
  'SHA-256 hash of sanitized provider payload for idempotency/audit. Do not store raw external payload or PII.';

comment on column public.external_tracking_deliveries.last_error is
  'Sanitized provider or orchestration error. Do not store stack traces, tokens, raw payloads, or PII.';
