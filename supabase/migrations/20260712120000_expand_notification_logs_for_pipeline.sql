alter table public.notification_logs
  add column if not exists provider text not null default 'email',
  add column if not exists priority text not null default 'medium',
  add column if not exists attempt integer not null default 0,
  add column if not exists payload_hash text,
  add column if not exists queued_at timestamptz,
  add column if not exists processing_started_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists last_error text;

update public.notification_logs
set
  provider = coalesce(provider, 'email'),
  priority = coalesce(priority, 'medium'),
  attempt = coalesce(attempt, 0),
  status = coalesce(status, 'pending');

alter table public.notification_logs
  alter column provider set default 'email',
  alter column provider set not null,
  alter column priority set default 'medium',
  alter column priority set not null,
  alter column attempt set default 0,
  alter column attempt set not null,
  alter column status set default 'pending',
  alter column status set not null;

do $$
begin
  if exists (
    select 1
    from public.notification_logs
    where status not in (
      'pending',
      'processing',
      'sent',
      'failed',
      'retrying',
      'ignored',
      'cancelled'
    )
  ) then
    raise exception 'notification_logs contains unsupported status values';
  end if;
end $$;

alter table public.notification_logs
  drop constraint if exists notification_logs_status_check,
  add constraint notification_logs_status_check
    check (
      status in (
        'pending',
        'processing',
        'sent',
        'failed',
        'retrying',
        'ignored',
        'cancelled'
      )
    ),
  drop constraint if exists notification_logs_priority_check,
  add constraint notification_logs_priority_check
    check (priority in ('low', 'medium', 'high', 'critical')),
  drop constraint if exists notification_logs_attempt_check,
  add constraint notification_logs_attempt_check
    check (attempt >= 0),
  drop constraint if exists notification_logs_provider_check,
  add constraint notification_logs_provider_check
    check (provider in ('email', 'whatsapp', 'slack', 'discord', 'crm', 'webhook')),
  drop constraint if exists notification_logs_payload_hash_length_check,
  add constraint notification_logs_payload_hash_length_check
    check (payload_hash is null or length(payload_hash) <= 64);

create index if not exists notification_logs_provider_idx
on public.notification_logs(provider);

create index if not exists notification_logs_priority_idx
on public.notification_logs(priority);

create index if not exists notification_logs_created_at_idx
on public.notification_logs(created_at desc);

create index if not exists notification_logs_queued_at_idx
on public.notification_logs(queued_at)
where queued_at is not null;

create index if not exists notification_logs_processing_status_idx
on public.notification_logs(status, priority, created_at);

create index if not exists notification_logs_lead_id_idx
on public.notification_logs(lead_id);

create index if not exists notification_logs_result_id_idx
on public.notification_logs(result_id);

create unique index if not exists notification_logs_payload_hash_provider_unique
on public.notification_logs(provider, payload_hash)
where payload_hash is not null
  and status in ('pending', 'processing', 'retrying', 'sent');

comment on column public.notification_logs.provider is
  'Notification delivery provider or channel. Planned values include email, whatsapp, slack, discord, crm, and webhook.';
comment on column public.notification_logs.priority is
  'Queue priority for the future notification pipeline.';
comment on column public.notification_logs.attempt is
  'Number of processing attempts already made for this notification.';
comment on column public.notification_logs.payload_hash is
  'Optional sanitized hash used for idempotency and duplicate prevention. Do not store raw payload or PII here.';
comment on column public.notification_logs.queued_at is
  'Timestamp when the notification entered the future queue.';
comment on column public.notification_logs.processing_started_at is
  'Timestamp when processing started for the current attempt.';
comment on column public.notification_logs.failed_at is
  'Timestamp for the most recent terminal or retryable failure.';
comment on column public.notification_logs.last_error is
  'Sanitized summary of the last provider or processing error. Do not store stack traces, secrets, full payloads, or provider responses.';
