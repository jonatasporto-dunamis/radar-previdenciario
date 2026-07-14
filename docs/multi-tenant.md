# Multi-Tenant Foundation

## Objetivo

A fundação multi-tenant prepara o Radar Previdenciário para operar múltiplos escritórios sem duplicar código, hardcode institucional ou dados operacionais entre tenants.

Esta etapa não implementa autenticação, painel administrativo, billing, onboarding, domínio customizado automatizado ou multi-tenancy comercial completo. Ela cria o contrato de banco, resolução de tenant, escopo de dados e camada segura para secrets.

## Tenant padrão

Tenant inicial:

- slug: `resende-advogados`
- name: `Resende Advogados Associados`
- legal_name: `Resende Advogados Associados`
- status: `active`
- is_default: `true`
- timezone: `America/Bahia`
- locale: `pt-BR`

Domínios persistidos:

- `radarprevidenciario.com.br`
- `www.radarprevidenciario.com.br`
- `radar-previdenciario.vercel.app`

`localhost`, `127.0.0.1` e hosts de preview usam fallback de aplicação e não são persistidos como domínio.

## Tabelas

- `tenants`: cadastro do tenant.
- `tenant_domains`: hostname associado ao tenant.
- `tenant_tracking_configs`: IDs públicos e flags de tracking por tenant.
- `tenant_secrets`: secrets criptografados server-side por tenant.

As tabelas operacionais receberam `tenant_id` obrigatório:

- `leads`
- `quiz_sessions`
- `quiz_answers`
- `quiz_results`
- `tracking_events`
- `notification_logs`
- `external_tracking_deliveries`

Registros existentes foram backfilled para o tenant padrão pela migration `20260714150000_create_multi_tenant_foundation.sql`.

## Resolução

Ordem de resolução:

```text
tenantId explícito
→ slug
→ hostname
→ default em desenvolvimento/preview permitido
```

Entrada HTTP usa `x-forwarded-host` ou `host`. Produção com hostname desconhecido deve falhar em vez de cair silenciosamente para o tenant padrão.

Serviços principais:

- `services/tenants/resolveTenant.ts`
- `services/tenants/repository/`
- `lib/tenants/`

## Escopo de dados

Todo serviço operacional recebe `tenantId` e filtra queries por `tenant_id` antes de usar `lead_id`, `session_id`, `result_id`, `payload_hash` ou `event_id`.

Isso vale para cadastro, quiz, resultado, tracking interno, logs de notificação e logs de tracking externo.

Hashes de idempotência de notificação incluem `tenantId` para evitar colisão entre escritórios.

## Tracking

`tenant_tracking_configs` armazena apenas IDs públicos e flags:

- Meta Pixel ID;
- Meta API version;
- GA4 Measurement ID;
- GTM Container ID;
- flags de enable, consentimento, dry-run e test mode;
- overrides de eventos.

Tokens como Meta CAPI access token não ficam nessa tabela.

## Secrets

`tenant_secrets.encrypted_value` usa AES-256-GCM no servidor via `lib/security/tenant-secrets.ts`.

Variável obrigatória para criptografar/descriptografar secrets persistidos:

```env
TENANT_SECRETS_ENCRYPTION_KEY=
```

A chave deve decodificar para 32 bytes, em base64url ou hex de 64 caracteres. Nunca use prefixo `NEXT_PUBLIC_`.

No MVP, o tenant padrão ainda pode usar fallback para variáveis server-only existentes quando não houver secret persistido:

- `META_CONVERSIONS_API_ACCESS_TOKEN`
- `META_TEST_EVENT_CODE`

## Segurança

- RLS segue ativa e bloqueando `anon` e `authenticated`.
- Service role continua restrita a serviços server-only.
- `.env.local` nunca deve ser commitado.
- `tenant_secrets` não armazena valor em claro.
- Componentes cliente não recebem tokens nem service role.
- O browser não precisa conhecer `tenantId` para registrar delivery logs; a Server Action resolve tenant pelo request.

## Comandos

Aplicar migration:

```bash
supabase db push
```

Regenerar types:

```bash
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Validar:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm format:check
```
