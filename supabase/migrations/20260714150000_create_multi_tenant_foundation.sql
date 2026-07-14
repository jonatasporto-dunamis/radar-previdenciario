create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text not null,
  status text not null default 'active',
  is_default boolean not null default false,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenants_slug_format_check
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint tenants_status_check
    check (status in ('active', 'inactive', 'suspended')),
  constraint tenants_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create unique index if not exists tenants_single_default_unique
on public.tenants (is_default)
where is_default;

create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  hostname text not null unique,
  is_primary boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_domains_hostname_format_check
    check (
      hostname = lower(hostname)
      and hostname !~ '[:/]'
      and hostname ~ '^[a-z0-9.-]+$'
    ),
  constraint tenant_domains_status_check
    check (status in ('active', 'inactive')),
  constraint tenant_domains_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create unique index if not exists tenant_domains_single_primary_unique
on public.tenant_domains (tenant_id)
where is_primary;

create table if not exists public.tenant_tracking_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete restrict,
  enabled boolean not null default false,
  consent_required boolean not null default true,
  external_tracking_dry_run boolean not null default true,
  meta_enabled boolean not null default false,
  meta_pixel_id text,
  meta_api_version text not null default 'v25.0',
  meta_test_mode boolean not null default false,
  ga4_enabled boolean not null default false,
  ga4_measurement_id text,
  gtm_enabled boolean not null default false,
  gtm_container_id text,
  event_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_tracking_configs_meta_pixel_id_check
    check (meta_pixel_id is null or meta_pixel_id ~ '^[0-9]+$'),
  constraint tenant_tracking_configs_meta_api_version_check
    check (meta_api_version ~ '^v[0-9]+\.[0-9]+$'),
  constraint tenant_tracking_configs_ga4_measurement_id_check
    check (ga4_measurement_id is null or ga4_measurement_id ~ '^G-[A-Z0-9]+$'),
  constraint tenant_tracking_configs_gtm_container_id_check
    check (gtm_container_id is null or gtm_container_id ~ '^GTM-[A-Z0-9]+$'),
  constraint tenant_tracking_configs_event_config_object_check
    check (jsonb_typeof(event_config) = 'object')
);

create table if not exists public.tenant_secrets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  secret_key text not null,
  encrypted_value text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_secrets_key_format_check
    check (secret_key = lower(secret_key) and secret_key ~ '^[a-z0-9_]+$'),
  constraint tenant_secrets_status_check
    check (status in ('active', 'inactive', 'rotated')),
  constraint tenant_secrets_encrypted_value_check
    check (encrypted_value like 'v1:%')
);

create unique index if not exists tenant_secrets_tenant_key_unique
on public.tenant_secrets (tenant_id, secret_key)
where status = 'active';

insert into public.tenants (
  slug,
  name,
  legal_name,
  status,
  is_default,
  timezone,
  locale,
  metadata
)
values (
  'resende-advogados',
  'Resende Advogados Associados',
  'Resende Advogados Associados',
  'active',
  true,
  'America/Bahia',
  'pt-BR',
  '{"source":"migration","role":"default_mvp_tenant"}'::jsonb
)
on conflict (slug) do update
set
  name = excluded.name,
  legal_name = excluded.legal_name,
  status = excluded.status,
  is_default = true,
  timezone = excluded.timezone,
  locale = excluded.locale,
  updated_at = now();

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
insert into public.tenant_domains (tenant_id, hostname, is_primary, status)
select id, hostname, is_primary, 'active'
from default_tenant
cross join (
  values
    ('radarprevidenciario.com.br', true),
    ('www.radarprevidenciario.com.br', false),
    ('radar-previdenciario.vercel.app', false)
) as domains(hostname, is_primary)
on conflict (hostname) do update
set
  tenant_id = excluded.tenant_id,
  is_primary = excluded.is_primary,
  status = 'active',
  updated_at = now();

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
insert into public.tenant_tracking_configs (
  tenant_id,
  enabled,
  consent_required,
  external_tracking_dry_run,
  meta_enabled,
  meta_api_version,
  meta_test_mode,
  ga4_enabled,
  gtm_enabled,
  event_config
)
select
  id,
  false,
  true,
  true,
  false,
  'v25.0',
  false,
  false,
  false,
  '{}'::jsonb
from default_tenant
on conflict (tenant_id) do nothing;

alter table public.leads
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.quiz_sessions
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.quiz_answers
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.quiz_results
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.tracking_events
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.notification_logs
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

alter table public.external_tracking_deliveries
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.leads
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.quiz_sessions
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.quiz_answers
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.quiz_results
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.tracking_events
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.notification_logs
set tenant_id = (select id from default_tenant)
where tenant_id is null;

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
update public.external_tracking_deliveries
set tenant_id = (select id from default_tenant)
where tenant_id is null;

alter table public.leads
  alter column tenant_id set not null;

alter table public.quiz_sessions
  alter column tenant_id set not null;

alter table public.quiz_answers
  alter column tenant_id set not null;

alter table public.quiz_results
  alter column tenant_id set not null;

alter table public.tracking_events
  alter column tenant_id set not null;

alter table public.notification_logs
  alter column tenant_id set not null;

alter table public.external_tracking_deliveries
  alter column tenant_id set not null;

create index if not exists tenant_domains_tenant_id_idx
on public.tenant_domains (tenant_id);

create index if not exists tenant_domains_hostname_status_idx
on public.tenant_domains (hostname, status);

create index if not exists tenant_tracking_configs_tenant_id_idx
on public.tenant_tracking_configs (tenant_id);

create index if not exists tenant_secrets_tenant_id_idx
on public.tenant_secrets (tenant_id);

create index if not exists leads_tenant_id_idx
on public.leads (tenant_id);

create index if not exists leads_tenant_phone_created_at_idx
on public.leads (tenant_id, phone, created_at desc);

create index if not exists quiz_sessions_tenant_lead_status_idx
on public.quiz_sessions (tenant_id, lead_id, status, created_at desc);

create index if not exists quiz_answers_tenant_session_question_idx
on public.quiz_answers (tenant_id, session_id, question_id);

create index if not exists quiz_results_tenant_lead_created_at_idx
on public.quiz_results (tenant_id, lead_id, created_at desc);

create index if not exists tracking_events_tenant_event_name_idx
on public.tracking_events (tenant_id, event_name, created_at desc);

create index if not exists tracking_events_tenant_lead_idx
on public.tracking_events (tenant_id, lead_id);

create index if not exists notification_logs_tenant_status_idx
on public.notification_logs (tenant_id, status, priority, created_at);

create index if not exists external_tracking_deliveries_tenant_status_idx
on public.external_tracking_deliveries (tenant_id, status, provider, channel);

drop index if exists public.notification_logs_payload_hash_provider_unique;

create unique index if not exists notification_logs_tenant_payload_hash_provider_unique
on public.notification_logs (tenant_id, provider, payload_hash)
where payload_hash is not null
  and status in ('pending', 'processing', 'retrying', 'sent');

drop index if exists public.external_tracking_deliveries_event_provider_channel_unique;

create unique index if not exists external_tracking_deliveries_tenant_event_provider_channel_unique
on public.external_tracking_deliveries (tenant_id, event_id, provider, channel);

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_domains_updated_at on public.tenant_domains;
create trigger set_tenant_domains_updated_at
before update on public.tenant_domains
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_tracking_configs_updated_at on public.tenant_tracking_configs;
create trigger set_tenant_tracking_configs_updated_at
before update on public.tenant_tracking_configs
for each row
execute function public.set_updated_at();

drop trigger if exists set_tenant_secrets_updated_at on public.tenant_secrets;
create trigger set_tenant_secrets_updated_at
before update on public.tenant_secrets
for each row
execute function public.set_updated_at();

alter table public.tenants enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.tenant_tracking_configs enable row level security;
alter table public.tenant_secrets enable row level security;

drop policy if exists "Block public direct access to tenants"
on public.tenants;

create policy "Block public direct access to tenants"
on public.tenants
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to tenant_domains"
on public.tenant_domains;

create policy "Block public direct access to tenant_domains"
on public.tenant_domains
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to tenant_tracking_configs"
on public.tenant_tracking_configs;

create policy "Block public direct access to tenant_tracking_configs"
on public.tenant_tracking_configs
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to tenant_secrets"
on public.tenant_secrets;

create policy "Block public direct access to tenant_secrets"
on public.tenant_secrets
for all
to anon, authenticated
using (false)
with check (false);

comment on table public.tenants is
  'Tenant registry for the multi-office foundation. Public direct access is blocked by RLS.';

comment on table public.tenant_domains is
  'Hostname-to-tenant mapping. Localhost is resolved by application fallback and is not persisted.';

comment on table public.tenant_tracking_configs is
  'Public tracking identifiers and feature flags per tenant. Secret provider tokens must not be stored here.';

comment on table public.tenant_secrets is
  'Encrypted server-only tenant secrets. Values are encrypted by the application with TENANT_SECRETS_ENCRYPTION_KEY and public direct access is blocked by RLS.';
