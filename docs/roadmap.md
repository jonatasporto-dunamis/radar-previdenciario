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
- Painel interno MVP em branch isolada com Supabase Auth, memberships, roles, dashboard, leads, detalhes, notas, status, histórico e auditoria local.
- Fluxo de revisão preventiva desburocratizado em `docs/legal-review-guide.md`.
- Templates modulares iniciais para quiz geral, salário-maternidade, fibromialgia, depressão e autismo.
- Moderação inicial de conteúdo customizado e matriz de permissões para templates.

## Próxima ativação do painel

- Revisar as migrations `20260715120000_create_modular_quiz_templates.sql` e `20260715150000_create_office_dashboard.sql`.
- Aplicar migrations remotas somente após aprovação.
- Regenerar `types/supabase.ts` contra o schema aplicado.
- Criar usuário inicial no Supabase Auth.
- Associar usuário ao tenant `resende-advogados`.
- Validar Preview protegido da Vercel com dados de teste.
- Avaliar MFA para usuários do escritório.

## Próximas fases do quiz

- Aplicar a migration modular em ambiente controlado e popular templates no banco quando o painel administrativo estiver pronto.
- Evoluir clone, edição básica e publicação de templates por tenant no painel.
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
- Evoluir painel administrativo para `/painel/quizzes`, criação, clone, edição básica e versionamento.
- Adicionar cache seguro por tenant.
- Implementar onboarding, billing e lifecycle real de tenant.
