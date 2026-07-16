create or replace function public.office_has_active_membership(
  required_tenant_id uuid,
  allowed_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.user_id = auth.uid()
      and tm.tenant_id = required_tenant_id
      and tm.status = 'active'
      and t.status = 'active'
      and (
        allowed_roles is null
        or tm.role = any(allowed_roles)
      )
  );
$$;

create or replace function public.office_lead_belongs_to_tenant(
  required_lead_id uuid,
  required_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.leads l
    where l.id = required_lead_id
      and l.tenant_id = required_tenant_id
  );
$$;

revoke all on function public.office_has_active_membership(uuid, text[]) from public;
revoke all on function public.office_lead_belongs_to_tenant(uuid, uuid) from public;
grant execute on function public.office_has_active_membership(uuid, text[]) to authenticated;
grant execute on function public.office_lead_belongs_to_tenant(uuid, uuid) to authenticated;

drop policy if exists "Office users can read own active memberships"
on public.tenant_memberships;

create policy "Office users can read own active memberships"
on public.tenant_memberships
for select
to authenticated
using (
  user_id = auth.uid()
  and public.office_has_active_membership(tenant_id)
);

drop policy if exists "Office users can read lead notes in their tenant"
on public.lead_notes;

create policy "Office users can read lead notes in their tenant"
on public.lead_notes
for select
to authenticated
using (
  public.office_has_active_membership(tenant_id)
  and public.office_lead_belongs_to_tenant(lead_id, tenant_id)
);

drop policy if exists "Office users can insert allowed lead notes"
on public.lead_notes;

create policy "Office users can insert allowed lead notes"
on public.lead_notes
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and public.office_has_active_membership(
    tenant_id,
    array['admin', 'manager', 'agent']
  )
  and public.office_lead_belongs_to_tenant(lead_id, tenant_id)
);

drop policy if exists "Office users can update allowed lead notes"
on public.lead_notes;

create policy "Office users can update allowed lead notes"
on public.lead_notes
for update
to authenticated
using (
  public.office_has_active_membership(
    tenant_id,
    array['admin', 'manager', 'agent']
  )
  and (
    public.office_has_active_membership(tenant_id, array['admin'])
    or author_user_id = auth.uid()
  )
)
with check (
  public.office_has_active_membership(
    tenant_id,
    array['admin', 'manager', 'agent']
  )
  and (
    public.office_has_active_membership(tenant_id, array['admin'])
    or author_user_id = auth.uid()
  )
  and public.office_lead_belongs_to_tenant(lead_id, tenant_id)
);

drop policy if exists "Office users can delete allowed lead notes"
on public.lead_notes;

create policy "Office users can delete allowed lead notes"
on public.lead_notes
for delete
to authenticated
using (
  public.office_has_active_membership(
    tenant_id,
    array['admin', 'manager', 'agent']
  )
  and (
    public.office_has_active_membership(tenant_id, array['admin'])
    or author_user_id = auth.uid()
  )
);

drop policy if exists "Office users can read status history in their tenant"
on public.lead_status_history;

create policy "Office users can read status history in their tenant"
on public.lead_status_history
for select
to authenticated
using (
  public.office_has_active_membership(tenant_id)
  and public.office_lead_belongs_to_tenant(lead_id, tenant_id)
);

drop policy if exists "Office users can insert status history in their tenant"
on public.lead_status_history;

create policy "Office users can insert status history in their tenant"
on public.lead_status_history
for insert
to authenticated
with check (
  changed_by_user_id = auth.uid()
  and public.office_has_active_membership(
    tenant_id,
    array['admin', 'manager', 'agent']
  )
  and public.office_lead_belongs_to_tenant(lead_id, tenant_id)
);

drop policy if exists "Managers can read office audit logs"
on public.office_audit_logs;

create policy "Managers can read office audit logs"
on public.office_audit_logs
for select
to authenticated
using (
  public.office_has_active_membership(tenant_id, array['admin', 'manager'])
);

drop policy if exists "Office users can insert sanitized audit logs"
on public.office_audit_logs;

create policy "Office users can insert sanitized audit logs"
on public.office_audit_logs
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and public.office_has_active_membership(tenant_id)
);
