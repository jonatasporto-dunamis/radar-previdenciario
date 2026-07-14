# Roadmap

## Concluído na fundação

- Notification schema hardening.
- Lead Qualification Pipeline.
- Notification Engine com Email Provider e Resend Provider.
- Templates React Email.
- Idempotência por payload hash.
- Retry com backoff exponencial.
- Tracking externo com Meta Pixel, Meta CAPI, GA4/GTM e dataLayer.
- Consentimento de mensuração.
- Delivery logs em `external_tracking_deliveries`.
- Dry-run e test mode para validação segura.
- Fundação multi-tenant com tenants, domínios, tracking config, secrets e `tenant_id` operacional.

## Próximas fases do quiz

- Criar catálogo real de benefícios previdenciários.
- Mapear perguntas por benefício e por escritório.
- Definir estratégia de versionamento de fluxos em banco.
- Evoluir regras preliminares para Rule Engine jurídico definitivo.
- Definir critérios jurídicos e documentais para classificação real.
- Implementar limpeza de atribuição ao concluir o fluxo.
- Avaliar upsert ou constraint para resposta única por sessão/pergunta.
- Avaliar constraint de tracking quando houver coluna dedicada para `result_id`.

## Próxima fase de qualificação e notificações

- Avaliar fila assíncrona quando houver volume real.
- Evoluir observabilidade de delivery.
- Adicionar novos providers somente quando houver necessidade de produto.
- Definir política operacional de retentativas manuais.

## Próxima fase de tracking externo

- Receber IDs reais de Meta Pixel, GA4 e GTM.
- Configurar `META_CONVERSIONS_API_ACCESS_TOKEN` na Vercel.
- Aplicar a migration `external_tracking_deliveries` no Supabase remoto.
- Validar Meta Events Manager com Test Events.
- Validar GA4 DebugView.
- Validar GTM Preview e publicar container somente com autorização.
- Definir se `generate_lead` e `qualified_lead` serão eventos principais.
- Remover `META_TEST_EVENT_CODE` após validação.

## Fase SaaS

- Migrar brand, office, theme, SEO e legal para configuração remota por tenant quando houver painel.
- Adicionar painel administrativo.
- Adicionar cache seguro por tenant.
- Implementar onboarding, billing e lifecycle real de tenant.
