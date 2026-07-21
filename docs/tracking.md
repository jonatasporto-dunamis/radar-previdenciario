# Tracking

## Eventos previstos

- `PageView`
- `LeadStarted`
- `LeadSubmitted`
- `QuizStarted`
- `QuestionAnswered`
- `QuizCompleted`
- `ResultGenerated`
- `ResultViewed`
- `QualifiedLead`
- `NotificationQueued`
- `NotificationSent`
- `NotificationFailed`
- `NotificationIgnored`
- `WhatsAppClick`

## Campos de atribuição

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `gclid`
- `campaign_id`
- `adset_id`
- `ad_id`
- `placement`
- `site_source_name`
- `referrer`
- `landing_page`
- `user_agent`
- `ip_address`

## LeadSubmitted

O evento interno `LeadSubmitted` foi implementado para o cadastro inicial do lead. Ele é registrado após a criação ou reutilização de um lead recente e usa o payload mínimo:

```json
{
  "source": "lead_registration",
  "version": 1,
  "external_event_id": "rp_LeadSubmitted_uuid"
}
```

Campos persistidos no evento:

- `tenant_id`
- `lead_id`
- `event_name`
- `event_payload`
- campos de atribuição listados acima
- `user_agent`
- `ip_address`

Falhas no registro desse evento são tratadas como secundárias: o erro é logado apenas no servidor e o usuário segue para o quiz.

## Eventos do quiz

### QuizStarted

Registrado quando `/quiz` cria uma nova sessão aberta em `quiz_sessions`.

Payload:

```json
{
  "source": "quiz",
  "flowSlug": "triagem-previdenciaria-inicial",
  "flowVersion": 1,
  "templateId": "11111111-1111-4111-8111-111111111111",
  "templateSlug": "geral",
  "templateType": "general",
  "templateVersion": 1,
  "external_event_id": "rp_QuizStarted_uuid"
}
```

### QuestionAnswered

Registrado a cada resposta salva em `quiz_answers`.

Payload:

```json
{
  "source": "quiz",
  "questionId": "primary-interest",
  "questionSlug": "interesse-principal",
  "questionType": "checkbox",
  "questionVersion": 1
}
```

### QuizCompleted

Registrado quando a última pergunta do fluxo é salva e todas as perguntas obrigatórias estão respondidas.

Payload:

```json
{
  "source": "quiz",
  "answeredRequiredQuestions": 7,
  "totalRequiredQuestions": 7,
  "resultId": "uuid",
  "score": 75,
  "classification": "alto_potencial",
  "potentialBenefit": "Aposentadoria",
  "dataCompleteness": "complete",
  "requiresHumanReview": false,
  "templateType": "general",
  "external_event_id": "rp_QuizCompleted_uuid"
}
```

Todos os eventos do quiz continuam registrados internamente via servidor. A atribuição do lead é reaproveitada em `tracking_events`.

`QuizCompleted` também pode acionar tracking externo com o mesmo `external_event_id`, mas o payload enviado para Meta, GA4 e GTM é sanitizado e não contém respostas, classificação, score ou benefício provável.

### ResultGenerated

Registrado somente após:

- Rule Engine concluído;
- Result Engine concluído;
- `quiz_results` persistido com sucesso.

Payload:

```json
{
  "classification": "alto_potencial",
  "potentialBenefit": "Aposentadoria",
  "rulesVersion": 1,
  "source": "rule_engine"
}
```

O evento é deduplicado em aplicação por `event_name`, `lead_id` e `session_id`.

Os metadados de template são internos e servem para análise operacional por campanha. Eles não devem ser enviados para Meta, GA4, Pixel ou GTM quando revelarem assunto sensível.

### ResultViewed

Registrado somente na primeira visualização do resultado.

Payload:

```json
{
  "resultId": "uuid",
  "classification": "alto_potencial",
  "potentialBenefit": "Aposentadoria",
  "source": "result_page",
  "external_event_id": "rp_ResultViewed_uuid"
}
```

Como `tracking_events` não possui coluna `result_id`, a deduplicação ocorre por `event_name` e `event_payload.resultId`. A chamada é feita por Server Action acionada por `ResultViewedTracker`, e um cookie HTTP-only por resultado evita novo evento em refresh simples da página.

### QualifiedLead

Registrado quando o Lead Qualification Pipeline considera o resultado notificável.

Payload interno:

```json
{
  "source": "qualification_pipeline",
  "resultId": "uuid",
  "qualified": true,
  "external_event_id": "rp_QualifiedLead_uuid"
}
```

O payload externo de `QualifiedLead` não inclui classificação, score, benefício, motivo de qualificação ou respostas. Ele envia somente metadados genéricos como `source` e `qualified`.

## Preservação de UTMs

Parâmetros de campanha são capturados por `components/tracking/AttributionCapture.tsx`, normalizados por `lib/attribution/capture.ts` e preservados em `sessionStorage` por `lib/attribution/storage.ts`.

Novos parâmetros não vazios prevalecem sobre valores antigos. Valores vazios não apagam atribuição já capturada. O objeto de atribuição não deve armazenar dados pessoais.

A atribuição não é limpa após o cadastro porque é reutilizada nos eventos do quiz. A limpeza será implementada em etapa futura, quando a política de retenção do fluxo estiver definida.

## Tracking interno e integrações externas

Tracking interno significa persistir eventos próprios na tabela `tracking_events` do Supabase, via servidor.

Tracking externo é desacoplado em `services/external-tracking/` e usa `dataLayer` como contrato central no navegador. Meta Pixel, Meta CAPI, GA4 e GTM nunca recebem respostas do quiz, classificação, score, benefício provável, renda, dados de saúde, nome, e-mail ou telefone em texto puro.

Eventos externos implementados:

- `PageView`
- `LeadStarted`
- `LeadSubmitted`
- `QuizStarted`
- `QuizCompleted`
- `QualifiedLead`
- `ResultViewed`
- `WhatsAppClick`

O `event_id` é salvo como `external_event_id` no payload do evento interno e reutilizado por Meta Pixel e Meta CAPI. Essa é a base da deduplicação browser/server.

Mapeamento externo:

| Evento          | Meta            | GA4               |
| --------------- | --------------- | ----------------- |
| `PageView`      | `PageView`      | `page_view`       |
| `LeadStarted`   | `LeadStarted`   | `begin_lead_form` |
| `LeadSubmitted` | `Lead`          | `generate_lead`   |
| `QuizStarted`   | `QuizStarted`   | `quiz_started`    |
| `QuizCompleted` | `QuizCompleted` | `quiz_completed`  |
| `QualifiedLead` | `QualifiedLead` | `qualified_lead`  |
| `ResultViewed`  | `ResultViewed`  | `result_viewed`   |
| `WhatsAppClick` | `Contact`       | `whatsapp_click`  |

`Lead`, `PageView` e `Contact` são eventos padrão Meta. Os demais eventos Meta são customizados. `page_view` e `generate_lead` são eventos recomendados GA4; os demais são customizados.

O catálogo completo e o runbook operacional ficam em `docs/external-tracking.md`.

## Tracking por tenant

`tracking_events` e `external_tracking_deliveries` possuem `tenant_id` obrigatório. Eventos internos, deliveries browser e deliveries server-side são filtrados por tenant para evitar colisões entre escritórios.

`tenant_tracking_configs` controla flags e IDs públicos por tenant. Tokens como Meta CAPI são lidos preferencialmente dos segredos criptografados da Central de Integrações, com fallback por `tenant_secrets` ou variável server-only apenas para compatibilidade do tenant padrão do MVP.

## Eventos de notificação

Os eventos de notificação são internos e server-only.

### NotificationQueued

Registrado quando um lead notificável cria um log `pending`.

Payload:

```json
{
  "notificationLogId": "uuid",
  "provider": "email",
  "priority": "high",
  "resultId": "uuid"
}
```

### NotificationSent

Registrado após o provider confirmar envio.

Payload:

```json
{
  "notificationLogId": "uuid",
  "provider": "email",
  "attempt": 1,
  "providerMessageId": "email_123"
}
```

### NotificationFailed

Registrado quando todas as tentativas falham ou o erro não é temporário.

Payload:

```json
{
  "notificationLogId": "uuid",
  "provider": "email",
  "attempt": 3,
  "temporary": true,
  "error": "mensagem sanitizada"
}
```

### NotificationIgnored

Registrado quando `baixo_potencial` não deve ser enviado ou quando a idempotência impede duplicidade.

Payload:

```json
{
  "notificationLogId": "uuid",
  "reason": "already_sent"
}
```

Nenhum desses eventos dispara Meta, GA4, Pixel, CAPI, CRM ou WhatsApp automático.

Os payloads desses eventos devem conter apenas identificadores operacionais, provider, prioridade, tentativa e motivo sanitizado. Não registre e-mail completo, telefone completo, payload do template ou chaves de provider.

## Eventos do painel interno

O painel interno registra apenas auditoria operacional em `office_audit_logs`, não tracking externo.

Ações iniciais:

- `office_login`
- `office_logout`
- `lead_status_changed`
- `lead_note_created`
- `lead_note_updated`
- `lead_note_deleted`

Esses eventos não devem ser enviados para Meta, GA4, GTM, CAPI ou provedores de e-mail. A metadata precisa ser sanitizada e não pode conter corpo completo de notas, respostas do quiz, IP completo, user-agent completo, cookies, tokens, e-mail completo, telefone completo ou payloads técnicos sensíveis.
