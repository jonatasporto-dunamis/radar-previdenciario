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
  "version": 1
}
```

Campos persistidos no evento:

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
  "flowVersion": 1
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
  "potentialBenefit": "Aposentadoria"
}
```

Todos os eventos do quiz são internos e gravados somente via servidor. A atribuição do lead é reaproveitada em `tracking_events`.

O evento é gravado após a persistência de `quiz_results` e conclusão da sessão. O payload contém apenas dados operacionais da triagem, sem enviar eventos para Meta, GA4 ou outras plataformas externas.

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

### ResultViewed

Registrado somente na primeira visualização do resultado.

Payload:

```json
{
  "resultId": "uuid",
  "classification": "alto_potencial",
  "potentialBenefit": "Aposentadoria",
  "source": "result_page"
}
```

Como `tracking_events` não possui coluna `result_id`, a deduplicação ocorre por `event_name` e `event_payload.resultId`. A chamada é feita por Server Action acionada por `ResultViewedTracker`, e um cookie HTTP-only por resultado evita novo evento em refresh simples da página.

## Preservação de UTMs

Parâmetros de campanha são capturados por `components/tracking/AttributionCapture.tsx`, normalizados por `lib/attribution/capture.ts` e preservados em `sessionStorage` por `lib/attribution/storage.ts`.

Novos parâmetros não vazios prevalecem sobre valores antigos. Valores vazios não apagam atribuição já capturada. O objeto de atribuição não deve armazenar dados pessoais.

A atribuição não é limpa após o cadastro porque é reutilizada nos eventos do quiz. A limpeza será implementada em etapa futura, quando a política de retenção do fluxo estiver definida.

## Tracking interno e integrações externas

Tracking interno significa persistir eventos próprios na tabela `tracking_events` do Supabase, via servidor.

Integrações externas como Meta Pixel, Meta CAPI, GA4 e GTM ainda não foram implementadas. Nenhum evento externo é disparado nesta etapa.

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
