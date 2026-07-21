alter table public.office_audit_logs
  drop constraint if exists office_audit_logs_action_check;

alter table public.office_audit_logs
  add constraint office_audit_logs_action_check
    check (
      action in (
        'lead_status_changed',
        'lead_note_created',
        'lead_note_updated',
        'lead_note_deleted',
        'office_login',
        'office_logout',
        'template_cloned',
        'template_created',
        'template_updated',
        'template_published',
        'template_deactivated',
        'template_archived',
        'question_created',
        'question_updated',
        'question_removed',
        'template_version_created',
        'integration_created',
        'integration_updated',
        'integration_enabled',
        'integration_disabled',
        'integration_tested',
        'secret_rotated',
        'event_mapping_updated'
      )
    );

alter table public.office_audit_logs
  drop constraint if exists office_audit_logs_entity_type_check;

alter table public.office_audit_logs
  add constraint office_audit_logs_entity_type_check
    check (
      entity_type in (
        'lead',
        'lead_note',
        'membership',
        'session',
        'quiz_template',
        'quiz_template_question',
        'quiz_template_version',
        'tenant_integration',
        'tenant_integration_secret',
        'tenant_event_mapping',
        'integration_delivery_log',
        'integration_test_run'
      )
    );

create table if not exists public.tenant_integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  provider text not null,
  status text not null default 'configuration_required',
  enabled boolean not null default false,
  browser_tracking_enabled boolean not null default false,
  server_tracking_enabled boolean not null default false,
  test_mode boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  secret_reference text,
  last_tested_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_code text,
  last_error_summary text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_integrations_provider_check
    check (provider in ('meta', 'ga4', 'google_ads', 'tiktok')),
  constraint tenant_integrations_status_check
    check (
      status in (
        'connected',
        'configuration_required',
        'disconnected',
        'error',
        'test_pending'
      )
    ),
  constraint tenant_integrations_configuration_object_check
    check (jsonb_typeof(configuration) = 'object'),
  constraint tenant_integrations_last_error_summary_length_check
    check (last_error_summary is null or length(last_error_summary) <= 500)
);

create unique index if not exists tenant_integrations_tenant_provider_unique
on public.tenant_integrations (tenant_id, provider);

create index if not exists tenant_integrations_tenant_status_idx
on public.tenant_integrations (tenant_id, status, enabled);

create table if not exists public.tenant_integration_secrets (
  id uuid primary key default gen_random_uuid(),
  tenant_integration_id uuid not null references public.tenant_integrations(id) on delete cascade,
  encrypted_payload text not null,
  encryption_version text not null default 'v1',
  key_version text not null default 'v1',
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint tenant_integration_secrets_payload_check
    check (encrypted_payload like 'v1:%'),
  constraint tenant_integration_secrets_encryption_version_check
    check (encryption_version ~ '^v[0-9]+$'),
  constraint tenant_integration_secrets_key_version_check
    check (key_version ~ '^v[0-9]+$')
);

create unique index if not exists tenant_integration_secrets_integration_unique
on public.tenant_integration_secrets (tenant_integration_id);

create table if not exists public.tenant_event_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  provider text not null,
  internal_event text not null,
  external_event text not null,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  value_source text not null default 'none',
  currency text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_event_mappings_provider_check
    check (provider in ('meta', 'ga4', 'google_ads', 'tiktok')),
  constraint tenant_event_mappings_internal_event_check
    check (
      internal_event in (
        'PageViewed',
        'PageView',
        'LeadSubmitted',
        'QuizStarted',
        'QuestionAnswered',
        'QuizCompleted',
        'ResultGenerated',
        'ResultViewed',
        'LeadQualified',
        'QualifiedLead',
        'ContactStarted',
        'LeadStatusChanged',
        'LeadConverted',
        'Purchase',
        'WhatsAppClick'
      )
    ),
  constraint tenant_event_mappings_external_event_length_check
    check (length(external_event) between 1 and 120),
  constraint tenant_event_mappings_configuration_object_check
    check (jsonb_typeof(configuration) = 'object'),
  constraint tenant_event_mappings_value_source_check
    check (value_source in ('none', 'fixed', 'lead_value', 'conversion_value')),
  constraint tenant_event_mappings_currency_check
    check (currency ~ '^[A-Z]{3}$')
);

create unique index if not exists tenant_event_mappings_tenant_provider_event_unique
on public.tenant_event_mappings (tenant_id, provider, internal_event);

create index if not exists tenant_event_mappings_tenant_provider_idx
on public.tenant_event_mappings (tenant_id, provider, enabled);

create table if not exists public.integration_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  provider text not null,
  internal_event_id uuid references public.tracking_events(id) on delete set null,
  event_id text not null,
  external_event text not null,
  status text not null default 'pending',
  attempt integer not null default 0,
  response_code integer,
  error_code text,
  sanitized_error text,
  external_request_id text,
  test_mode boolean not null default true,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  constraint integration_delivery_logs_provider_check
    check (provider in ('meta', 'ga4', 'google_ads', 'tiktok')),
  constraint integration_delivery_logs_status_check
    check (
      status in (
        'pending',
        'processing',
        'sent',
        'failed',
        'retrying',
        'ignored',
        'cancelled',
        'dead_letter'
      )
    ),
  constraint integration_delivery_logs_event_id_length_check
    check (length(event_id) <= 160),
  constraint integration_delivery_logs_external_event_length_check
    check (length(external_event) <= 120),
  constraint integration_delivery_logs_attempt_check
    check (attempt >= 0),
  constraint integration_delivery_logs_response_code_check
    check (response_code is null or response_code between 100 and 599),
  constraint integration_delivery_logs_sanitized_error_length_check
    check (sanitized_error is null or length(sanitized_error) <= 500)
);

create unique index if not exists integration_delivery_logs_tenant_provider_event_unique
on public.integration_delivery_logs (tenant_id, provider, event_id, external_event);

create index if not exists integration_delivery_logs_tenant_status_idx
on public.integration_delivery_logs (tenant_id, provider, status, created_at desc);

create table if not exists public.integration_test_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  provider text not null,
  status text not null default 'pending',
  test_type text not null default 'connection',
  sanitized_result jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint integration_test_runs_provider_check
    check (provider in ('meta', 'ga4', 'google_ads', 'tiktok')),
  constraint integration_test_runs_status_check
    check (status in ('pending', 'success', 'failed', 'configuration_required')),
  constraint integration_test_runs_test_type_check
    check (test_type in ('connection', 'browser', 'server', 'mapping')),
  constraint integration_test_runs_result_object_check
    check (jsonb_typeof(sanitized_result) = 'object')
);

create index if not exists integration_test_runs_tenant_provider_idx
on public.integration_test_runs (tenant_id, provider, created_at desc);

drop trigger if exists set_tenant_integrations_updated_at
on public.tenant_integrations;
create trigger set_tenant_integrations_updated_at
before update on public.tenant_integrations
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_integration_secrets_updated_at
on public.tenant_integration_secrets;
create trigger set_tenant_integration_secrets_updated_at
before update on public.tenant_integration_secrets
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_event_mappings_updated_at
on public.tenant_event_mappings;
create trigger set_tenant_event_mappings_updated_at
before update on public.tenant_event_mappings
for each row
execute function public.set_updated_at();

alter table public.tenant_integrations enable row level security;
alter table public.tenant_integration_secrets enable row level security;
alter table public.tenant_event_mappings enable row level security;
alter table public.integration_delivery_logs enable row level security;
alter table public.integration_test_runs enable row level security;

drop policy if exists "Block public direct access to tenant_integrations"
on public.tenant_integrations;
create policy "Block public direct access to tenant_integrations"
on public.tenant_integrations
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to tenant_integration_secrets"
on public.tenant_integration_secrets;
create policy "Block public direct access to tenant_integration_secrets"
on public.tenant_integration_secrets
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to tenant_event_mappings"
on public.tenant_event_mappings;
create policy "Block public direct access to tenant_event_mappings"
on public.tenant_event_mappings
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to integration_delivery_logs"
on public.integration_delivery_logs;
create policy "Block public direct access to integration_delivery_logs"
on public.integration_delivery_logs
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to integration_test_runs"
on public.integration_test_runs;
create policy "Block public direct access to integration_test_runs"
on public.integration_test_runs
for all
to anon, authenticated
using (false)
with check (false);

with providers(provider) as (
  values
    ('meta'),
    ('ga4'),
    ('google_ads'),
    ('tiktok')
)
insert into public.tenant_integrations (
  tenant_id,
  provider,
  status,
  enabled,
  browser_tracking_enabled,
  server_tracking_enabled,
  test_mode,
  configuration
)
select
  t.id,
  p.provider,
  'configuration_required',
  false,
  false,
  false,
  true,
  '{}'::jsonb
from public.tenants t
cross join providers p
where t.status = 'active'
on conflict (tenant_id, provider) do nothing;

with defaults(provider, internal_event, external_event, enabled) as (
  values
    ('meta', 'PageViewed', 'PageView', true),
    ('meta', 'LeadSubmitted', 'Lead', true),
    ('meta', 'QuizCompleted', 'CompleteRegistration', true),
    ('meta', 'ContactStarted', 'Contact', false),
    ('meta', 'LeadConverted', 'Purchase', false),
    ('ga4', 'PageViewed', 'page_view', true),
    ('ga4', 'LeadSubmitted', 'generate_lead', true),
    ('ga4', 'QuizStarted', 'quiz_start', true),
    ('ga4', 'QuizCompleted', 'quiz_complete', true),
    ('ga4', 'ResultViewed', 'result_view', true),
    ('ga4', 'LeadConverted', 'lead_converted', false),
    ('google_ads', 'LeadSubmitted', 'Lead', false),
    ('google_ads', 'LeadQualified', 'Qualified Lead', false),
    ('google_ads', 'LeadConverted', 'Conversion', false),
    ('tiktok', 'PageViewed', 'PageView', true),
    ('tiktok', 'LeadSubmitted', 'SubmitForm', true),
    ('tiktok', 'QuizCompleted', 'CompleteRegistration', true),
    ('tiktok', 'ContactStarted', 'Contact', false),
    ('tiktok', 'LeadConverted', 'CompletePayment', false)
)
insert into public.tenant_event_mappings (
  tenant_id,
  provider,
  internal_event,
  external_event,
  enabled,
  configuration,
  value_source,
  currency
)
select
  t.id,
  d.provider,
  d.internal_event,
  d.external_event,
  d.enabled,
  '{}'::jsonb,
  'none',
  'BRL'
from public.tenants t
cross join defaults d
where t.status = 'active'
on conflict (tenant_id, provider, internal_event) do nothing;

comment on table public.tenant_integrations is
  'Per-tenant external tracking integration configuration. Secrets are stored separately and never returned to the browser.';

comment on table public.tenant_integration_secrets is
  'Encrypted server-only integration credentials. Values are AES-256-GCM encrypted by the application and direct public access is blocked.';

comment on table public.tenant_event_mappings is
  'Per-tenant mapping between internal Radar events and provider events.';

comment on table public.integration_delivery_logs is
  'Sanitized delivery diagnostics for external integrations. Raw payloads and PII must not be stored here.';

comment on table public.integration_test_runs is
  'Sanitized integration test diagnostics for the office dashboard.';
