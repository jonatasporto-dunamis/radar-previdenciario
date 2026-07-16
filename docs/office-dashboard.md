# Painel Interno do Escritório

## Arquitetura

O painel interno fica em `/painel` e usa Supabase Auth para autenticação, `tenant_memberships` para autorização e serviços server-only para acesso operacional.

```text
Supabase Auth
→ tenant_memberships ativa
→ tenant ativo
→ role
→ requireOfficeUser()
→ páginas e Server Actions
```

O browser não consulta tabelas sensíveis diretamente. Páginas e Server Actions chamam `requireOfficeUser()` e usam `tenant_id` resolvido pela membership autenticada.

## Rotas

- `/painel`
- `/painel/login`
- `/painel/recuperar-senha`
- `/painel/redefinir-senha`
- `/painel/leads`
- `/painel/leads/[leadId]`
- `/painel/conta`
- `/painel/acesso-negado`
- `/painel/erro`

## Tabelas

Migration local:

- `supabase/migrations/20260715150000_create_office_dashboard.sql`

Tabelas criadas:

- `tenant_memberships`
- `lead_notes`
- `lead_status_history`
- `office_audit_logs`

A migration também padroniza status comerciais em `leads.status` de forma compatível com dados existentes.

## Roles

- `admin`: visualiza métricas e leads, altera status, cria notas, edita/exclui notas permitidas e visualiza histórico.
- `manager`: visualiza métricas e leads, altera status e cria notas.
- `agent`: visualiza leads, altera status e cria notas.
- `viewer`: somente leitura.

Permissões ficam centralizadas em `lib/office-dashboard/permissions.ts`.

## Segurança

- Autenticação não é autorização.
- Nenhuma operação aceita `tenantId` vindo do navegador.
- Toda query operacional usa `tenant_id` mais o identificador da entidade.
- Server Actions repetem autorização.
- Notas são texto simples e limitadas a 5.000 caracteres.
- Audit logs não guardam payload bruto, respostas completas, corpo de nota, IP, user-agent, tokens ou secrets.
- O painel retorna `noindex`, `nofollow` e `cache-control: no-store`.
- O root layout remove tracking público, header público, footer público e WhatsApp flutuante em `/painel`.

## Bootstrap do Primeiro Usuário

O painel não cria usuários nem senhas. Procedimento:

1. Criar o usuário manualmente no Supabase Auth.
2. Confirmar o e-mail.
3. Associar o usuário ao tenant `resende-advogados`.
4. Definir role inicial, normalmente `admin`.
5. Testar login.
6. Trocar senha inicial.
7. Avaliar MFA futuramente.

Script local:

```bash
pnpm office:grant-access --email=user@example.com --tenant=resende-advogados --role=admin --yes
```

O script exige `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, busca usuário existente, busca tenant existente e faz upsert idempotente em `tenant_memberships`. Ele não imprime tokens e não cria senha.

## Testes

- Unitários de permissões, filtros, formatação e schemas Zod.
- Integração de isolamento multi-tenant, status, notas, auditoria e métricas.
- E2E mockado para login, bloqueio, dashboard, listagem, detalhe, status, nota, viewer read-only, logout e noindex.

O E2E usa `E2E_MOCK_SUPABASE=true` e não chama Supabase remoto, Resend, Meta, GA4 ou GTM.

## Ativação

Antes de ativar em preview:

1. Revisar a migration local.
2. Aplicar migration com aprovação explícita.
3. Regenerar `types/supabase.ts` contra o schema aplicado.
4. Criar usuário no Supabase Auth.
5. Conceder membership com o script ou pelo dashboard.
6. Configurar Preview protegido na Vercel.
7. Validar com dados de teste.

Não aplicar migration remota, não fazer deploy e não criar usuário automaticamente sem autorização.

## Types

Como a migration do painel ainda não foi aplicada no Supabase remoto, `types/supabase.ts` foi atualizado localmente nesta branch para permitir tipagem e validação do MVP.

Após aplicar a migration em ambiente aprovado, regenere os types oficiais:

```bash
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Não trate os types atuais como confirmação de que as tabelas já existem no banco remoto.

## Plano de Integração Futura

O painel deve permanecer isolado até a aprovação da revisão jurídica. Fluxo esperado:

1. Aprovar a revisão jurídica com o advogado responsável.
2. Commitar e publicar a branch `review/legal-content-mvp`.
3. Integrar a revisão jurídica em `main`.
4. Atualizar `feature/office-dashboard` com a nova `main`.
5. Resolver conflitos em `app/layout.tsx`, `types/supabase.ts`, tipos do quiz/resultado, documentação, fixtures, e-mails e exibição de `requiresHumanReview`, `unknown` e `withheld`.
6. Validar resultado público, consentimentos e textos jurídicos.
7. Rodar a Quality Gate completa.
8. Aplicar migration em ambiente seguro.
9. Criar usuário de teste.
10. Validar Preview protegido.
11. Aprovar merge do painel.

## Checklist da Migration Remota

Não executar sem autorização explícita.

1. Confirmar backup ou plano de rollback.
2. Executar `supabase migration list --linked`.
3. Revisar `supabase/migrations/20260715150000_create_office_dashboard.sql`.
4. Confirmar schema atual e ausência de conflito em `leads.status`.
5. Executar `supabase db push --dry-run`, se disponível no ambiente.
6. Aplicar migration aprovada.
7. Executar novamente `supabase migration list --linked`.
8. Regenerar `types/supabase.ts`.
9. Auditar tabelas, constraints, índices e triggers.
10. Auditar RLS para `anon`, `authenticated` e isolamento entre tenants.
11. Validar aplicação pública sem regressão.

## Hardening RLS do Painel

A validação remota com dados sintéticos deve confirmar:

- `anon` não lê tabelas de templates diretamente;
- usuário autenticado não lê templates diretamente;
- usuário do Tenant A não lê nem escreve notas do Tenant B;
- viewer não cria notas nem histórico de status;
- usuário suspenso não lê dados operacionais;
- tenant inativo não concede acesso operacional;
- histórico e auditoria permanecem append-only.

Se qualquer ponto falhar, aplicar somente migration corretiva aprovada. A migration `20260716130000_harden_office_dashboard_rls.sql` usa funções `security definer` para checar membership ativa, tenant ativo e vínculo do lead ao tenant antes das policies de notas, histórico e auditoria.

## Busca de Leads

A busca por nome, e-mail ou telefone não deve trafegar em query string. O painel usa Server Action e cookie httpOnly (`rp_office_lead_search`) para o termo sensível. Os demais filtros não sensíveis podem continuar em query string para navegação e paginação.

## Checklist do Primeiro Usuário

1. Criar usuário no Supabase Auth.
2. Confirmar e-mail.
3. Definir senha temporária forte ou fluxo de recuperação.
4. Conceder membership no tenant `resende-advogados`.
5. Usar role inicial `admin`.
6. Testar login, logout e recuperação.
7. Revisar audit logs.
8. Criar segundo usuário `viewer` para validar somente leitura.
9. Não versionar e-mail, senha ou token.

## Preview Protegido

Antes de abrir Preview:

- manter Deployment Protection ativo;
- usar Supabase apropriado para teste;
- não conectar dados reais no primeiro ciclo;
- manter tracking externo real desativado;
- evitar envio real de e-mail pelo painel;
- validar `noindex`, `nofollow` e `cache-control: no-store`;
- confirmar que variáveis server-only não usam prefixo `NEXT_PUBLIC_`.

Se existir apenas o Supabase de produção, documente o risco e não conecte o Preview sem autorização.

## Rollback

Estratégia de recuperação registrada antes do rollout remoto do painel:

- código público está preservado em `main` antes do merge do PR #3;
- migrations remotas autorizadas: `20260715120000_create_modular_quiz_templates.sql` e `20260715150000_create_office_dashboard.sql`;
- migrations são aditivas e o painel permanece em PR Draft até validação;
- se a aplicação pública falhar, manter o PR fora da `main` e restaurar o deployment anterior da Vercel;
- se a migration falhar, não executar `DROP`, `TRUNCATE` ou correções destrutivas;
- se houver estado parcial, bloquear acesso ao painel, preservar tabelas/audit logs e corrigir por nova migration;
- se RLS ou isolamento falharem, não criar usuários reais e manter `/painel` sem liberação operacional;
- em incompatibilidade pública, priorizar hotfix da aplicação pública antes de qualquer merge;
- nenhum token, senha ou service role deve ser registrado em documentação, logs ou commits.

## Troubleshooting

- Login válido redireciona para acesso negado: verifique `tenant_memberships.status = active` e `tenants.status = active`.
- Usuário não aparece: o usuário deve existir previamente em Supabase Auth.
- Dados de lead ausentes: confirme que a query está filtrando o tenant correto.
- Botões de status/notas não aparecem: verifique a role em `tenant_memberships`.
- Preview cacheando dados: confirme `dynamic = force-dynamic`, `revalidate = 0` e header `cache-control: no-store`.
