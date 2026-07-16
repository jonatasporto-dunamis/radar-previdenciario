# Database

## Visão geral do modelo

O Supabase será usado como banco relacional principal do Radar Previdenciário. A modelagem inicial cobre captura de leads, sessões do quiz, respostas, resultados, eventos de tracking e logs de notificação.

Nesta etapa, o banco já é usado pelo fluxo de cadastro do lead, pela infraestrutura funcional do quiz, pela persistência de resultado preliminar, pelos logs do pipeline de notificação e pela auditoria de entregas externas de tracking. Não há autenticação, APIs públicas, Rule Engine jurídico definitivo, CRM ou WhatsApp automático.

## Tabelas

### tenants

Cadastro dos escritórios/tenants. O tenant padrão inicial é `resende-advogados`, com `is_default = true`.

### tenant_domains

Mapeia hostname para tenant. `localhost` e hosts de desenvolvimento são resolvidos por fallback na aplicação e não precisam ser persistidos.

### tenant_tracking_configs

Armazena flags e IDs públicos de tracking por tenant. Não armazena tokens, service role ou secrets.

### tenant_secrets

Armazena secrets criptografados server-side com AES-256-GCM. A chave de criptografia vem de `TENANT_SECRETS_ENCRYPTION_KEY`.

### leads

Armazena dados básicos do lead e campos de atribuição de campanha capturados no momento da entrada. A escrita acontece somente no servidor, pela Server Action de cadastro e pelo Supabase Admin Client.

### quiz_sessions

Representa uma sessão de questionário associada a um lead, com início, conclusão, status e, após a migration modular, vínculo opcional com template (`quiz_template_id`, `quiz_template_version`, `template_type`). A página `/quiz` reutiliza a sessão aberta mais recente do template solicitado ou cria uma nova quando não existe sessão aberta.

### quiz_answers

Armazena respostas individuais de uma sessão do quiz, vinculadas ao lead e à sessão. A camada de serviço atualiza a resposta existente para `session_id + question_id` quando ela já existe, evitando duplicidade no fluxo atual sem alterar schema.

### quiz_results

Armazena o resultado preliminar calculado para uma sessão, incluindo benefício/tema em destaque, pontuação interna, classificação interna, completude, necessidade de revisão humana, regras combinadas, síntese e aviso ético.

### quiz_templates

Catálogo versionado de templates de quiz. Templates da plataforma usam `tenant_id = null`, `source = platform` e `ownership = platform_managed`. Templates customizados usam `tenant_id` obrigatório, `source = tenant` e `ownership = tenant_managed`.

### quiz_template_questions

Perguntas pertencentes a um template, com tipo, obrigatoriedade, sensibilidade, opções, condições e ordem de exibição.

### quiz_template_rules

Regras operacionais pertencentes a um template. Elas qualificam leads e não produzem parecer jurídico.

### quiz_template_versions

Snapshots planejados para versionamento de templates publicados sem sobrescrever histórico.

### tracking_events

Registra eventos previstos da jornada e um payload flexível em `jsonb`. Os eventos funcionais são `LeadSubmitted`, `QuizStarted`, `QuestionAnswered` e `QuizCompleted`.

### notification_logs

Registra notificações associadas a leads e resultados. A tabela suporta o pipeline de qualificação, envio por e-mail, idempotência, retry e observabilidade.

### external_tracking_deliveries

Registra auditoria de entrega para Meta Pixel, Meta Conversions API, GA4 e GTM. A tabela existe porque `tracking_events` não modela provider, canal, tentativa, status de entrega, payload hash, modo de teste ou retry.

### tenant_memberships

Associa usuários existentes do Supabase Auth a tenants. Define `role`, `status`, nome de exibição, cargo, membership padrão e último acesso.

### lead_notes

Notas internas privadas do escritório, sempre vinculadas a `tenant_id` e `lead_id`. O corpo é texto simples, não HTML, e não aparece na aplicação pública.

### lead_status_history

Histórico append-only de alterações de status comercial do lead.

### office_audit_logs

Auditoria mínima do painel para login, logout, alteração de status e operações de notas. Metadata é sanitizada e não deve conter payloads brutos ou dados sensíveis.

## Notification Logs

Estado anterior da tabela:

- `id`
- `lead_id`
- `result_id`
- `notification_type`
- `recipient`
- `status`
- `error_message`
- `sent_at`
- `created_at`

Campos adicionados para o pipeline:

- `provider`: canal/provider planejado. Valores permitidos inicialmente: `email`, `whatsapp`, `slack`, `discord`, `crm`, `webhook`.
- `priority`: prioridade planejada da fila. Valores permitidos: `low`, `medium`, `high`, `critical`.
- `attempt`: número de tentativas de processamento já realizadas. Deve ser maior ou igual a zero.
- `payload_hash`: hash sanitizado para idempotência. Não deve conter payload completo nem PII.
- `queued_at`: momento em que a notificação entrar na fila futura.
- `processing_started_at`: início do processamento da tentativa atual.
- `failed_at`: momento da falha mais recente.
- `last_error`: resumo sanitizado do último erro.

Status permitidos:

- `pending`
- `processing`
- `sent`
- `failed`
- `retrying`
- `ignored`
- `cancelled`

Compatibilidade:

- `error_message` permanece por compatibilidade com o schema inicial.
- `last_error` é o campo preferencial para o novo pipeline.
- `sent_at` foi preservado e não deve ser recalculado automaticamente.
- Registros antigos recebem `provider = email`, `priority = medium` e `attempt = 0`.

Idempotência:

O índice único parcial `notification_logs_payload_hash_provider_unique` impede duplicação de uma mesma notificação para o mesmo provider quando `payload_hash` está preenchido e o status está em `pending`, `processing`, `retrying` ou `sent`.

Retries atualizam a mesma linha e incrementam `attempt`, sem criar uma nova linha para a mesma notificação.

Observabilidade:

Os timestamps `queued_at`, `processing_started_at`, `sent_at` e `failed_at` permitem medir tempo em fila, tempo de processamento, sucesso e falha. O campo `last_error` deve receber apenas mensagem resumida e sanitizada, sem stack trace completo, API keys, payload com PII ou resposta integral do provider.

RLS:

Row Level Security continua ativa. Não há policy pública para `anon` ou `authenticated`; a tabela permanece restrita a operações server-only com Supabase Admin Client.

## External Tracking Deliveries

Migration:

- `20260714010000_create_external_tracking_deliveries.sql`

Campos principais:

- `tracking_event_id`: referência opcional ao evento interno.
- `lead_id`, `session_id`, `result_id`: contexto operacional opcional.
- `event_name`: evento externo do funil.
- `event_id`: identificador compartilhado entre browser e servidor.
- `provider`: `meta_pixel`, `meta_capi`, `ga4` ou `gtm`.
- `channel`: `browser` ou `server`.
- `status`: `pending`, `processing`, `sent`, `failed`, `retrying`, `ignored` ou `cancelled`.
- `attempt`: número da tentativa.
- `test_event`: indica modo de teste.
- `request_payload_hash`: SHA-256 do payload sanitizado.
- `provider_event_id`: identificador retornado pelo provider quando houver.
- `queued_at`, `processing_started_at`, `sent_at`, `failed_at`: observabilidade.
- `last_error`: erro resumido e sanitizado.

Idempotência:

O índice único por tenant evita duplicar a mesma entrega para `tenant_id + event_id + provider + channel`.

RLS:

RLS está ativo e há policy bloqueando acesso direto para `anon` e `authenticated`. Escritas devem ocorrer somente por Server Actions e serviços server-only com Supabase Admin Client.

Privacidade:

A tabela não armazena payload bruto, respostas do quiz, classificação, score, benefício provável, e-mail, telefone, documentos ou dados sensíveis. Apenas hash de payload sanitizado e metadados operacionais.

## Relacionamentos

- `tenants` 1:N `tenant_domains`
- `tenants` 1:1 `tenant_tracking_configs`
- `tenants` 1:N `tenant_secrets`
- `tenants` 1:N `leads`
- `tenants` 1:N `quiz_sessions`
- `tenants` 1:N `quiz_answers`
- `tenants` 1:N `quiz_results`
- `tenants` 1:N `tracking_events`
- `tenants` 1:N `notification_logs`
- `tenants` 1:N `external_tracking_deliveries`
- `tenants` 1:N `tenant_memberships`
- `tenants` 1:N `lead_notes`
- `tenants` 1:N `lead_status_history`
- `tenants` 1:N `office_audit_logs`
- `tenants` 1:N `quiz_templates` customizados
- `quiz_templates` 1:N `quiz_template_questions`
- `quiz_templates` 1:N `quiz_template_rules`
- `quiz_templates` 1:N `quiz_template_versions`
- `leads` 1:N `quiz_sessions`
- `leads` 1:N `quiz_answers`
- `leads` 1:N `quiz_results`
- `quiz_sessions` 1:N `quiz_answers`
- `quiz_sessions` 1:N `quiz_results`
- `leads` 1:N `tracking_events`
- `quiz_sessions` 1:N `tracking_events`
- `leads` 1:N `notification_logs`
- `quiz_results` 1:N `notification_logs`
- `tracking_events` 1:N `external_tracking_deliveries`
- `leads` 1:N `lead_notes`
- `leads` 1:N `lead_status_history`

## Campos de tracking

As tabelas `leads` e `tracking_events` possuem os campos:

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

## Estratégia de RLS

Row Level Security está ativado em todas as tabelas. As policies atuais bloqueiam acesso direto para os papéis `anon` e `authenticated`.

Inserções do fluxo de cadastro são feitas via Server Action, usando service role somente no servidor. Não há policy pública de `INSERT`, e o navegador não escreve diretamente no Supabase.

## Cadastro de leads

O fluxo `/cadastro` persiste:

- `full_name`
- `email`
- `phone`
- campos de atribuição
- `user_agent`
- `ip_address`
- `status = new`

O telefone é salvo normalizado no formato recomendado `55 + DDD + número`.

## Deduplicação operacional

Antes de criar um lead, o serviço busca um registro com o mesmo telefone normalizado criado nos últimos 15 minutos:

```text
phone = telefone_normalizado
tenant_id = tenant resolvido
created_at >= agora - 15 minutos
```

Se encontrar, reutiliza o `leadId` existente e não sobrescreve dados anteriores. Essa estratégia reduz duplicidade por reenvio, mas não substitui uma regra definitiva de identidade nem cria constraint `UNIQUE`.

## Falha de tracking

A criação do lead e o salvamento das respostas são as operações principais. Eventos em `tracking_events` são registrados depois.

Como Supabase JS não fornece transação simples entre chamadas independentes neste fluxo, uma falha em `tracking_events` não remove o lead, não remove resposta e não bloqueia a navegação. O erro é logado apenas no servidor.

## Sessões do quiz

Ao entrar em `/quiz` ou `/quiz/[templateSlug]`, a aplicação:

- lê o cookie HTTP-only `rp_lead_session`;
- valida a existência do lead;
- resolve o tenant e o template no servidor;
- busca sessão aberta em `quiz_sessions` para o lead e template;
- cria uma sessão com `status = started` se necessário;
- carrega respostas já salvas;
- calcula a pergunta de retomada;
- salva `rp_quiz_session` via Server Action para preservar o identificador da sessão.

O template geral preserva compatibilidade com sessões antigas que não possuem `quiz_template_id`. Templates temáticos criam sessões próprias. Sessões sem template associado assumem fallback para o template geral legado.

Quando a última pergunta é salva e todas as obrigatórias foram respondidas, a aplicação gera o resultado preliminar, persiste `quiz_results` e marca a sessão como `completed` com `completed_at`.

## Respostas do quiz

Cada resposta salva em `quiz_answers` contém:

- `session_id`
- `lead_id`
- `question_id`
- `question_label`
- `answer_value`
- `answer_label`
- `benefit_context`

Respostas do tipo `checkbox` são serializadas em JSON dentro de `answer_value`. O campo `answer_label` armazena uma versão humana das opções escolhidas. Esta etapa não altera schema nem cria constraint `UNIQUE`; a prevenção de duplicidade é feita no serviço.

## Resultados do quiz

Ao concluir o quiz, `saveQuizAnswerAction` executa:

```text
loadQuizAnswers
→ evaluateQuizRules
→ buildQuizResult
→ persistQuizResult
→ completeQuizSession
```

Campos persistidos em `quiz_results`:

- `session_id`
- `lead_id`
- `quiz_template_id`
- `quiz_template_version`
- `template_type`
- `potential_benefit`
- `topic`
- `score`
- `classification`
- `data_completeness`
- `missing_critical_answers`
- `requires_human_review`
- `matched_rules`
- `summary`
- `ethical_disclaimer`

A persistência é idempotente por `session_id`: se já existir resultado para a sessão, ele é atualizado; se não existir, um novo registro é criado. A migration `20260712090000_add_unique_constraint_quiz_results_session_id.sql` adiciona a constraint `quiz_results_session_id_unique` para reforçar essa regra no banco.

Antes da criação da constraint, foi validada a ausência de duplicidades equivalentes a:

```sql
select
  session_id,
  count(*)
from quiz_results
group by session_id
having count(*) > 1;
```

Resultado da auditoria em 2026-07-12: nenhuma duplicidade encontrada.

Na validação de concorrência em produção, a combinação `upsert` + constraint manteve apenas um `quiz_results` por sessão mesmo com duplo clique em finalizar.

## Notificações

Após `quiz_results` ser persistido e `QuizCompleted` ser registrado, a aplicação executa o Lead Qualification Pipeline.

Persistência em `notification_logs`:

- `lead_id`
- `result_id`
- `provider = email`
- `priority`
- `status`
- `attempt`
- `payload_hash`
- `queued_at`
- `processing_started_at`
- `sent_at`
- `failed_at`
- `last_error`

Status por cenário:

- `alto_potencial`: `pending` → `processing` → `sent` ou `retrying`/`failed`.
- `medio_potencial`: mesmo fluxo, com prioridade `medium`.
- `baixo_potencial`: `ignored`.
- duplicidade já enviada: sem reenvio e evento `NotificationIgnored`.

O payload completo do e-mail não é salvo no banco. `payload_hash` é usado para idempotência, e erros são sanitizados antes de persistir.

Para validar `notification_logs`, confirme:

- `provider = email`;
- `priority = high` para `alto_potencial` e `medium` para `medio_potencial`;
- `status = sent` quando o provider confirma envio;
- `status = ignored` para `baixo_potencial`;
- `payload_hash`, `queued_at`, `processing_started_at` e `sent_at` preenchidos em envios concluídos;
- `last_error` sanitizado em falhas controladas.

## Próximos passos

- Popular `quiz_template_questions` e `quiz_template_rules` por serviço administrativo quando o painel de templates estiver ativo.
- Avaliar constraint ou upsert para respostas quando a regra de histórico estiver definida.
- Criar limpeza de atribuição ao finalizar o resultado.
- Avaliar rate limit persistente com Upstash Redis ou equivalente.
- Revisar policies de RLS quando autenticação ou painel administrativo forem definidos.
- Avaliar fila assíncrona quando volume de notificações justificar.

## Supabase CLI

Verifique a instalação:

```bash
supabase --version
```

Se a CLI não estiver instalada, instale antes de aplicar migrations. Em Windows, uma opção é usar Scoop; em projetos Node, outra opção é instalar a CLI como dependência de desenvolvimento e executar via pnpm.

```bash
pnpm add -D supabase
pnpm supabase --version
```

## Status do projeto remoto

Em 2026-07-09, o projeto local foi vinculado ao projeto Supabase remoto `iuszrzziyrylzbhfiver`.

A migration inicial foi aplicada com:

```bash
supabase db push
```

Migration aplicada:

- `20260709010000_initial_leads_quiz_tracking_schema.sql`
- `20260712090000_add_unique_constraint_quiz_results_session_id.sql`
- `20260712120000_expand_notification_logs_for_pipeline.sql`
- `20260714010000_create_external_tracking_deliveries.sql`
- `20260714150000_create_multi_tenant_foundation.sql`

Migrations locais pendentes de aplicação remota controlada:

- `20260715120000_create_modular_quiz_templates.sql`
- `20260715150000_create_office_dashboard.sql`

A migration modular cria `quiz_templates`, `quiz_template_questions`, `quiz_template_rules`, `quiz_template_versions` e vínculos opcionais em `quiz_sessions` e `quiz_results`.

A migration do painel cria `tenant_memberships`, `lead_notes`, `lead_status_history`, `office_audit_logs`, RLS, policies restritivas e padronização segura de status comercial em `leads.status`.

Não aplique essas migrations no Supabase remoto sem aprovação explícita.

Os types oficiais foram gerados com:

```bash
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Arquivo gerado:

- `types/supabase.ts`

Para a migration do painel, `types/supabase.ts` foi atualizado localmente nesta branch para permitir validação TypeScript antes da aplicação remota. Isso não confirma que as tabelas do painel já existem no Supabase remoto.

Após aplicar `20260715150000_create_office_dashboard.sql` em ambiente aprovado, regenere os types oficiais com o comando acima.

## Teste local de migrations

Em 2026-07-15, a Supabase CLI e o Docker estavam disponíveis, mas este repositório não possuía `supabase/config.toml`. Por isso, a migration do painel foi auditada estaticamente e não foi aplicada em banco local nem remoto nesta etapa.

Antes de aplicar em ambiente remoto, inicialize ou use um ambiente local aprovado, aplique todas as migrations desde zero e valide RLS, constraints e rollback operacional.

Nunca commite `.env.local`, arquivos de estado local da CLI em `supabase/.temp/`, secret keys ou service role keys.

## Aplicando migrations

Faça login e vincule o projeto remoto:

```bash
supabase login
supabase link --project-ref iuszrzziyrylzbhfiver
```

Depois aplique as migrations existentes:

```bash
supabase db push
```

Esse comando aplica os arquivos em `supabase/migrations/` no banco remoto vinculado. Ele requer autenticação da CLI e permissões suficientes no projeto Supabase.

## Gerando types oficiais

Com a CLI autenticada e o projeto vinculado:

```bash
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Alternativamente, usando o project ref diretamente:

```bash
supabase gen types typescript --project-id iuszrzziyrylzbhfiver --schema public > types/supabase.ts
```

Após gerar o arquivo, exporte os tipos em `types/index.ts`.

## Validando conexão

Valide o projeto vinculado:

```bash
supabase migration list --linked
```

Valide a API pública com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A publishable key deve ser enviada como `apikey`, não como bearer token em `Authorization`.

## Variáveis sensíveis

- `.env.local` não deve ser commitado.
- Publishable keys podem ser usadas no cliente, mas não substituem RLS.
- Secret keys e service role nunca devem ser expostas no navegador, README, logs ou repositório.
- Use secrets da Vercel/GitHub para credenciais sensíveis de CI e produção.
