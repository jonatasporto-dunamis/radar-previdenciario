# Tracking

## Eventos previstos

- `PageView`
- `LeadStarted`
- `LeadSubmitted`
- `QuizStarted`
- `QuestionAnswered`
- `QuizCompleted`
- `QualifiedLead`
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

Falhas no registro desse evento são tratadas como secundárias: o erro é logado apenas no servidor e o usuário segue para o quiz placeholder.

## Preservação de UTMs

Parâmetros de campanha são capturados por `components/tracking/AttributionCapture.tsx`, normalizados por `lib/attribution/capture.ts` e preservados em `sessionStorage` por `lib/attribution/storage.ts`.

Novos parâmetros não vazios prevalecem sobre valores antigos. Valores vazios não apagam atribuição já capturada. O objeto de atribuição não deve armazenar dados pessoais.

A atribuição não é limpa após o cadastro porque será reutilizada nos eventos futuros do quiz. A limpeza será implementada em etapa futura, ao concluir o fluxo de resultado.

## Tracking interno e integrações externas

Tracking interno significa persistir eventos próprios na tabela `tracking_events` do Supabase, via servidor.

Integrações externas como Meta Pixel, Meta CAPI, GA4 e GTM ainda não foram implementadas. Nenhum evento externo é disparado nesta etapa.
