# Radar Previdenciário

Aplicação web responsiva para geração de leads qualificados para escritórios de advocacia previdenciária.

O projeto já contém a estrutura técnica inicial, o sistema visual configurável, o cadastro funcional de lead com captura de atribuição, a infraestrutura do quiz com persistência automática e a geração preliminar de resultado informativo. Autenticação, e-mails, APIs públicas, IA, painel administrativo e integrações externas de tracking ainda não foram implementados.

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
```

`SUPABASE_SERVICE_ROLE_KEY` deve existir somente em `.env.local` e nos secrets da Vercel. Nunca use prefixo `NEXT_PUBLIC_`, nunca importe em Client Components e nunca commite essa chave.

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

## Question Engine

O quiz foi estruturado para suportar múltiplos benefícios e múltiplos escritórios sem hardcode de perguntas dentro da tela.

Principais diretórios:

- `config/quiz/questions/`: perguntas versionadas.
- `config/quiz/flows/`: fluxos e ordem dos passos.
- `config/quiz/benefits/`: benefícios e contextos.
- `types/quiz/`: contratos do Question Engine.
- `services/quiz/engine/`: resolução de perguntas ativas e visibilidade.
- `services/quiz/session/`: criação/reuso de sessão, respostas e conclusão.
- `services/quiz/progress/`: progresso real.
- `services/quiz/navigation/`: anterior, próximo e retomada.
- `components/quiz/renderer/`: componentes por tipo de pergunta.

O primeiro fluxo exemplo possui 8 perguntas. Ele salva respostas em `quiz_answers`, cria/reutiliza `quiz_sessions`, calcula progresso real e registra `QuizStarted`, `QuestionAnswered`, `QuizCompleted`, `ResultGenerated` e `ResultViewed` em `tracking_events`.

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

O resultado é persistido em `quiz_results` com `lead_id`, `session_id`, `potential_benefit`, `score`, `classification`, `summary` e `ethical_disclaimer`. A rota `/resultado` lê o resultado mais recente do lead autenticado pelo cookie HTTP-only `rp_lead_session`.

`quiz_results.session_id` possui constraint única no banco remoto para evitar múltiplos resultados da mesma sessão. A camada de persistência usa `upsert` por `session_id`, e eventos de resultado possuem deduplicação em aplicação para evitar repetição em refresh ou dupla conclusão. `ResultViewed` é disparado por Server Action e protegido por cookie HTTP-only por resultado.

## Estrutura

- `app/`: rotas, layouts e Metadata API.
- `components/`: componentes reutilizáveis, UI shadcn e layout.
- `config/`: branding, tema, SEO, jurídico e dados institucionais do escritório.
- `config/quiz/`: perguntas, fluxos e benefícios do Question Engine.
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

Os testes unitários e de integração ficam em `tests/unit/` e `tests/integration/`. Eles cobrem validações, helpers de atribuição, normalização de telefone, Rule Engine, Result Engine, persistência de resultado, tracking e Server Actions.

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
