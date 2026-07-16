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


-- Seed platform quiz template questions, rules, and version snapshots.
delete from public.quiz_template_versions
where quiz_template_id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555');

delete from public.quiz_template_rules
where quiz_template_id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555');

delete from public.quiz_template_questions
where quiz_template_id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555');

insert into public.quiz_template_questions (
  quiz_template_id,
  question_key,
  title,
  description,
  question_type,
  is_required,
  is_sensitive,
  allows_unknown,
  allows_withheld,
  display_order,
  options,
  conditions,
  metadata
)
values
  ('11111111-1111-4111-8111-111111111111', 'general-main-situation', 'Qual é a principal situação que motivou sua busca?', 'Escolha a alternativa que melhor organiza o tema. Se não souber, use a opção de dúvida.', 'radio', true, false, true, false, 10, '[{"value":"retirement","label":"Aposentadoria"},{"value":"disability","label":"Benefício por incapacidade"},{"value":"maternity","label":"Salário-maternidade"},{"value":"bpc","label":"BPC/LOAS"},{"value":"death_pension","label":"Pensão por morte"},{"value":"dependent_disability","label":"Benefício relacionado a dependente com deficiência"},{"value":"denied_or_suspended","label":"Benefício negado ou suspenso"},{"value":"rural_worker","label":"Trabalhador rural"},{"value":"review","label":"Revisão de benefício"},{"value":"other","label":"Outro tema"}]'::jsonb, '[]'::jsonb, '{"slug":"situacao-principal","version":1,"benefits":["aposentadoria","incapacidade","salario-maternidade","assistencial","pensao","autismo"],"next":"general-inss-request","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'general-inss-request', 'Você já possui pedido no INSS relacionado a essa situação?', null, 'radio', true, false, true, true, 20, '[{"value":"pending","label":"Sim, está em análise"},{"value":"approved","label":"Sim, foi aprovado"},{"value":"denied","label":"Sim, foi negado"},{"value":"ceased_or_suspended","label":"Sim, foi cessado ou suspenso"},{"value":"not_requested","label":"Ainda não fiz pedido"}]'::jsonb, '[]'::jsonb, '{"slug":"pedido-inss","version":1,"benefits":["aposentadoria","incapacidade","assistencial"],"next":"general-affiliation","previous":"general-main-situation","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{}}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'general-affiliation', 'Você possui ou já possuiu contribuições, vínculo de emprego, atividade rural ou outra forma de filiação ao INSS?', null, 'radio', true, false, true, true, 30, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"filiacao-inss","version":1,"benefits":["aposentadoria","incapacidade","salario-maternidade"],"next":"general-recent-event","previous":"general-inss-request","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{}}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'general-recent-event', 'Existe alguma data, evento ou mudança recente relacionada ao caso?', 'Não é necessário anexar documentos nesta etapa.', 'radio', false, false, true, false, 40, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"evento-recente","version":1,"benefits":["salario-maternidade","incapacidade","pensao"],"next":"general-documents-available","previous":"general-affiliation","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'general-documents-available', 'Há documentos ou informações que poderão ser apresentados posteriormente?', 'Não solicite upload nem informe dados completos de terceiros.', 'radio', false, false, true, false, 50, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"documentos-disponiveis","version":1,"benefits":["aposentadoria","incapacidade","assistencial"],"previous":"general-recent-event","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-related-situation', 'Qual situação está relacionada ao pedido?', null, 'radio', true, false, true, true, 10, '[{"value":"birth","label":"Nascimento"},{"value":"adoption","label":"Adoção"},{"value":"judicial_guard","label":"Guarda judicial para fins de adoção"},{"value":"non_criminal_abortion","label":"Aborto não criminoso"}]'::jsonb, '[]'::jsonb, '{"slug":"situacao-salario-maternidade","version":1,"benefits":["salario-maternidade"],"next":"maternity-event-timing","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-event-timing', 'Qual foi ou será a data aproximada do evento?', 'Informe apenas a situação geral. A data exata e documentos podem ser avaliados depois.', 'radio', false, false, true, true, 20, '[{"value":"already_happened","label":"Já ocorreu"},{"value":"will_happen","label":"Ainda não ocorreu"}]'::jsonb, '[]'::jsonb, '{"slug":"data-evento-salario-maternidade","version":1,"benefits":["salario-maternidade"],"next":"maternity-work-status","previous":"maternity-related-situation","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-work-status', 'Na época do evento, qual era a sua situação de trabalho ou contribuição?', null, 'radio', true, false, true, false, 30, '[{"value":"employee","label":"Empregada com carteira"},{"value":"domestic_worker","label":"Trabalhadora doméstica"},{"value":"individual_taxpayer","label":"Contribuinte individual"},{"value":"mei","label":"MEI"},{"value":"optional_insured","label":"Segurada facultativa"},{"value":"rural_worker","label":"Trabalhadora rural"},{"value":"unemployed","label":"Desempregada"},{"value":"other","label":"Outra"}]'::jsonb, '[]'::jsonb, '{"slug":"situacao-trabalho-salario-maternidade","version":1,"benefits":["salario-maternidade"],"next":"maternity-recent-contributions","previous":"maternity-event-timing","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-recent-contributions', 'Houve contribuições recentes ao INSS?', null, 'radio', false, false, true, true, 40, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"contribuicoes-recentes","version":1,"benefits":["salario-maternidade"],"next":"maternity-inss-request","previous":"maternity-work-status","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-inss-request', 'Já houve pedido no INSS?', null, 'radio', true, false, true, false, 50, '[{"value":"not_requested","label":"Não"},{"value":"pending","label":"Em análise"},{"value":"approved","label":"Aprovado"},{"value":"denied","label":"Negado"}]'::jsonb, '[]'::jsonb, '{"slug":"pedido-inss-salario-maternidade","version":1,"benefits":["salario-maternidade"],"next":"maternity-denial-reason","previous":"maternity-recent-contributions","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'maternity-denial-reason', 'Em caso de negativa, existe informação sobre o motivo?', null, 'radio', false, false, true, false, 60, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"motivo-negativa-salario-maternidade","version":1,"benefits":["salario-maternidade"],"previous":"maternity-inss-request","answerStateOptions":["unknown","not_applicable"],"active":true,"metadata":{}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-diagnosis-context', 'Você informa possuir diagnóstico ou acompanhamento relacionado à fibromialgia?', 'Não informe detalhes médicos, laudos ou exames nesta etapa.', 'radio', true, true, true, true, 10, '[{"value":"professional_diagnosis","label":"Possuo diagnóstico informado por profissional de saúde"},{"value":"under_investigation","label":"Estou em investigação ou acompanhamento"},{"value":"no_diagnosis","label":"Não possuo diagnóstico"}]'::jsonb, '[]'::jsonb, '{"slug":"contexto-fibromialgia","version":1,"benefits":["fibromialgia","incapacidade","assistencial"],"next":"fibromyalgia-functional-impact","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-functional-impact', 'A condição tem afetado suas atividades habituais ou de trabalho?', null, 'radio', true, true, true, true, 20, '[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"impacto-funcional-fibromialgia","version":1,"benefits":["fibromialgia","incapacidade"],"next":"fibromyalgia-limitation-duration","previous":"fibromyalgia-diagnosis-context","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-limitation-duration', 'Há quanto tempo essa limitação é percebida?', null, 'radio', false, true, true, true, 30, '[{"value":"less_than_3_months","label":"Menos de 3 meses"},{"value":"3_to_6_months","label":"Entre 3 e 6 meses"},{"value":"6_to_12_months","label":"Entre 6 e 12 meses"},{"value":"more_than_12_months","label":"Mais de 12 meses"}]'::jsonb, '[]'::jsonb, '{"slug":"tempo-limitacao-fibromialgia","version":1,"benefits":["fibromialgia","incapacidade"],"next":"fibromyalgia-current-care","previous":"fibromyalgia-functional-impact","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-current-care', 'Existe acompanhamento médico atual?', null, 'radio', false, true, true, true, 40, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"acompanhamento-fibromialgia","version":1,"benefits":["fibromialgia"],"next":"fibromyalgia-documents","previous":"fibromyalgia-limitation-duration","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-documents', 'Existem relatórios, exames, receitas ou outros registros que poderão ser apresentados posteriormente?', 'Não envie nem transcreva conteúdo dos documentos agora.', 'radio', true, true, true, true, 50, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"documentos-fibromialgia","version":1,"benefits":["fibromialgia","incapacidade","assistencial"],"next":"fibromyalgia-inss-history","previous":"fibromyalgia-current-care","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-inss-history', 'Houve afastamento do trabalho ou pedido no INSS?', null, 'radio', false, false, true, false, 60, '[{"value":"leave_without_request","label":"Afastamento sem pedido"},{"value":"pending_request","label":"Pedido em análise"},{"value":"approved_request","label":"Pedido aprovado"},{"value":"denied_request","label":"Pedido negado"},{"value":"ceased_benefit","label":"Benefício cessado"},{"value":"none","label":"Não houve"}]'::jsonb, '[]'::jsonb, '{"slug":"historico-inss-fibromialgia","version":1,"benefits":["fibromialgia","incapacidade"],"previous":"fibromyalgia-documents","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-care-context', 'Você informa estar em acompanhamento relacionado à saúde mental?', null, 'radio', true, true, true, true, 10, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"},{"value":"seeking_care","label":"Estou buscando acompanhamento"}]'::jsonb, '[]'::jsonb, '{"slug":"acompanhamento-saude-mental","version":1,"benefits":["depressao","incapacidade"],"next":"depression-diagnosis-info","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-diagnosis-info', 'Há informação de diagnóstico por profissional de saúde?', 'Não informe diagnóstico detalhado nesta etapa.', 'radio', false, true, true, true, 20, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"},{"value":"under_investigation","label":"Em investigação"}]'::jsonb, '[]'::jsonb, '{"slug":"diagnostico-saude-mental","version":1,"benefits":["depressao","incapacidade"],"next":"depression-functional-impact","previous":"depression-care-context","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-functional-impact', 'A situação tem afetado suas atividades de trabalho ou rotina?', null, 'radio', true, true, true, true, 30, '[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"impacto-rotina-trabalho-saude-mental","version":1,"benefits":["depressao","incapacidade"],"next":"depression-work-leave","previous":"depression-diagnosis-info","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-work-leave', 'Existe afastamento do trabalho?', null, 'radio', false, true, false, true, 40, '[{"value":"currently_away","label":"Atualmente afastado"},{"value":"previously_away","label":"Já estive afastado"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"afastamento-trabalho-saude-mental","version":1,"benefits":["depressao","incapacidade"],"next":"depression-inss-request","previous":"depression-functional-impact","answerStateOptions":["not_applicable","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-inss-request', 'Houve pedido no INSS?', null, 'radio', false, false, true, false, 50, '[{"value":"pending","label":"Em análise"},{"value":"approved","label":"Aprovado"},{"value":"denied","label":"Negado"},{"value":"ceased","label":"Cessado"},{"value":"none","label":"Não houve"}]'::jsonb, '[]'::jsonb, '{"slug":"pedido-inss-saude-mental","version":1,"benefits":["depressao","incapacidade"],"next":"depression-documents","previous":"depression-work-leave","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'depression-documents', 'Existem documentos que poderão ser avaliados posteriormente?', 'Não transcreva conteúdo médico nesta etapa.', 'radio', true, true, true, true, 60, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"documentos-saude-mental","version":1,"benefits":["depressao","incapacidade"],"previous":"depression-inss-request","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-person-context', 'A situação se refere a quem?', null, 'radio', true, true, false, true, 10, '[{"value":"self","label":"A mim"},{"value":"child","label":"Filho ou filha"},{"value":"dependent","label":"Outro dependente"},{"value":"person_under_responsibility","label":"Pessoa sob minha responsabilidade"}]'::jsonb, '[]'::jsonb, '{"slug":"pessoa-relacionada-autismo","version":1,"benefits":["autismo","assistencial"],"next":"autism-diagnosis-context","answerStateOptions":["withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-diagnosis-context', 'Existe diagnóstico ou acompanhamento relacionado ao Transtorno do Espectro Autista?', 'Não informe dados completos de terceiro nesta etapa.', 'radio', true, true, true, true, 20, '[{"value":"professional_diagnosis","label":"Diagnóstico informado por profissional"},{"value":"under_investigation","label":"Em investigação"},{"value":"care_without_diagnosis","label":"Acompanhamento sem diagnóstico informado"}]'::jsonb, '[]'::jsonb, '{"slug":"contexto-diagnostico-autismo","version":1,"benefits":["autismo","assistencial"],"next":"autism-support-needs","previous":"autism-person-context","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-support-needs', 'A pessoa necessita de apoio em atividades da rotina?', null, 'radio', true, true, true, true, 30, '[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"necessidade-apoio-autismo","version":1,"benefits":["autismo","assistencial"],"next":"autism-benefit-request","previous":"autism-diagnosis-context","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-benefit-request', 'A família já solicitou algum benefício?', null, 'radio', false, false, true, false, 40, '[{"value":"bpc","label":"BPC/LOAS"},{"value":"other_benefit","label":"Outro benefício"},{"value":"pending","label":"Pedido em análise"},{"value":"denied","label":"Pedido negado"},{"value":"none","label":"Não houve pedido"}]'::jsonb, '[]'::jsonb, '{"slug":"pedido-beneficio-autismo","version":1,"benefits":["autismo","assistencial"],"next":"autism-family-income-info","previous":"autism-support-needs","answerStateOptions":["unknown"],"active":true,"metadata":{}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-family-income-info', 'Há informações sobre renda e composição familiar disponíveis para avaliação posterior?', 'Não informe renda detalhada ou dados completos de familiares neste primeiro contato.', 'radio', true, true, true, true, 50, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"informacoes-renda-familia-autismo","version":1,"benefits":["autismo","assistencial"],"next":"autism-documents","previous":"autism-benefit-request","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 'autism-documents', 'Existem relatórios ou registros de acompanhamento que poderão ser apresentados posteriormente?', 'Não envie nem transcreva documentos nesta etapa.', 'radio', false, true, true, true, 60, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}]'::jsonb, '[]'::jsonb, '{"slug":"documentos-autismo","version":1,"benefits":["autismo","assistencial"],"previous":"autism-family-income-info","answerStateOptions":["unknown","withheld"],"active":true,"metadata":{"sensitive":true}}'::jsonb)
on conflict (quiz_template_id, question_key) do update
set
  title = excluded.title,
  description = excluded.description,
  question_type = excluded.question_type,
  is_required = excluded.is_required,
  is_sensitive = excluded.is_sensitive,
  allows_unknown = excluded.allows_unknown,
  allows_withheld = excluded.allows_withheld,
  display_order = excluded.display_order,
  options = excluded.options,
  conditions = excluded.conditions,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.quiz_template_rules (
  quiz_template_id,
  rule_key,
  rule_type,
  conditions,
  effects,
  priority,
  status
)
values
  ('11111111-1111-4111-8111-111111111111', 'general-retirement-interest', 'topic', '[{"questionId":"general-main-situation","operator":"equals","value":"retirement","score":55,"reason":"Tema de aposentadoria informado."},{"questionId":"general-affiliation","operator":"equals","value":"yes","score":20,"reason":"Histórico de filiação ao INSS informado."}]'::jsonb, '{"benefitSlug":"aposentadoria","active":true,"effects":{}}'::jsonb, 10, 'active'),
  ('11111111-1111-4111-8111-111111111111', 'general-disability-interest', 'topic', '[{"questionId":"general-main-situation","operator":"equals","value":"disability","score":55,"reason":"Tema de benefício por incapacidade informado."},{"questionId":"general-inss-request","operator":"equals","value":"denied","score":20,"reason":"Pedido negado informado."}]'::jsonb, '{"benefitSlug":"incapacidade","active":true,"effects":{}}'::jsonb, 20, 'active'),
  ('11111111-1111-4111-8111-111111111111', 'general-maternity-interest', 'topic', '[{"questionId":"general-main-situation","operator":"equals","value":"maternity","score":70,"reason":"Tema de salário-maternidade informado."}]'::jsonb, '{"benefitSlug":"salario-maternidade","active":true,"effects":{}}'::jsonb, 30, 'active'),
  ('11111111-1111-4111-8111-111111111111', 'general-assistance-interest', 'topic', '[{"questionId":"general-main-situation","operator":"equals","value":"bpc","score":60,"reason":"Tema de BPC/LOAS informado."},{"questionId":"general-main-situation","operator":"equals","value":"dependent_disability","score":40,"reason":"Tema relacionado a dependente com deficiência informado."}]'::jsonb, '{"benefitSlug":"assistencial","active":true,"effects":{}}'::jsonb, 40, 'active'),
  ('22222222-2222-4222-8222-222222222222', 'maternity-topic', 'topic', '[{"questionId":"maternity-related-situation","operator":"exists","score":35,"reason":"Situação relacionada ao evento informada."},{"questionId":"maternity-work-status","operator":"exists","score":25,"reason":"Categoria de trabalho ou contribuição informada."},{"questionId":"maternity-inss-request","operator":"equals","value":"denied","score":25,"reason":"Negativa do INSS informada."}]'::jsonb, '{"benefitSlug":"salario-maternidade","active":true,"effects":{}}'::jsonb, 10, 'active'),
  ('33333333-3333-4333-8333-333333333333', 'fibromyalgia-functional-topic', 'topic', '[{"questionId":"fibromyalgia-functional-impact","operator":"equals","value":"yes","score":35,"reason":"Impacto funcional informado."},{"questionId":"fibromyalgia-documents","operator":"equals","value":"yes","score":25,"reason":"Documentos avaliáveis poderão ser apresentados."},{"questionId":"fibromyalgia-inss-history","operator":"equals","value":"denied_request","score":20,"reason":"Pedido negado informado."}]'::jsonb, '{"benefitSlug":"fibromialgia","active":true,"effects":{}}'::jsonb, 10, 'active'),
  ('44444444-4444-4444-8444-444444444444', 'depression-functional-topic', 'topic', '[{"questionId":"depression-functional-impact","operator":"equals","value":"yes","score":35,"reason":"Impacto em rotina ou trabalho informado."},{"questionId":"depression-documents","operator":"equals","value":"yes","score":25,"reason":"Documentos avaliáveis poderão ser apresentados."},{"questionId":"depression-inss-request","operator":"equals","value":"denied","score":20,"reason":"Pedido negado informado."}]'::jsonb, '{"benefitSlug":"depressao","active":true,"effects":{}}'::jsonb, 10, 'active'),
  ('55555555-5555-4555-8555-555555555555', 'autism-assistance-topic', 'topic', '[{"questionId":"autism-support-needs","operator":"equals","value":"yes","score":30,"reason":"Necessidade de apoio informada."},{"questionId":"autism-family-income-info","operator":"equals","value":"yes","score":20,"reason":"Informações familiares poderão ser avaliadas."},{"questionId":"autism-benefit-request","operator":"equals","value":"denied","score":25,"reason":"Pedido negado informado."}]'::jsonb, '{"benefitSlug":"autismo","active":true,"effects":{}}'::jsonb, 10, 'active')
on conflict (quiz_template_id, rule_key) do update
set
  rule_type = excluded.rule_type,
  conditions = excluded.conditions,
  effects = excluded.effects,
  priority = excluded.priority,
  status = excluded.status,
  updated_at = now();

insert into public.quiz_template_versions (
  quiz_template_id,
  version,
  status,
  snapshot
)
values
  ('11111111-1111-4111-8111-111111111111', 1, 'active', '{"id":"11111111-1111-4111-8111-111111111111","slug":"geral","name":"Triagem previdenciária geral","description":"Porta de entrada para identificar o assunto previdenciário e organizar informações mínimas.","category":"previdenciario","audience":"Pessoas que buscam orientação inicial sobre tema previdenciário.","type":"general","source":"platform","ownership":"platform_managed","status":"active","version":1,"isDefault":true,"completenessFields":["general-main-situation","general-inss-request","general-affiliation"],"preventiveText":{"shortDisclaimer":"O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.","sensitiveDisclaimer":"Este módulo pode incluir informações sobre saúde ou situação familiar. Você pode escolher ''Não sei informar'' ou ''Prefiro não informar''. A ferramenta não realiza diagnóstico médico nem avalia incapacidade.","resultDisclaimer":"O resultado é informativo, não confirma direito a benefício, não constitui parecer jurídico e depende de análise individual com documentos por profissional habilitado."},"result":{"title":"Suas informações foram organizadas para uma triagem inicial","summary":"As respostas ajudam a identificar o assunto previdenciário relacionado e a prioridade operacional do atendimento. Esta triagem não confirma direito a benefício e pode depender de documentos e avaliação individual.","nextStep":"Você pode seguir com perguntas temáticas, encerrar a triagem ou solicitar contato do escritório.","topicLabel":"Triagem previdenciária geral"},"questions":[{"id":"general-main-situation","slug":"situacao-principal","version":1,"title":"Qual é a principal situação que motivou sua busca?","description":"Escolha a alternativa que melhor organiza o tema. Se não souber, use a opção de dúvida.","type":"radio","required":true,"options":[{"value":"retirement","label":"Aposentadoria"},{"value":"disability","label":"Benefício por incapacidade"},{"value":"maternity","label":"Salário-maternidade"},{"value":"bpc","label":"BPC/LOAS"},{"value":"death_pension","label":"Pensão por morte"},{"value":"dependent_disability","label":"Benefício relacionado a dependente com deficiência"},{"value":"denied_or_suspended","label":"Benefício negado ou suspenso"},{"value":"rural_worker","label":"Trabalhador rural"},{"value":"review","label":"Revisão de benefício"},{"value":"other","label":"Outro tema"}],"answerStateOptions":["unknown"],"benefits":["aposentadoria","incapacidade","salario-maternidade","assistencial","pensao","autismo"],"next":"general-inss-request","active":true,"order":10},{"id":"general-inss-request","slug":"pedido-inss","version":1,"title":"Você já possui pedido no INSS relacionado a essa situação?","type":"radio","required":true,"options":[{"value":"pending","label":"Sim, está em análise"},{"value":"approved","label":"Sim, foi aprovado"},{"value":"denied","label":"Sim, foi negado"},{"value":"ceased_or_suspended","label":"Sim, foi cessado ou suspenso"},{"value":"not_requested","label":"Ainda não fiz pedido"}],"answerStateOptions":["unknown","withheld"],"benefits":["aposentadoria","incapacidade","assistencial"],"previous":"general-main-situation","next":"general-affiliation","active":true,"order":20},{"id":"general-affiliation","slug":"filiacao-inss","version":1,"title":"Você possui ou já possuiu contribuições, vínculo de emprego, atividade rural ou outra forma de filiação ao INSS?","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["aposentadoria","incapacidade","salario-maternidade"],"previous":"general-inss-request","next":"general-recent-event","active":true,"order":30},{"id":"general-recent-event","slug":"evento-recente","version":1,"title":"Existe alguma data, evento ou mudança recente relacionada ao caso?","description":"Não é necessário anexar documentos nesta etapa.","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown"],"benefits":["salario-maternidade","incapacidade","pensao"],"previous":"general-affiliation","next":"general-documents-available","active":true,"order":40},{"id":"general-documents-available","slug":"documentos-disponiveis","version":1,"title":"Há documentos ou informações que poderão ser apresentados posteriormente?","description":"Não solicite upload nem informe dados completos de terceiros.","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown"],"benefits":["aposentadoria","incapacidade","assistencial"],"previous":"general-recent-event","active":true,"order":50}],"rules":[{"ruleKey":"general-retirement-interest","ruleType":"topic","benefitSlug":"aposentadoria","active":true,"priority":10,"conditions":[{"questionId":"general-main-situation","operator":"equals","value":"retirement","score":55,"reason":"Tema de aposentadoria informado."},{"questionId":"general-affiliation","operator":"equals","value":"yes","score":20,"reason":"Histórico de filiação ao INSS informado."}]},{"ruleKey":"general-disability-interest","ruleType":"topic","benefitSlug":"incapacidade","active":true,"priority":20,"conditions":[{"questionId":"general-main-situation","operator":"equals","value":"disability","score":55,"reason":"Tema de benefício por incapacidade informado."},{"questionId":"general-inss-request","operator":"equals","value":"denied","score":20,"reason":"Pedido negado informado."}]},{"ruleKey":"general-maternity-interest","ruleType":"topic","benefitSlug":"salario-maternidade","active":true,"priority":30,"conditions":[{"questionId":"general-main-situation","operator":"equals","value":"maternity","score":70,"reason":"Tema de salário-maternidade informado."}]},{"ruleKey":"general-assistance-interest","ruleType":"topic","benefitSlug":"assistencial","active":true,"priority":40,"conditions":[{"questionId":"general-main-situation","operator":"equals","value":"bpc","score":60,"reason":"Tema de BPC/LOAS informado."},{"questionId":"general-main-situation","operator":"equals","value":"dependent_disability","score":40,"reason":"Tema relacionado a dependente com deficiência informado."}]}]}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 1, 'active', '{"id":"22222222-2222-4222-8222-222222222222","slug":"salario-maternidade","name":"Triagem de salário-maternidade","description":"Organiza informações preliminares relacionadas a salário-maternidade.","category":"beneficio","audience":"Pessoas com situação relacionada a nascimento, adoção ou evento equiparado.","type":"maternity","source":"platform","ownership":"platform_managed","status":"active","version":1,"isDefault":false,"completenessFields":["maternity-related-situation","maternity-work-status","maternity-inss-request"],"preventiveText":{"shortDisclaimer":"O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.","sensitiveDisclaimer":"Este módulo pode incluir informações sobre saúde ou situação familiar. Você pode escolher ''Não sei informar'' ou ''Prefiro não informar''. A ferramenta não realiza diagnóstico médico nem avalia incapacidade.","resultDisclaimer":"O resultado é informativo, não confirma direito a benefício, não constitui parecer jurídico e depende de análise individual com documentos por profissional habilitado."},"result":{"title":"Informações relacionadas a salário-maternidade organizadas","summary":"Suas respostas organizaram informações relacionadas a salário-maternidade. A análise adequada pode depender da categoria de segurada, histórico contributivo, data do evento e documentação.","nextStep":"O escritório poderá verificar quais documentos e informações complementares são necessários para avaliar a situação.","topicLabel":"Salário-maternidade"},"questions":[{"id":"maternity-related-situation","slug":"situacao-salario-maternidade","version":1,"title":"Qual situação está relacionada ao pedido?","type":"radio","required":true,"options":[{"value":"birth","label":"Nascimento"},{"value":"adoption","label":"Adoção"},{"value":"judicial_guard","label":"Guarda judicial para fins de adoção"},{"value":"non_criminal_abortion","label":"Aborto não criminoso"}],"answerStateOptions":["unknown","withheld"],"benefits":["salario-maternidade"],"next":"maternity-event-timing","active":true,"order":10},{"id":"maternity-event-timing","slug":"data-evento-salario-maternidade","version":1,"title":"Qual foi ou será a data aproximada do evento?","description":"Informe apenas a situação geral. A data exata e documentos podem ser avaliados depois.","type":"radio","required":false,"options":[{"value":"already_happened","label":"Já ocorreu"},{"value":"will_happen","label":"Ainda não ocorreu"}],"answerStateOptions":["unknown","withheld"],"benefits":["salario-maternidade"],"previous":"maternity-related-situation","next":"maternity-work-status","active":true,"order":20},{"id":"maternity-work-status","slug":"situacao-trabalho-salario-maternidade","version":1,"title":"Na época do evento, qual era a sua situação de trabalho ou contribuição?","type":"radio","required":true,"options":[{"value":"employee","label":"Empregada com carteira"},{"value":"domestic_worker","label":"Trabalhadora doméstica"},{"value":"individual_taxpayer","label":"Contribuinte individual"},{"value":"mei","label":"MEI"},{"value":"optional_insured","label":"Segurada facultativa"},{"value":"rural_worker","label":"Trabalhadora rural"},{"value":"unemployed","label":"Desempregada"},{"value":"other","label":"Outra"}],"answerStateOptions":["unknown"],"benefits":["salario-maternidade"],"previous":"maternity-event-timing","next":"maternity-recent-contributions","active":true,"order":30},{"id":"maternity-recent-contributions","slug":"contribuicoes-recentes","version":1,"title":"Houve contribuições recentes ao INSS?","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["salario-maternidade"],"previous":"maternity-work-status","next":"maternity-inss-request","active":true,"order":40},{"id":"maternity-inss-request","slug":"pedido-inss-salario-maternidade","version":1,"title":"Já houve pedido no INSS?","type":"radio","required":true,"options":[{"value":"not_requested","label":"Não"},{"value":"pending","label":"Em análise"},{"value":"approved","label":"Aprovado"},{"value":"denied","label":"Negado"}],"answerStateOptions":["unknown"],"benefits":["salario-maternidade"],"previous":"maternity-recent-contributions","next":"maternity-denial-reason","active":true,"order":50},{"id":"maternity-denial-reason","slug":"motivo-negativa-salario-maternidade","version":1,"title":"Em caso de negativa, existe informação sobre o motivo?","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","not_applicable"],"benefits":["salario-maternidade"],"previous":"maternity-inss-request","active":true,"order":60}],"rules":[{"ruleKey":"maternity-topic","ruleType":"topic","benefitSlug":"salario-maternidade","active":true,"priority":10,"conditions":[{"questionId":"maternity-related-situation","operator":"exists","score":35,"reason":"Situação relacionada ao evento informada."},{"questionId":"maternity-work-status","operator":"exists","score":25,"reason":"Categoria de trabalho ou contribuição informada."},{"questionId":"maternity-inss-request","operator":"equals","value":"denied","score":25,"reason":"Negativa do INSS informada."}]}]}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 1, 'active', '{"id":"33333333-3333-4333-8333-333333333333","slug":"fibromialgia","name":"Triagem relacionada à fibromialgia","description":"Organiza informações preliminares sobre impactos funcionais relatados, sem diagnóstico ou conclusão de incapacidade.","category":"saude","audience":"Pessoas que relatam fibromialgia ou acompanhamento relacionado.","type":"fibromyalgia","source":"platform","ownership":"platform_managed","status":"active","version":1,"isDefault":false,"completenessFields":["fibromyalgia-diagnosis-context","fibromyalgia-functional-impact","fibromyalgia-documents"],"preventiveText":{"shortDisclaimer":"O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.","sensitiveDisclaimer":"Este módulo pode incluir informações sobre saúde ou situação familiar. Você pode escolher ''Não sei informar'' ou ''Prefiro não informar''. A ferramenta não realiza diagnóstico médico nem avalia incapacidade.","resultDisclaimer":"O resultado é informativo, não confirma direito a benefício, não constitui parecer jurídico e depende de análise individual com documentos por profissional habilitado."},"result":{"title":"Informações sobre limitações relatadas foram organizadas","summary":"As respostas indicam um tema que pode exigir análise individual das limitações relatadas, do histórico contributivo, das atividades exercidas e da documentação disponível. A existência de uma condição de saúde, isoladamente, não confirma direito a benefício.","nextStep":"O atendimento humano poderá avaliar histórico, documentos e contexto individual, sem que esta triagem confirme incapacidade.","topicLabel":"Tema relacionado à fibromialgia"},"questions":[{"id":"fibromyalgia-diagnosis-context","slug":"contexto-fibromialgia","version":1,"title":"Você informa possuir diagnóstico ou acompanhamento relacionado à fibromialgia?","description":"Não informe detalhes médicos, laudos ou exames nesta etapa.","type":"radio","required":true,"options":[{"value":"professional_diagnosis","label":"Possuo diagnóstico informado por profissional de saúde"},{"value":"under_investigation","label":"Estou em investigação ou acompanhamento"},{"value":"no_diagnosis","label":"Não possuo diagnóstico"}],"answerStateOptions":["unknown","withheld"],"benefits":["fibromialgia","incapacidade","assistencial"],"next":"fibromyalgia-functional-impact","metadata":{"sensitive":true},"active":true,"order":10},{"id":"fibromyalgia-functional-impact","slug":"impacto-funcional-fibromialgia","version":1,"title":"A condição tem afetado suas atividades habituais ou de trabalho?","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["fibromialgia","incapacidade"],"previous":"fibromyalgia-diagnosis-context","next":"fibromyalgia-limitation-duration","metadata":{"sensitive":true},"active":true,"order":20},{"id":"fibromyalgia-limitation-duration","slug":"tempo-limitacao-fibromialgia","version":1,"title":"Há quanto tempo essa limitação é percebida?","type":"radio","required":false,"options":[{"value":"less_than_3_months","label":"Menos de 3 meses"},{"value":"3_to_6_months","label":"Entre 3 e 6 meses"},{"value":"6_to_12_months","label":"Entre 6 e 12 meses"},{"value":"more_than_12_months","label":"Mais de 12 meses"}],"answerStateOptions":["unknown","withheld"],"benefits":["fibromialgia","incapacidade"],"previous":"fibromyalgia-functional-impact","next":"fibromyalgia-current-care","metadata":{"sensitive":true},"active":true,"order":30},{"id":"fibromyalgia-current-care","slug":"acompanhamento-fibromialgia","version":1,"title":"Existe acompanhamento médico atual?","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["fibromialgia"],"previous":"fibromyalgia-limitation-duration","next":"fibromyalgia-documents","metadata":{"sensitive":true},"active":true,"order":40},{"id":"fibromyalgia-documents","slug":"documentos-fibromialgia","version":1,"title":"Existem relatórios, exames, receitas ou outros registros que poderão ser apresentados posteriormente?","description":"Não envie nem transcreva conteúdo dos documentos agora.","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["fibromialgia","incapacidade","assistencial"],"previous":"fibromyalgia-current-care","next":"fibromyalgia-inss-history","metadata":{"sensitive":true},"active":true,"order":50},{"id":"fibromyalgia-inss-history","slug":"historico-inss-fibromialgia","version":1,"title":"Houve afastamento do trabalho ou pedido no INSS?","type":"radio","required":false,"options":[{"value":"leave_without_request","label":"Afastamento sem pedido"},{"value":"pending_request","label":"Pedido em análise"},{"value":"approved_request","label":"Pedido aprovado"},{"value":"denied_request","label":"Pedido negado"},{"value":"ceased_benefit","label":"Benefício cessado"},{"value":"none","label":"Não houve"}],"answerStateOptions":["unknown"],"benefits":["fibromialgia","incapacidade"],"previous":"fibromyalgia-documents","active":true,"order":60}],"rules":[{"ruleKey":"fibromyalgia-functional-topic","ruleType":"topic","benefitSlug":"fibromialgia","active":true,"priority":10,"conditions":[{"questionId":"fibromyalgia-functional-impact","operator":"equals","value":"yes","score":35,"reason":"Impacto funcional informado."},{"questionId":"fibromyalgia-documents","operator":"equals","value":"yes","score":25,"reason":"Documentos avaliáveis poderão ser apresentados."},{"questionId":"fibromyalgia-inss-history","operator":"equals","value":"denied_request","score":20,"reason":"Pedido negado informado."}]}]}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 1, 'active', '{"id":"44444444-4444-4444-8444-444444444444","slug":"depressao","name":"Triagem relacionada à depressão","description":"Organiza informações preliminares sobre impactos funcionais relacionados à saúde mental, sem avaliar diagnóstico ou gravidade clínica.","category":"saude","audience":"Pessoas que informam acompanhamento ou impactos relacionados à saúde mental.","type":"depression","source":"platform","ownership":"platform_managed","status":"active","version":1,"isDefault":false,"completenessFields":["depression-care-context","depression-functional-impact","depression-documents"],"preventiveText":{"shortDisclaimer":"O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.","sensitiveDisclaimer":"Este módulo pode incluir informações sobre saúde ou situação familiar. Você pode escolher ''Não sei informar'' ou ''Prefiro não informar''. A ferramenta não realiza diagnóstico médico nem avalia incapacidade.","resultDisclaimer":"O resultado é informativo, não confirma direito a benefício, não constitui parecer jurídico e depende de análise individual com documentos por profissional habilitado."},"result":{"title":"Informações de saúde mental foram organizadas para triagem","summary":"As informações fornecidas podem ser relevantes para uma análise previdenciária individualizada. A ferramenta não avalia diagnóstico, gravidade clínica ou incapacidade e não substitui avaliação médica ou jurídica.","nextStep":"O escritório poderá avaliar o contexto previdenciário com apoio de documentos e informações complementares, se você decidir prosseguir.","topicLabel":"Tema relacionado à depressão"},"questions":[{"id":"depression-care-context","slug":"acompanhamento-saude-mental","version":1,"title":"Você informa estar em acompanhamento relacionado à saúde mental?","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"},{"value":"seeking_care","label":"Estou buscando acompanhamento"}],"answerStateOptions":["unknown","withheld"],"benefits":["depressao","incapacidade"],"next":"depression-diagnosis-info","metadata":{"sensitive":true},"active":true,"order":10},{"id":"depression-diagnosis-info","slug":"diagnostico-saude-mental","version":1,"title":"Há informação de diagnóstico por profissional de saúde?","description":"Não informe diagnóstico detalhado nesta etapa.","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"},{"value":"under_investigation","label":"Em investigação"}],"answerStateOptions":["unknown","withheld"],"benefits":["depressao","incapacidade"],"previous":"depression-care-context","next":"depression-functional-impact","metadata":{"sensitive":true},"active":true,"order":20},{"id":"depression-functional-impact","slug":"impacto-rotina-trabalho-saude-mental","version":1,"title":"A situação tem afetado suas atividades de trabalho ou rotina?","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["depressao","incapacidade"],"previous":"depression-diagnosis-info","next":"depression-work-leave","metadata":{"sensitive":true},"active":true,"order":30},{"id":"depression-work-leave","slug":"afastamento-trabalho-saude-mental","version":1,"title":"Existe afastamento do trabalho?","type":"radio","required":false,"options":[{"value":"currently_away","label":"Atualmente afastado"},{"value":"previously_away","label":"Já estive afastado"},{"value":"no","label":"Não"}],"answerStateOptions":["not_applicable","withheld"],"benefits":["depressao","incapacidade"],"previous":"depression-functional-impact","next":"depression-inss-request","metadata":{"sensitive":true},"active":true,"order":40},{"id":"depression-inss-request","slug":"pedido-inss-saude-mental","version":1,"title":"Houve pedido no INSS?","type":"radio","required":false,"options":[{"value":"pending","label":"Em análise"},{"value":"approved","label":"Aprovado"},{"value":"denied","label":"Negado"},{"value":"ceased","label":"Cessado"},{"value":"none","label":"Não houve"}],"answerStateOptions":["unknown"],"benefits":["depressao","incapacidade"],"previous":"depression-work-leave","next":"depression-documents","active":true,"order":50},{"id":"depression-documents","slug":"documentos-saude-mental","version":1,"title":"Existem documentos que poderão ser avaliados posteriormente?","description":"Não transcreva conteúdo médico nesta etapa.","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["depressao","incapacidade"],"previous":"depression-inss-request","metadata":{"sensitive":true},"active":true,"order":60}],"rules":[{"ruleKey":"depression-functional-topic","ruleType":"topic","benefitSlug":"depressao","active":true,"priority":10,"conditions":[{"questionId":"depression-functional-impact","operator":"equals","value":"yes","score":35,"reason":"Impacto em rotina ou trabalho informado."},{"questionId":"depression-documents","operator":"equals","value":"yes","score":25,"reason":"Documentos avaliáveis poderão ser apresentados."},{"questionId":"depression-inss-request","operator":"equals","value":"denied","score":20,"reason":"Pedido negado informado."}]}]}'::jsonb),
  ('55555555-5555-4555-8555-555555555555', 1, 'active', '{"id":"55555555-5555-4555-8555-555555555555","slug":"autismo","name":"Triagem relacionada ao autismo","description":"Organiza informações para análise relacionada a BPC, dependentes e outros temas pertinentes, sem solicitar dados completos de terceiro.","category":"saude-familia","audience":"Pessoas que buscam organizar informações sobre si, filho, dependente ou pessoa sob responsabilidade.","type":"autism","source":"platform","ownership":"platform_managed","status":"active","version":1,"isDefault":false,"completenessFields":["autism-person-context","autism-support-needs","autism-family-income-info"],"preventiveText":{"shortDisclaimer":"O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.","sensitiveDisclaimer":"Este módulo pode incluir informações sobre saúde ou situação familiar. Você pode escolher ''Não sei informar'' ou ''Prefiro não informar''. A ferramenta não realiza diagnóstico médico nem avalia incapacidade.","resultDisclaimer":"O resultado é informativo, não confirma direito a benefício, não constitui parecer jurídico e depende de análise individual com documentos por profissional habilitado."},"result":{"title":"Informações relacionadas ao autismo foram organizadas","summary":"As respostas organizaram informações que podem ser relevantes para uma avaliação individual. A existência de diagnóstico não confirma, por si só, direito a benefício. A análise pode depender da situação da pessoa, necessidade de apoio, contexto familiar, renda e documentação.","nextStep":"O escritório poderá avaliar o contexto familiar, documentos disponíveis e informações complementares sem que esta triagem conclua direito a benefício.","topicLabel":"Tema relacionado ao autismo"},"questions":[{"id":"autism-person-context","slug":"pessoa-relacionada-autismo","version":1,"title":"A situação se refere a quem?","type":"radio","required":true,"options":[{"value":"self","label":"A mim"},{"value":"child","label":"Filho ou filha"},{"value":"dependent","label":"Outro dependente"},{"value":"person_under_responsibility","label":"Pessoa sob minha responsabilidade"}],"answerStateOptions":["withheld"],"benefits":["autismo","assistencial"],"next":"autism-diagnosis-context","metadata":{"sensitive":true},"active":true,"order":10},{"id":"autism-diagnosis-context","slug":"contexto-diagnostico-autismo","version":1,"title":"Existe diagnóstico ou acompanhamento relacionado ao Transtorno do Espectro Autista?","description":"Não informe dados completos de terceiro nesta etapa.","type":"radio","required":true,"options":[{"value":"professional_diagnosis","label":"Diagnóstico informado por profissional"},{"value":"under_investigation","label":"Em investigação"},{"value":"care_without_diagnosis","label":"Acompanhamento sem diagnóstico informado"}],"answerStateOptions":["unknown","withheld"],"benefits":["autismo","assistencial"],"previous":"autism-person-context","next":"autism-support-needs","metadata":{"sensitive":true},"active":true,"order":20},{"id":"autism-support-needs","slug":"necessidade-apoio-autismo","version":1,"title":"A pessoa necessita de apoio em atividades da rotina?","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"partial","label":"Parcialmente"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["autismo","assistencial"],"previous":"autism-diagnosis-context","next":"autism-benefit-request","metadata":{"sensitive":true},"active":true,"order":30},{"id":"autism-benefit-request","slug":"pedido-beneficio-autismo","version":1,"title":"A família já solicitou algum benefício?","type":"radio","required":false,"options":[{"value":"bpc","label":"BPC/LOAS"},{"value":"other_benefit","label":"Outro benefício"},{"value":"pending","label":"Pedido em análise"},{"value":"denied","label":"Pedido negado"},{"value":"none","label":"Não houve pedido"}],"answerStateOptions":["unknown"],"benefits":["autismo","assistencial"],"previous":"autism-support-needs","next":"autism-family-income-info","active":true,"order":40},{"id":"autism-family-income-info","slug":"informacoes-renda-familia-autismo","version":1,"title":"Há informações sobre renda e composição familiar disponíveis para avaliação posterior?","description":"Não informe renda detalhada ou dados completos de familiares neste primeiro contato.","type":"radio","required":true,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["autismo","assistencial"],"previous":"autism-benefit-request","next":"autism-documents","metadata":{"sensitive":true},"active":true,"order":50},{"id":"autism-documents","slug":"documentos-autismo","version":1,"title":"Existem relatórios ou registros de acompanhamento que poderão ser apresentados posteriormente?","description":"Não envie nem transcreva documentos nesta etapa.","type":"radio","required":false,"options":[{"value":"yes","label":"Sim"},{"value":"no","label":"Não"}],"answerStateOptions":["unknown","withheld"],"benefits":["autismo","assistencial"],"previous":"autism-family-income-info","metadata":{"sensitive":true},"active":true,"order":60}],"rules":[{"ruleKey":"autism-assistance-topic","ruleType":"topic","benefitSlug":"autismo","active":true,"priority":10,"conditions":[{"questionId":"autism-support-needs","operator":"equals","value":"yes","score":30,"reason":"Necessidade de apoio informada."},{"questionId":"autism-family-income-info","operator":"equals","value":"yes","score":20,"reason":"Informações familiares poderão ser avaliadas."},{"questionId":"autism-benefit-request","operator":"equals","value":"denied","score":25,"reason":"Pedido negado informado."}]}]}'::jsonb)
on conflict (quiz_template_id, version) do update
set
  status = excluded.status,
  snapshot = excluded.snapshot;
-- End seed platform quiz template questions, rules, and version snapshots.

comment on table public.quiz_templates is
  'Versioned quiz templates. Platform templates are tenant_id null; tenant templates are scoped by tenant_id. Public direct access is blocked by RLS.';

comment on table public.quiz_template_questions is
  'Questions belonging to a quiz template. Access inherits from the parent template through server-only services.';

comment on table public.quiz_template_rules is
  'Operational rules belonging to a quiz template. Rules qualify leads and do not produce legal opinions.';

comment on table public.quiz_template_versions is
  'Published snapshots for quiz template versioning without overwriting historical versions.';
