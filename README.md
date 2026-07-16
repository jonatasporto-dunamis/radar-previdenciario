# Radar Previdenciário

Aplicação web responsiva para geração de leads qualificados para escritórios de advocacia previdenciária.

O projeto já contém a estrutura técnica inicial, o sistema visual configurável, o cadastro funcional de lead com captura de atribuição, templates modulares de quiz, persistência automática, geração preliminar de resultado informativo, pipeline interno de qualificação/notificação e camada de tracking externo em dry-run/configurável. Autenticação completa, APIs públicas, IA, CRM e WhatsApp automático ainda não foram implementados.

## Stack

- Next.js 15 com App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Supabase
- React Hook Form
- Zod
- ESLint
- Prettier
- Husky
- lint-staged
- pnpm

## Requisitos

- Node.js 20 ou superior
- pnpm 11

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev`: inicia o servidor local.
- `pnpm lint`: executa ESLint.
- `pnpm typecheck`: valida TypeScript.
- `pnpm build`: gera build de produção.
- `pnpm test`: executa testes unitários e de integração com Vitest.
- `pnpm test:coverage`: executa Vitest com coverage gate.
- `pnpm test:e2e`: executa testes E2E com Playwright.
- `pnpm office:grant-access`: associa usuário existente do Supabase Auth a um tenant.
- `pnpm format`: formata os arquivos.
- `pnpm format:check`: valida formatação.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` quando for configurar integrações reais:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
OFFICE_NOTIFICATION_EMAIL=
EMAIL_FROM_NAME=
EMAIL_FROM_ADDRESS=
EMAIL_REPLY_TO=
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
```

`SUPABASE_SERVICE_ROLE_KEY` deve existir somente em `.env.local` e nos secrets da Vercel. Nunca use prefixo `NEXT_PUBLIC_`, nunca importe em Client Components e nunca commite essa chave.

`META_CONVERSIONS_API_ACCESS_TOKEN` também é server-only e nunca deve receber prefixo `NEXT_PUBLIC_`. Pixel ID, GA4 Measurement ID e GTM Container ID podem ser públicos.

`TENANT_SECRETS_ENCRYPTION_KEY` é server-only e deve decodificar para 32 bytes em base64url ou hex. Ela é usada para criptografar secrets por tenant persistidos em `tenant_secrets`.

## Supabase Setup

Verifique se a CLI está instalada:

```bash
supabase --version
```

Se necessário, instale a CLI antes de aplicar migrations. Uma opção no projeto é:

```bash
pnpm add -D supabase
pnpm supabase --version
```

Configure `.env.local` com as variáveis públicas do projeto Supabase. Esse arquivo é ignorado pelo Git.

Comandos definitivos para vincular o projeto, aplicar migrations e gerar types:

```bash
supabase login
supabase link --project-ref iuszrzziyrylzbhfiver
supabase db push
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Não use secret key ou service role em código público. A publishable key é pública, mas o acesso aos dados deve continuar protegido por RLS. Nunca commite `.env.local`.

## Office Dashboard

O painel interno fica em `/painel` e foi criado como área privada para gestão dos leads do escritório.

Funcionalidades do MVP:

- login por Supabase Auth;
- autorização por `tenant_memberships`;
- roles `admin`, `manager`, `agent` e `viewer`;
- dashboard de métricas operacionais;
- listagem de leads com busca, filtros e paginação;
- detalhe do lead com identificação, respostas do quiz, resultado público, classificação interna, origem, notificações e timeline;
- alteração de status comercial;
- notas internas;
- histórico e audit logs;
- logout seguro.

O painel não usa tracking público, não entra no sitemap, retorna `noindex`/`nofollow` e não deve ser cacheado publicamente.

Bootstrap do primeiro usuário:

```bash
pnpm office:grant-access --email=user@example.com --tenant=resende-advogados --role=admin --yes
```

Esse comando exige usuário já criado no Supabase Auth, `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Ele não cria senha e não imprime secrets.

Migration local do painel:

```text
supabase/migrations/20260715150000_create_office_dashboard.sql
```

Ela ainda não deve ser aplicada no Supabase remoto sem autorização explícita.

Documentação completa:

- `docs/office-dashboard.md`

## Multi-Tenant Foundation

O projeto já possui fundação multi-tenant para operar múltiplos escritórios no futuro sem reescrever fluxos principais.

Tabelas criadas:

- `tenants`
- `tenant_domains`
- `tenant_tracking_configs`
- `tenant_secrets`

As tabelas operacionais usam `tenant_id` obrigatório: `leads`, `quiz_sessions`, `quiz_answers`, `quiz_results`, `tracking_events`, `notification_logs` e `external_tracking_deliveries`.

O tenant padrão inicial é `resende-advogados`. Em desenvolvimento, `localhost` usa fallback para o tenant padrão; em produção, hostname desconhecido deve falhar.

Documentação completa:

- `docs/multi-tenant.md`

Dados mínimos para operar um tenant:

- nome público do escritório;
- slug;
- e-mail operacional;
- telefone ou WhatsApp;
- cidade/estado;
- status ativo;
- responsável operacional.

Dados opcionais não bloqueiam o MVP: nome de advogado, OAB, CNPJ, razão social, endereço, unidades, canal de privacidade, logo e redes sociais. Campos opcionais vazios não devem aparecer como placeholders públicos.

## Cadastro de leads

Fluxo implementado:

```text
Landing page
→ /cadastro
→ Server Action
→ Supabase Admin Client
→ leads
→ tracking_events
→ cookie HTTP-only
→ /quiz
```

O formulário de `/cadastro` coleta nome completo, e-mail, telefone e consentimento de privacidade. A validação é feita com React Hook Form e Zod no cliente, e repetida no servidor antes da persistência.

Campos de campanha são capturados pelo componente global de atribuição e preservados em `sessionStorage`. O objeto de atribuição não deve conter dados pessoais. O identificador do lead é salvo apenas no cookie HTTP-only `rp_lead_session`, com duração de 2 horas, sem aparecer na URL.

A deduplicação atual busca leads com o mesmo telefone normalizado nos últimos 15 minutos e reutiliza o `leadId` encontrado. O rate limit por IP é best effort em memória, adequado apenas como camada inicial em ambiente serverless. Para produção em escala, adicionar Redis ou serviço equivalente.

## Modular Quiz Templates

O Radar Previdenciário funciona como plataforma de qualificação preliminar de leads. A plataforma organiza informações e o escritório faz a avaliação jurídica individual.

Templates padrão ativos:

- `/quiz`: triagem previdenciária geral.
- `/quiz/salario-maternidade`: salário-maternidade.
- `/quiz/fibromialgia`: tema relacionado à fibromialgia.
- `/quiz/depressao`: tema relacionado à depressão.
- `/quiz/autismo`: tema relacionado ao autismo.

Arquitetura:

- `config/quiz/templates/`: templates `platform_managed` com perguntas, regras e textos públicos.
- `services/quiz/templates/`: resolução por slug, fallback legado, moderação, permissões e clone para tenant.
- `types/quiz/`: `QuizTemplateType`, `QuizTemplateSource`, `QuizTemplateStatus` e contratos relacionados.
- `supabase/migrations/20260715120000_create_modular_quiz_templates.sql`: migration aditiva para `quiz_templates`, `quiz_template_questions`, `quiz_template_rules`, `quiz_template_versions` e vínculo em `quiz_sessions`.

Templates da plataforma não são editados diretamente por tenant; devem ser clonados. Conteúdo customizado é `tenant_managed`, passa por moderação automática e registra versionamento operacional.

## Question Engine

O quiz foi estruturado para suportar múltiplos benefícios e múltiplos escritórios sem hardcode de perguntas dentro da tela.

Principais diretórios:

- `config/quiz/templates/`: templates versionáveis.
- `config/quiz/questions/`: perguntas legadas/versionadas.
- `config/quiz/flows/`: fluxos e ordem dos passos.
- `config/quiz/benefits/`: benefícios e contextos.
- `types/quiz/`: contratos do Question Engine.
- `services/quiz/engine/`: resolução de perguntas ativas e visibilidade.
- `services/quiz/session/`: criação/reuso de sessão, respostas e conclusão.
- `services/quiz/progress/`: progresso real.
- `services/quiz/navigation/`: anterior, próximo e retomada.
- `components/quiz/renderer/`: componentes por tipo de pergunta.

O template geral identifica o assunto previdenciário e templates temáticos organizam informações de campanhas específicas. Os templates relacionados à saúde não realizam diagnóstico, não avaliam incapacidade e não confirmam direito a benefício.

## Rule Engine e Result Engine

Ao finalizar o quiz, o fluxo passa por camadas separadas:

```text
Question Engine
→ coleta respostas
Rule Engine
→ interpreta respostas por benefício
Result Engine
→ consolida candidato, score e classificação
Result Persistence
→ grava ou atualiza quiz_results
Result Page
→ exibe resultado informativo
```

As regras preliminares ficam em `config/quiz/rules/` e usam operadores simples como `includes`, `equals`, `min` e `max`. Essa camada não calcula direito previdenciário definitivo e não substitui avaliação jurídica individual.

O resultado é persistido em `quiz_results` com metadados internos como `lead_id`, `session_id`, `quiz_template_id`, `template_type`, `potential_benefit`, `topic`, `score`, `classification`, `data_completeness`, `requires_human_review`, `matched_rules`, `summary` e `ethical_disclaimer`. A rota `/resultado` lê o resultado mais recente do lead autenticado pelo cookie HTTP-only `rp_lead_session`.

Campos internos como score, alto/médio/baixo, thresholds e regras combinadas não são exibidos ao usuário. A página pública mostra apenas título, resumo, tema, próximo passo e disclaimer.

`quiz_results.session_id` possui constraint única no banco remoto para evitar múltiplos resultados da mesma sessão. A camada de persistência usa `upsert` por `session_id`, e eventos de resultado possuem deduplicação em aplicação para evitar repetição em refresh ou dupla conclusão. `ResultViewed` é disparado por Server Action e protegido por cookie HTTP-only por resultado.

## Notification Logs

A tabela `notification_logs` sustenta o Lead Qualification Pipeline + Notification Engine.

O schema suporta:

- providers planejados: `email`, `whatsapp`, `slack`, `discord`, `crm`, `webhook`;
- prioridades: `low`, `medium`, `high`, `critical`;
- status: `pending`, `processing`, `sent`, `failed`, `retrying`, `ignored`, `cancelled`;
- tentativas com `attempt`;
- idempotência por `provider + payload_hash`;
- observabilidade com `queued_at`, `processing_started_at`, `sent_at` e `failed_at`;
- compatibilidade com `error_message`, mantendo `last_error` como campo preferencial para o novo pipeline.

`payload_hash` deve ser um hash sanitizado e não deve conter payload completo, PII ou segredos. A tabela continua bloqueada por RLS para `anon` e `authenticated`; futuras escritas devem ocorrer apenas no servidor.

## Lead Qualification Pipeline

Ao concluir o quiz, o resultado passa por:

```text
QuizCompleted
→ Lead Qualification
→ Notification Log
→ Sync Notification Queue
→ Email Provider
→ Resend Provider
```

Regras atuais:

- `alto_potencial`: envia e-mail com prioridade `high`.
- `medio_potencial`: envia e-mail com prioridade `medium`.
- `baixo_potencial`: não envia e registra `ignored`.

O envio usa `services/notification/providers/email/EmailProvider`, que encapsula `ResendProvider`. O Resend nunca deve ser chamado diretamente fora dessa abstração.

Templates React Email ficam em `emails/templates/`:

- `lead-qualified.tsx`
- `lead-medium.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/Section.tsx`
- `components/Table.tsx`
- `components/CTA.tsx`

O e-mail é enviado com o assunto `Novo lead qualificado — Radar Previdenciário`. A API key fica em `RESEND_API_KEY`, somente no servidor.

## Office Email Configuration

A identidade institucional de envio vem de `OfficeConfig`, em `config/office/default.ts`, e é lida por `getOfficeConfig()`:

```ts
email: {
  fromName: "Resende Advogados Associados",
  fromAddress: "contato@mail.radarprevidenciario.com.br",
  replyTo: "contato@resendeadvogados.com.br",
  notificationEmail: ""
}
```

Prioridade de resolução no MVP:

```text
OfficeConfig
→ variáveis de ambiente
→ erro explícito
```

As variáveis `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO` e `OFFICE_NOTIFICATION_EMAIL` continuam existindo apenas como fallback do MVP. O `ResendProvider` não lê essas variáveis diretamente; ele consome `getOfficeConfig()`.

O domínio de `EMAIL_FROM_ADDRESS` deve estar verificado na Resend. O campo `replyTo` define para onde respostas ao e-mail serão encaminhadas.

Idempotência:

- cada payload gera `payload_hash`;
- antes do envio, a aplicação busca `provider + payload_hash`;
- se já existir `sent`, não reenvia;
- registros ativos (`pending`, `processing`, `retrying`) não geram duplicidade;
- falhas temporárias entram em retry até 3 tentativas com backoff exponencial.

Eventos internos adicionados:

- `NotificationQueued`
- `NotificationSent`
- `NotificationFailed`
- `NotificationIgnored`

Falha de e-mail não bloqueia `/resultado`. O erro é registrado de forma sanitizada, sem payload completo, API key, e-mail/telefone expostos em logs de aplicação.

Testes automatizados não enviam e-mails reais: `E2E_MOCK_SUPABASE=true` ativa Supabase em memória e `NODE_ENV=test`/dry-run evita chamada externa ao provider.

## External Tracking Setup

A camada externa fica desacoplada em `services/external-tracking/`, `lib/tracking/`, `components/tracking/`, `config/tracking/` e `types/tracking/`.

Eventos implementados:

- `PageView`
- `LeadStarted`
- `LeadSubmitted`
- `QuizStarted`
- `QuizCompleted`
- `QualifiedLead`
- `ResultViewed`
- `WhatsAppClick`

Estratégia:

```text
tracking_events
→ event_payload.external_event_id
→ Browser: dataLayer, Meta Pixel, GA4 fallback
→ Server: Meta Conversions API
→ external_tracking_deliveries
```

O `dataLayer` é o contrato central do navegador. No MVP, quando GTM está configurado, GTM assume GA4 e Meta Pixel no browser; `gtag.js` e Meta Pixel diretos só são fallback quando não houver GTM configurado. Meta CAPI continua server-side.

Mapeamentos principais:

- `LeadSubmitted`: Meta `Lead`, GA4 `generate_lead`.
- `WhatsAppClick`: Meta `Contact`, GA4 `whatsapp_click`.
- `QualifiedLead`: evento customizado Meta `QualifiedLead`, GA4 `qualified_lead`.

Ativação local em dry-run:

```env
NEXT_PUBLIC_TRACKING_ENABLED=true
NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED=true
EXTERNAL_TRACKING_DRY_RUN=true
```

Para validação real, configure os IDs/tokens na Vercel por ambiente e use `META_TRACKING_TEST_MODE=true` com `META_TEST_EVENT_CODE` apenas durante testes no Events Manager.

Documentação operacional completa:

- `docs/external-tracking.md`

## Estrutura

- `app/`: rotas, layouts e Metadata API.
- `components/`: componentes reutilizáveis, UI shadcn e layout.
- `config/`: branding, tema, SEO, jurídico e dados institucionais do escritório.
- `config/quiz/`: perguntas, fluxos e benefícios do Question Engine.
- `config/quiz/templates/`: templates modulares padrão da plataforma.
- `hooks/`: hooks React futuros.
- `lib/`: utilitários de infraestrutura.
- `services/`: integrações e serviços futuros.
- `types/`: tipos compartilhados.
- `utils/`: funções utilitárias.
- `styles/`: estilos compartilhados futuros.
- `public/`: assets públicos.
- `docs/`: documentação técnica inicial.
- `supabase/`: estrutura reservada para configuração futura do Supabase.

## Brand Config System

O projeto foi estruturado para operar como SaaS multi-escritório. Nenhum componente deve conter dados institucionais fixos de um escritório.

Para trocar a marca ou adaptar a aplicação para outro escritório, altere apenas os arquivos dentro de `config/`:

- `brand/default.ts`: nome, logo, contatos, redes sociais, endereço e dados institucionais.
- `theme/default.ts`: cores, fontes, radius, sombras, botões, cards e badges.
- `office/default.ts`: responsável, OAB, especialidades, regiões atendidas, horário e mensagem de WhatsApp.
- `seo/default.ts`: título, descrição, keywords, locale e imagens sociais.
- `legal/default.ts`: política de privacidade, termos, disclaimer e cookies.

O Tailwind usa CSS variables geradas pelo tema configurável, então ajustes visuais devem começar pelo tema local.

## Quality Gate

O projeto possui uma camada de validação automatizada com Vitest, Testing Library, coverage V8 e Playwright.

Comandos principais:

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
```

Os testes unitários e de integração ficam em `tests/unit/` e `tests/integration/`. Eles cobrem validações, helpers de atribuição, normalização de telefone, Rule Engine, Result Engine, persistência de resultado, tracking, Notification Engine e Server Actions.

O coverage gate exige no mínimo 90% de statements, 90% de lines, 85% de functions e 80% de branches nos módulos críticos configurados em `vitest.config.ts`.

Os testes E2E ficam em `tests/e2e/` e rodam em Chromium, Firefox, WebKit e mobile Chromium. Durante E2E, `E2E_MOCK_SUPABASE=true` ativa um cliente Supabase server-only em memória, sem depender do banco real e sem expor secrets.

## Arquitetura de configurações

No MVP, os arquivos `default.ts` dentro de cada domínio de `config/` são a origem local das configurações.

Componentes e páginas não devem importar esses arquivos diretamente. Toda leitura deve passar por:

```ts
import { getAppConfig, getBrandConfig } from "@/services/configuration";
```

A camada funciona assim:

```text
Component/Page
  -> services/configuration
  -> config/loader.ts
  -> config/*/default.ts
```

Para trocar os dados do escritório no MVP, edite apenas os arquivos locais dentro de `config/`. Para a fase SaaS, a mesma API interna poderá buscar configurações no Supabase por tenant, domínio ou slug sem alterar os componentes visuais.

## Rotas

- `/`
- `/cadastro`
- `/quiz`
- `/quiz/salario-maternidade`
- `/quiz/fibromialgia`
- `/quiz/depressao`
- `/quiz/autismo`
- `/resultado`
- `/privacidade`
- `/termos`

## Git e commits

O projeto usa Conventional Commits:

```text
feat: adiciona nova funcionalidade
fix: corrige comportamento
docs: altera documentação
chore: tarefas de manutenção
ci: altera pipeline
```

Husky e lint-staged executam validações antes do commit.

## Fluxo de desenvolvimento

O fluxo atual é:

```text
desenvolvimento
→ testes
→ revisão técnica
→ Preview
→ validação operacional
→ migration controlada
→ deploy
→ monitoramento
```

Revisão jurídica é preventiva, periódica e recomendada antes de lançamento comercial amplo ou mudanças jurídicas relevantes no Rule Engine central. Ela não bloqueia commit, push, Pull Request, Preview ou testes técnicos.

Gates operacionais permanecem para migration em produção, deploy de produção, uso de dados reais, criação de usuários reais, ativação de tracking externo real, disparo de marketing, exclusão de dados, alteração destrutiva de banco e merge em `main` sem CI verde.

## CI

O workflow `.github/workflows/ci.yml` executa em pushes para `main` e pull requests:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e`

## Deploy

O projeto está pronto para deploy na Vercel. Configure as variáveis necessárias no painel da Vercel antes de habilitar integrações reais.
