create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agent',
  status text not null default 'active',
  display_name text,
  job_title text,
  is_default boolean not null default false,
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_memberships_role_check
    check (role in ('admin', 'manager', 'agent', 'viewer')),
  constraint tenant_memberships_status_check
    check (status in ('active', 'inactive', 'suspended', 'invited')),
  constraint tenant_memberships_display_name_length_check
    check (display_name is null or char_length(display_name) <= 160),
  constraint tenant_memberships_job_title_length_check
    check (job_title is null or char_length(job_title) <= 160)
);

create unique index if not exists tenant_memberships_tenant_user_unique
on public.tenant_memberships (tenant_id, user_id);

create unique index if not exists tenant_memberships_user_default_unique
on public.tenant_memberships (user_id)
where is_default;

create index if not exists tenant_memberships_user_id_idx
on public.tenant_memberships (user_id);

create index if not exists tenant_memberships_tenant_id_idx
on public.tenant_memberships (tenant_id);

create index if not exists tenant_memberships_tenant_status_idx
on public.tenant_memberships (tenant_id, status);

create index if not exists tenant_memberships_user_status_idx
on public.tenant_memberships (user_id, status);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_notes_body_length_check
    check (char_length(trim(body)) between 1 and 5000),
  constraint lead_notes_body_plain_text_check
    check (body !~ '<[^>]+>')
);

create index if not exists lead_notes_tenant_lead_created_at_idx
on public.lead_notes (tenant_id, lead_id, created_at desc);

create index if not exists lead_notes_author_user_id_idx
on public.lead_notes (author_user_id);

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by_user_id uuid not null references auth.users(id) on delete restrict,
  reason text,
  created_at timestamptz not null default now(),
  constraint lead_status_history_to_status_check
    check (
      to_status in (
        'new',
        'contacted',
        'in_review',
        'awaiting_information',
        'scheduled',
        'converted',
        'not_qualified',
        'lost',
        'archived'
      )
    ),
  constraint lead_status_history_from_status_check
    check (
      from_status is null
      or from_status in (
        'new',
        'contacted',
        'in_review',
        'awaiting_information',
        'scheduled',
        'converted',
        'not_qualified',
        'lost',
        'archived'
      )
    ),
  constraint lead_status_history_reason_length_check
    check (reason is null or char_length(reason) <= 500)
);

create index if not exists lead_status_history_tenant_lead_created_at_idx
on public.lead_status_history (tenant_id, lead_id, created_at desc);

create index if not exists lead_status_history_changed_by_idx
on public.lead_status_history (changed_by_user_id);

create table if not exists public.office_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint office_audit_logs_action_check
    check (
      action in (
        'lead_status_changed',
        'lead_note_created',
        'lead_note_updated',
        'lead_note_deleted',
        'office_login',
        'office_logout'
      )
    ),
  constraint office_audit_logs_entity_type_check
    check (entity_type in ('lead', 'lead_note', 'membership', 'session')),
  constraint office_audit_logs_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists office_audit_logs_tenant_created_at_idx
on public.office_audit_logs (tenant_id, created_at desc);

create index if not exists office_audit_logs_actor_user_id_idx
on public.office_audit_logs (actor_user_id);

create index if not exists office_audit_logs_entity_idx
on public.office_audit_logs (entity_type, entity_id);

do $$
begin
  if exists (
    select 1
    from public.leads
    where status is not null
      and status not in (
        'new',
        'contacted',
        'in_review',
        'awaiting_information',
        'scheduled',
        'converted',
        'not_qualified',
        'lost',
        'archived'
      )
  ) then
    raise exception 'leads contains unsupported commercial status values';
  end if;
end $$;

alter table public.leads
  drop constraint if exists leads_status_commercial_check,
  add constraint leads_status_commercial_check
    check (
      status is null
      or status in (
        'new',
        'contacted',
        'in_review',
        'awaiting_information',
        'scheduled',
        'converted',
        'not_qualified',
        'lost',
        'archived'
      )
    );

create index if not exists leads_tenant_status_created_at_idx
on public.leads (tenant_id, status, created_at desc);

drop trigger if exists set_tenant_memberships_updated_at on public.tenant_memberships;
create trigger set_tenant_memberships_updated_at
before update on public.tenant_memberships
for each row
execute function public.set_updated_at();

drop trigger if exists set_lead_notes_updated_at on public.lead_notes;
create trigger set_lead_notes_updated_at
before update on public.lead_notes
for each row
execute function public.set_updated_at();

create or replace function public.prevent_office_append_only_changes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only office dashboard table cannot be modified';
end;
$$;

drop trigger if exists prevent_lead_status_history_update on public.lead_status_history;
create trigger prevent_lead_status_history_update
before update or delete on public.lead_status_history
for each row
execute function public.prevent_office_append_only_changes();

drop trigger if exists prevent_office_audit_logs_update on public.office_audit_logs;
create trigger prevent_office_audit_logs_update
before update or delete on public.office_audit_logs
for each row
execute function public.prevent_office_append_only_changes();

alter table public.tenant_memberships enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.office_audit_logs enable row level security;

drop policy if exists "Office users can read own active memberships"
on public.tenant_memberships;

create policy "Office users can read own active memberships"
on public.tenant_memberships
for select
to authenticated
using (
  user_id = auth.uid()
  and status = 'active'
);

drop policy if exists "Block direct membership writes"
on public.tenant_memberships;

create policy "Block direct membership writes"
on public.tenant_memberships
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "Office users can read lead notes in their tenant"
on public.lead_notes;

create policy "Office users can read lead notes in their tenant"
on public.lead_notes
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    join public.leads l on l.id = lead_notes.lead_id
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_notes.tenant_id
      and l.tenant_id = lead_notes.tenant_id
  )
);

drop policy if exists "Office users can insert allowed lead notes"
on public.lead_notes;

create policy "Office users can insert allowed lead notes"
on public.lead_notes
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and exists (
    select 1
    from public.tenant_memberships tm
    join public.leads l on l.id = lead_notes.lead_id
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.role in ('admin', 'manager', 'agent')
      and tm.tenant_id = lead_notes.tenant_id
      and l.tenant_id = lead_notes.tenant_id
  )
);

drop policy if exists "Office users can update allowed lead notes"
on public.lead_notes;

create policy "Office users can update allowed lead notes"
on public.lead_notes
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_notes.tenant_id
      and tm.role in ('admin', 'manager', 'agent')
      and (tm.role = 'admin' or lead_notes.author_user_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_notes.tenant_id
      and tm.role in ('admin', 'manager', 'agent')
      and (tm.role = 'admin' or lead_notes.author_user_id = auth.uid())
  )
);

drop policy if exists "Office users can delete allowed lead notes"
on public.lead_notes;

create policy "Office users can delete allowed lead notes"
on public.lead_notes
for delete
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_notes.tenant_id
      and tm.role in ('admin', 'manager', 'agent')
      and (tm.role = 'admin' or lead_notes.author_user_id = auth.uid())
  )
);

drop policy if exists "Office users can read status history in their tenant"
on public.lead_status_history;

create policy "Office users can read status history in their tenant"
on public.lead_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_status_history.tenant_id
  )
);

drop policy if exists "Office users can insert status history in their tenant"
on public.lead_status_history;

create policy "Office users can insert status history in their tenant"
on public.lead_status_history
for insert
to authenticated
with check (
  changed_by_user_id = auth.uid()
  and exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = lead_status_history.tenant_id
      and tm.role in ('admin', 'manager', 'agent')
  )
);

drop policy if exists "Managers can read office audit logs"
on public.office_audit_logs;

create policy "Managers can read office audit logs"
on public.office_audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = office_audit_logs.tenant_id
      and tm.role in ('admin', 'manager')
  )
);

drop policy if exists "Office users can insert sanitized audit logs"
on public.office_audit_logs;

create policy "Office users can insert sanitized audit logs"
on public.office_audit_logs
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.tenant_id = office_audit_logs.tenant_id
  )
);

comment on table public.tenant_memberships is
  'Office dashboard tenant memberships. Users are created in Supabase Auth and linked here.';

comment on table public.lead_notes is
  'Private office notes for leads. Notes are not shown in the public application.';

comment on table public.lead_status_history is
  'Append-only commercial status history for leads.';

comment on table public.office_audit_logs is
  'Sanitized append-only audit log for office dashboard actions.';
