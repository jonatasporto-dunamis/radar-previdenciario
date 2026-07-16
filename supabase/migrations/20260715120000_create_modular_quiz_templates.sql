create table if not exists public.quiz_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete restrict,
  slug text not null,
  name text not null,
  description text not null,
  template_type text not null,
  source text not null,
  status text not null default 'draft',
  version integer not null default 1,
  is_default boolean not null default false,
  category text not null default 'previdenciario',
  audience text,
  ownership text not null default 'platform_managed',
  created_by_user_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_templates_slug_format_check
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint quiz_templates_template_type_check
    check (template_type in ('general', 'maternity', 'fibromyalgia', 'depression', 'autism', 'custom')),
  constraint quiz_templates_source_check
    check (source in ('platform', 'tenant')),
  constraint quiz_templates_status_check
    check (status in ('draft', 'active', 'inactive', 'archived')),
  constraint quiz_templates_ownership_check
    check (ownership in ('platform_managed', 'tenant_managed')),
  constraint quiz_templates_platform_tenant_check
    check (
      (source = 'platform' and tenant_id is null and ownership = 'platform_managed')
      or (source = 'tenant' and tenant_id is not null and ownership = 'tenant_managed')
    ),
  constraint quiz_templates_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.quiz_template_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_template_id uuid not null references public.quiz_templates(id) on delete cascade,
  question_key text not null,
  title text not null,
  description text,
  question_type text not null,
  is_required boolean not null default false,
  is_sensitive boolean not null default false,
  allows_unknown boolean not null default false,
  allows_withheld boolean not null default false,
  display_order integer not null,
  options jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_template_questions_key_format_check
    check (question_key = lower(question_key) and question_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint quiz_template_questions_type_check
    check (question_type in ('text', 'textarea', 'number', 'currency', 'date', 'boolean', 'radio', 'checkbox', 'select', 'cpf', 'phone', 'email')),
  constraint quiz_template_questions_options_array_check
    check (jsonb_typeof(options) = 'array'),
  constraint quiz_template_questions_conditions_array_check
    check (jsonb_typeof(conditions) = 'array'),
  constraint quiz_template_questions_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.quiz_template_rules (
  id uuid primary key default gen_random_uuid(),
  quiz_template_id uuid not null references public.quiz_templates(id) on delete cascade,
  rule_key text not null,
  rule_type text not null default 'score',
  conditions jsonb not null default '[]'::jsonb,
  effects jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_template_rules_key_format_check
    check (rule_key = lower(rule_key) and rule_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint quiz_template_rules_type_check
    check (rule_type in ('score', 'topic', 'completeness')),
  constraint quiz_template_rules_status_check
    check (status in ('draft', 'active', 'inactive', 'archived')),
  constraint quiz_template_rules_conditions_array_check
    check (jsonb_typeof(conditions) = 'array'),
  constraint quiz_template_rules_effects_object_check
    check (jsonb_typeof(effects) = 'object')
);

create table if not exists public.quiz_template_versions (
  id uuid primary key default gen_random_uuid(),
  quiz_template_id uuid not null references public.quiz_templates(id) on delete cascade,
  version integer not null,
  status text not null default 'draft',
  snapshot jsonb not null,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  constraint quiz_template_versions_status_check
    check (status in ('draft', 'active', 'inactive', 'archived')),
  constraint quiz_template_versions_snapshot_object_check
    check (jsonb_typeof(snapshot) = 'object')
);

create unique index if not exists quiz_templates_platform_slug_version_unique
on public.quiz_templates (slug, version)
where source = 'platform' and tenant_id is null;

create unique index if not exists quiz_templates_tenant_slug_version_unique
on public.quiz_templates (tenant_id, slug, version)
where source = 'tenant' and tenant_id is not null;

create unique index if not exists quiz_templates_single_platform_default_unique
on public.quiz_templates (is_default)
where source = 'platform' and is_default;

create unique index if not exists quiz_template_questions_template_key_unique
on public.quiz_template_questions (quiz_template_id, question_key);

create index if not exists quiz_template_questions_template_order_idx
on public.quiz_template_questions (quiz_template_id, display_order);

create unique index if not exists quiz_template_rules_template_key_unique
on public.quiz_template_rules (quiz_template_id, rule_key);

create unique index if not exists quiz_template_versions_template_version_unique
on public.quiz_template_versions (quiz_template_id, version);

alter table public.quiz_sessions
  add column if not exists quiz_template_id uuid references public.quiz_templates(id) on delete restrict,
  add column if not exists quiz_template_version integer,
  add column if not exists template_type text;

alter table public.quiz_results
  add column if not exists quiz_template_id uuid references public.quiz_templates(id) on delete restrict,
  add column if not exists quiz_template_version integer,
  add column if not exists template_type text,
  add column if not exists topic text,
  add column if not exists data_completeness text not null default 'insufficient',
  add column if not exists missing_critical_answers jsonb not null default '[]'::jsonb,
  add column if not exists requires_human_review boolean not null default false,
  add column if not exists matched_rules jsonb not null default '[]'::jsonb;

alter table public.quiz_sessions
  drop constraint if exists quiz_sessions_template_type_check;

alter table public.quiz_sessions
  add constraint quiz_sessions_template_type_check
  check (template_type is null or template_type in ('general', 'maternity', 'fibromyalgia', 'depression', 'autism', 'custom'));

alter table public.quiz_results
  drop constraint if exists quiz_results_template_type_check,
  drop constraint if exists quiz_results_data_completeness_check,
  drop constraint if exists quiz_results_missing_critical_answers_array_check,
  drop constraint if exists quiz_results_matched_rules_array_check;

alter table public.quiz_results
  add constraint quiz_results_template_type_check
    check (template_type is null or template_type in ('general', 'maternity', 'fibromyalgia', 'depression', 'autism', 'custom')),
  add constraint quiz_results_data_completeness_check
    check (data_completeness in ('complete', 'partial', 'insufficient')),
  add constraint quiz_results_missing_critical_answers_array_check
    check (jsonb_typeof(missing_critical_answers) = 'array'),
  add constraint quiz_results_matched_rules_array_check
    check (jsonb_typeof(matched_rules) = 'array');

create index if not exists quiz_sessions_template_idx
on public.quiz_sessions (tenant_id, quiz_template_id, status, created_at desc);

create index if not exists quiz_results_template_idx
on public.quiz_results (tenant_id, quiz_template_id, created_at desc);

drop trigger if exists set_quiz_templates_updated_at on public.quiz_templates;
create trigger set_quiz_templates_updated_at
before update on public.quiz_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_quiz_template_questions_updated_at on public.quiz_template_questions;
create trigger set_quiz_template_questions_updated_at
before update on public.quiz_template_questions
for each row
execute function public.set_updated_at();

drop trigger if exists set_quiz_template_rules_updated_at on public.quiz_template_rules;
create trigger set_quiz_template_rules_updated_at
before update on public.quiz_template_rules
for each row
execute function public.set_updated_at();

alter table public.quiz_templates enable row level security;
alter table public.quiz_template_questions enable row level security;
alter table public.quiz_template_rules enable row level security;
alter table public.quiz_template_versions enable row level security;

drop policy if exists "Block public direct access to quiz_templates"
on public.quiz_templates;
create policy "Block public direct access to quiz_templates"
on public.quiz_templates
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to quiz_template_questions"
on public.quiz_template_questions;
create policy "Block public direct access to quiz_template_questions"
on public.quiz_template_questions
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to quiz_template_rules"
on public.quiz_template_rules;
create policy "Block public direct access to quiz_template_rules"
on public.quiz_template_rules
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Block public direct access to quiz_template_versions"
on public.quiz_template_versions;
create policy "Block public direct access to quiz_template_versions"
on public.quiz_template_versions
for all
to anon, authenticated
using (false)
with check (false);

insert into public.quiz_templates (
  id,
  slug,
  name,
  description,
  template_type,
  source,
  status,
  version,
  is_default,
  category,
  audience,
  ownership,
  metadata
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'geral',
    'Triagem previdenciária geral',
    'Porta de entrada para identificar o assunto previdenciário e organizar informações mínimas.',
    'general',
    'platform',
    'active',
    1,
    true,
    'previdenciario',
    'Pessoas que buscam orientação inicial sobre tema previdenciário.',
    'platform_managed',
    '{"managed_by":"radar_previdenciario"}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'salario-maternidade',
    'Triagem de salário-maternidade',
    'Organiza informações preliminares relacionadas a salário-maternidade.',
    'maternity',
    'platform',
    'active',
    1,
    false,
    'beneficio',
    'Pessoas com situação relacionada a nascimento, adoção ou evento equiparado.',
    'platform_managed',
    '{"managed_by":"radar_previdenciario"}'::jsonb
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'fibromialgia',
    'Triagem relacionada à fibromialgia',
    'Organiza informações preliminares sobre impactos funcionais relatados, sem diagnóstico ou conclusão de incapacidade.',
    'fibromyalgia',
    'platform',
    'active',
    1,
    false,
    'saude',
    'Pessoas que relatam fibromialgia ou acompanhamento relacionado.',
    'platform_managed',
    '{"managed_by":"radar_previdenciario","sensitive":true}'::jsonb
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'depressao',
    'Triagem relacionada à depressão',
    'Organiza informações preliminares sobre impactos funcionais relacionados à saúde mental, sem avaliar diagnóstico ou gravidade clínica.',
    'depression',
    'platform',
    'active',
    1,
    false,
    'saude',
    'Pessoas que informam acompanhamento ou impactos relacionados à saúde mental.',
    'platform_managed',
    '{"managed_by":"radar_previdenciario","sensitive":true}'::jsonb
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'autismo',
    'Triagem relacionada ao autismo',
    'Organiza informações para análise relacionada a BPC, dependentes e outros temas pertinentes, sem solicitar dados completos de terceiro.',
    'autism',
    'platform',
    'active',
    1,
    false,
    'saude-familia',
    'Pessoas que buscam organizar informações sobre si, filho, dependente ou pessoa sob responsabilidade.',
    'platform_managed',
    '{"managed_by":"radar_previdenciario","sensitive":true}'::jsonb
  )
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  template_type = excluded.template_type,
  source = excluded.source,
  status = excluded.status,
  version = excluded.version,
  is_default = excluded.is_default,
  category = excluded.category,
  audience = excluded.audience,
  ownership = excluded.ownership,
  metadata = excluded.metadata,
  updated_at = now();

comment on table public.quiz_templates is
  'Versioned quiz templates. Platform templates are tenant_id null; tenant templates are scoped by tenant_id. Public direct access is blocked by RLS.';

comment on table public.quiz_template_questions is
  'Questions belonging to a quiz template. Access inherits from the parent template through server-only services.';

comment on table public.quiz_template_rules is
  'Operational rules belonging to a quiz template. Rules qualify leads and do not produce legal opinions.';

comment on table public.quiz_template_versions is
  'Published snapshots for quiz template versioning without overwriting historical versions.';
