alter table public.tenant_domains
  add column if not exists domain_type text,
  add column if not exists is_platform_subdomain boolean not null default false,
  add column if not exists verification_method text not null default 'manual',
  add column if not exists verification_token text,
  add column if not exists dns_instructions jsonb not null default '{}'::jsonb,
  add column if not exists provider_domain_id text,
  add column if not exists ssl_status text not null default 'unknown',
  add column if not exists verified_at timestamptz,
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_error text,
  add column if not exists created_by uuid;

update public.tenant_domains
set domain_type = case
  when is_platform_subdomain then 'platform_subdomain'
  else 'custom_domain'
end
where domain_type is null;

alter table public.tenant_domains
  alter column domain_type set default 'custom_domain',
  alter column domain_type set not null;

alter table public.tenant_domains
  drop constraint if exists tenant_domains_status_check;

alter table public.tenant_domains
  add constraint tenant_domains_status_check
  check (status in (
    'pending',
    'awaiting_dns',
    'verifying',
    'active',
    'failed',
    'disabled',
    'inactive'
  ));

alter table public.tenant_domains
  drop constraint if exists tenant_domains_domain_type_check;

alter table public.tenant_domains
  add constraint tenant_domains_domain_type_check
  check (domain_type in ('platform_subdomain', 'custom_domain'));

alter table public.tenant_domains
  drop constraint if exists tenant_domains_verification_method_check;

alter table public.tenant_domains
  add constraint tenant_domains_verification_method_check
  check (verification_method in ('manual', 'cname', 'txt', 'http'));

alter table public.tenant_domains
  drop constraint if exists tenant_domains_ssl_status_check;

alter table public.tenant_domains
  add constraint tenant_domains_ssl_status_check
  check (ssl_status in ('unknown', 'pending', 'provisioning', 'active', 'failed'));

alter table public.tenant_domains
  drop constraint if exists tenant_domains_dns_instructions_object_check;

alter table public.tenant_domains
  add constraint tenant_domains_dns_instructions_object_check
  check (jsonb_typeof(dns_instructions) = 'object');

alter table public.tenant_domains
  drop constraint if exists tenant_domains_no_wildcard_check;

alter table public.tenant_domains
  add constraint tenant_domains_no_wildcard_check
  check (hostname !~ '(^|\\.)\\*\\.');

alter table public.tenant_domains
  drop constraint if exists tenant_domains_platform_consistency_check;

alter table public.tenant_domains
  add constraint tenant_domains_platform_consistency_check
  check (
    (domain_type = 'platform_subdomain' and is_platform_subdomain)
    or (domain_type = 'custom_domain' and not is_platform_subdomain)
  );

create index if not exists tenant_domains_type_status_idx
on public.tenant_domains (tenant_id, domain_type, status);

create index if not exists tenant_domains_primary_status_idx
on public.tenant_domains (tenant_id, is_primary, status);

with default_tenant as (
  select id
  from public.tenants
  where slug = 'resende-advogados'
)
insert into public.tenant_domains (
  tenant_id,
  hostname,
  domain_type,
  is_platform_subdomain,
  is_primary,
  status,
  verification_method,
  dns_instructions,
  ssl_status,
  metadata
)
select
  id,
  'resende.radarprevidenciario.com.br',
  'platform_subdomain',
  true,
  false,
  'awaiting_dns',
  'cname',
  jsonb_build_object(
    'records',
    '[]'::jsonb,
    'notes',
    jsonb_build_array(
      'Aguardando provisionamento pela Vercel para gerar instrucoes oficiais de DNS.'
    )
  ),
  'pending',
  '{"source":"domain_management_rollout","requested_subdomain":"resende"}'::jsonb
from default_tenant
where not exists (
  select 1
  from public.tenant_domains
  where hostname = 'resende.radarprevidenciario.com.br'
);

comment on column public.tenant_domains.domain_type is
  'Classifies platform subdomains separately from custom tenant domains.';

comment on column public.tenant_domains.provider_domain_id is
  'Server-side provider reference for Vercel or future domain providers. Not exposed to browser clients.';

comment on column public.tenant_domains.dns_instructions is
  'Sanitized DNS records and operational notes safe for tenant administrators.';
