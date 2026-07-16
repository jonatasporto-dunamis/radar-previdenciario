revoke all on function public.office_has_active_membership(uuid, text[]) from public;
revoke all on function public.office_has_active_membership(uuid, text[]) from anon;
revoke all on function public.office_has_active_membership(uuid, text[]) from authenticated;
revoke all on function public.office_has_active_membership(uuid, text[]) from service_role;

revoke all on function public.office_lead_belongs_to_tenant(uuid, uuid) from public;
revoke all on function public.office_lead_belongs_to_tenant(uuid, uuid) from anon;
revoke all on function public.office_lead_belongs_to_tenant(uuid, uuid) from authenticated;
revoke all on function public.office_lead_belongs_to_tenant(uuid, uuid) from service_role;

grant execute on function public.office_has_active_membership(uuid, text[]) to authenticated;
grant execute on function public.office_lead_belongs_to_tenant(uuid, uuid) to authenticated;
