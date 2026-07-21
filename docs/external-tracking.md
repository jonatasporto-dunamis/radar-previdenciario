# External Tracking

## Arquitetura

```text
Business Event
→ tracking_events
→ External Tracking Orchestrator
  → Browser: dataLayer, Meta Pixel, GA4 fallback
  → Server: Meta Conversions API
  → external_tracking_deliveries
```

O `dataLayer` é o contrato central no navegador. Componentes não chamam `fbq`, `gtag` ou `dataLayer.push` diretamente; eles usam `lib/tracking` e `components/tracking`.

## Central de integrações por tenant

O painel expõe `/painel/integracoes` como a interface administrativa para Meta, Google Analytics 4, Google Ads e TikTok. Cada tenant possui configuração própria em:

- `tenant_integrations`: status, flags de browser/server, modo teste e configuração pública sanitizada;
- `tenant_integration_secrets`: credenciais criptografadas com AES-256-GCM via `TENANT_SECRETS_ENCRYPTION_KEY`;
- `tenant_event_mappings`: mapeamento editável entre eventos internos e eventos externos;
- `integration_delivery_logs`: diagnóstico sanitizado por provider, sem payload bruto e sem PII;
- `integration_test_runs`: histórico de testes de conexão sem registrar conversão real.

Providers novos são criados desativados e com status `configuration_required`. O fluxo operacional é preencher, salvar, testar, ativar e acompanhar eventos. A aplicação não ativa conversões reais automaticamente.

Admins podem configurar e substituir credenciais. Managers podem visualizar diagnósticos. Secrets nunca são retornados para o navegador; a UI exibe apenas que existe uma credencial criptografada.

## Estratégia de providers no MVP

Quando `NEXT_PUBLIC_GTM_CONTAINER_ID` estiver configurado, o browser envia eventos para o `dataLayer` e o GTM deve ser responsável por GA4 e Meta Pixel. Nesse modo, o app não carrega `gtag.js` direto nem Meta Pixel direto, evitando duplicação de eventos no navegador.

Quando GTM não estiver configurado, o app permite fallback direto:

- GA4 direto via `NEXT_PUBLIC_GA4_MEASUREMENT_ID`;
- Meta Pixel direto via `NEXT_PUBLIC_META_PIXEL_ID`.

Meta CAPI continua server-side e independente do carregamento browser, desde que `NEXT_PUBLIC_META_PIXEL_ID`, `META_CONVERSIONS_API_ACCESS_TOKEN` e consentimento estejam válidos.

Em modo multi-tenant, Pixel ID, GA4 Measurement ID, GTM Container ID e flags vêm preferencialmente de `tenant_tracking_configs`. O token Meta CAPI deve vir de `tenant_secrets`; o fallback por variável de ambiente existe apenas para o tenant padrão do MVP.

A Central de Integrações sincroniza configurações públicas de Meta e GA4 com `tenant_tracking_configs` para preservar compatibilidade com a pipeline atual. Google Ads e TikTok já possuem modelo administrativo e logs, mas devem permanecer em modo teste até a ativação operacional dos respectivos dispatchers.

## Eventos externos

- `PageView`
- `LeadStarted`
- `LeadSubmitted`
- `QuizStarted`
- `QuizCompleted`
- `QualifiedLead`
- `ResultViewed`
- `WhatsAppClick`

`LeadStarted` é definido como a primeira interação real com o formulário de cadastro.

## Mapeamento

| Evento          | Meta            | Tipo Meta   | GA4               | Tipo GA4    |
| --------------- | --------------- | ----------- | ----------------- | ----------- |
| `PageView`      | `PageView`      | padrão      | `page_view`       | recomendado |
| `LeadStarted`   | `LeadStarted`   | customizado | `begin_lead_form` | customizado |
| `LeadSubmitted` | `Lead`          | padrão      | `generate_lead`   | recomendado |
| `QuizStarted`   | `QuizStarted`   | customizado | `quiz_started`    | customizado |
| `QuizCompleted` | `QuizCompleted` | customizado | `quiz_completed`  | customizado |
| `QualifiedLead` | `QualifiedLead` | customizado | `qualified_lead`  | customizado |
| `ResultViewed`  | `ResultViewed`  | customizado | `result_viewed`   | customizado |
| `WhatsAppClick` | `Contact`       | padrão      | `whatsapp_click`  | customizado |

`generate_lead` é usado para cadastro concluído. GA4 deve ser configurado preferencialmente via GTM; `gtag.js` direto é fallback apenas quando GTM não estiver configurado.

## Event ID e deduplicação

O formato é:

```text
rp_<EventName>_<uuid>
```

O `event_id` é salvo em `tracking_events.event_payload.external_event_id`, reutilizado no browser e no servidor e usado para deduplicação entre Meta Pixel e Meta CAPI.

## Consentimento

Cookie:

```text
rp_tracking_consent=granted|denied
```

O cookie não contém PII. Quando `NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED=true`, Pixel, GA4, GTM e CAPI só disparam após consentimento concedido. Do Not Track é tratado como recusa quando não houver decisão explícita.

## Dados permitidos

- etapa genérica do funil;
- `event_id`;
- timestamp;
- origem genérica;
- path sem query string;
- UTMs seguras para parâmetros GA4 permitidos;
- `fbp` e `fbc` quando disponíveis;
- IP e user agent somente no servidor para CAPI;
- e-mail e telefone somente no CAPI, normalizados e SHA-256.

## Dados proibidos

Não enviar externamente:

- respostas do quiz;
- benefício provável;
- classificação;
- score;
- renda;
- idade exata;
- documentos;
- dados de saúde;
- nome completo;
- e-mail ou telefone em texto puro;
- resumo jurídico.

O sanitizador usa allowlist e rejeita chaves sensíveis como `email`, `phone`, `benefit`, `classification`, `score`, `answers`, `cpf` e `summary`.

## Delivery logs

`external_tracking_deliveries` registra provider, canal, `event_id`, status, tentativa, hash do payload sanitizado, timestamps, modo de teste e erro sanitizado. A tabela é bloqueada por RLS para `anon` e `authenticated`.

O índice de idempotência considera `tenant_id + event_id + provider + channel`, evitando colisão entre tenants.

Status:

```text
pending, processing, sent, failed, retrying, ignored, cancelled
```

Browser deliveries são best effort. CAPI usa retry controlado para 429 e 5xx, limite de 3 tentativas e mesmo `event_id`.

## Dry-run e test mode

`EXTERNAL_TRACKING_DRY_RUN=true` valida payload e cria delivery log, mas não chama APIs externas.

`META_TRACKING_TEST_MODE=true` envia `META_TEST_EVENT_CODE` para a CAPI quando configurado. Não use test event code em produção definitiva.

## Variáveis

```env
NEXT_PUBLIC_META_PIXEL_ID=
META_CONVERSIONS_API_ACCESS_TOKEN=
META_CONVERSIONS_API_VERSION=
META_TEST_EVENT_CODE=
META_TRACKING_TEST_MODE=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_CONTAINER_ID=
NEXT_PUBLIC_TRACKING_ENABLED=
NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED=
EXTERNAL_TRACKING_DRY_RUN=
TENANT_SECRETS_ENCRYPTION_KEY=
TENANT_SECRETS_KEY_VERSION=
```

Nunca exponha `META_CONVERSIONS_API_ACCESS_TOKEN` no cliente.

## Validação manual

Meta Events Manager:

1. habilitar `META_TRACKING_TEST_MODE=true` com `META_TEST_EVENT_CODE`;
2. confirmar browser event;
3. confirmar server event;
4. confirmar mesmo `event_id`;
5. confirmar deduplicação;
6. confirmar ausência de dados sensíveis;
7. remover test event code ao finalizar.

GA4 DebugView:

1. confirmar eventos;
2. confirmar parâmetros permitidos;
3. confirmar ausência de PII;
4. marcar eventos principais somente após decisão operacional.

GTM Preview:

1. confirmar eventos `rp_external_event` no `dataLayer`;
2. confirmar tags e consentimento;
3. confirmar ausência de duplicidade;
4. publicar container somente após autorização explícita.

## Configuração manual do GTM

O app não publica container automaticamente. No GTM, crie as variáveis do Data Layer:

- `rp_event_name`
- `rp_event_id`
- `rp_event_time`
- `rp_source`
- `source`
- `page_path`
- `form_version`
- `campaign_source`
- `campaign_medium`
- `campaign_name`
- `location`
- `qualified`

Crie um trigger Custom Event para `rp_external_event`. As tags GA4 e Meta Pixel devem usar esse trigger e mapear o nome final a partir de `rp_event_name`, respeitando o catálogo deste documento.

Não crie tags adicionais por clique/URL para os mesmos eventos do funil, porque isso duplicaria o tracking que já chega pelo `dataLayer`.

## Rollback

Rollback total de tracking externo:

```env
NEXT_PUBLIC_TRACKING_ENABLED=false
```

Rollback parcial mantendo eventos internos e auditoria sem chamadas externas:

```env
EXTERNAL_TRACKING_DRY_RUN=true
```

Após alterar variáveis públicas `NEXT_PUBLIC_*`, gere novo deploy para recompilar o cliente. Após alterar variáveis server-only, gere novo deploy quando quiser garantir consistência entre browser e servidor.
