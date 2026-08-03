-- Tenant branding reuses tenants.metadata.branding to avoid duplicating tenant identity.
alter table public.tenants
  drop constraint if exists tenants_branding_metadata_object_check;

alter table public.tenants
  add constraint tenants_branding_metadata_object_check
  check (
    not (metadata ? 'branding')
    or jsonb_typeof(metadata -> 'branding') = 'object'
  );

alter table public.office_audit_logs
  drop constraint if exists office_audit_logs_action_check;

alter table public.office_audit_logs
  add constraint office_audit_logs_action_check check (action in (
    'lead_status_changed', 'lead_note_created', 'lead_note_updated',
    'lead_note_deleted', 'office_login', 'office_logout', 'template_cloned',
    'template_created', 'template_updated', 'template_published',
    'template_deactivated', 'template_archived', 'question_created',
    'question_updated', 'question_removed', 'template_version_created',
    'integration_created', 'integration_updated', 'integration_enabled',
    'integration_disabled', 'integration_tested', 'secret_rotated',
    'event_mapping_updated', 'domain_requested', 'domain_verified',
    'domain_activated', 'domain_primary_changed', 'domain_disabled',
    'branding_created', 'branding_updated', 'logo_uploaded', 'logo_removed',
    'colors_updated', 'whatsapp_updated'
  ));

alter table public.office_audit_logs
  drop constraint if exists office_audit_logs_entity_type_check;

alter table public.office_audit_logs
  add constraint office_audit_logs_entity_type_check check (entity_type in (
    'lead', 'lead_note', 'membership', 'session', 'quiz_template',
    'quiz_template_question', 'quiz_template_version', 'tenant_integration',
    'tenant_integration_secret', 'tenant_event_mapping',
    'integration_delivery_log', 'integration_test_run', 'tenant_domain',
    'tenant_branding'
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-branding', 'tenant-branding', true, 2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public tenant branding assets are readable"
on storage.objects for select
to public
using (bucket_id = 'tenant-branding');

create policy "Tenant managers upload their branding assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tenant-branding'
  and exists (
    select 1 from public.tenant_memberships membership
    where membership.user_id = auth.uid()
      and membership.tenant_id::text = (storage.foldername(name))[1]
      and membership.status = 'active'
      and membership.role in ('admin', 'manager')
  )
);

create policy "Tenant managers update their branding assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'tenant-branding'
  and exists (
    select 1 from public.tenant_memberships membership
    where membership.user_id = auth.uid()
      and membership.tenant_id::text = (storage.foldername(name))[1]
      and membership.status = 'active'
      and membership.role in ('admin', 'manager')
  )
)
with check (
  bucket_id = 'tenant-branding'
  and exists (
    select 1 from public.tenant_memberships membership
    where membership.user_id = auth.uid()
      and membership.tenant_id::text = (storage.foldername(name))[1]
      and membership.status = 'active'
      and membership.role in ('admin', 'manager')
  )
);

create policy "Tenant managers delete their branding assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'tenant-branding'
  and exists (
    select 1 from public.tenant_memberships membership
    where membership.user_id = auth.uid()
      and membership.tenant_id::text = (storage.foldername(name))[1]
      and membership.status = 'active'
      and membership.role in ('admin', 'manager')
  )
);
