# Radar Previdenciário

Aplicação web responsiva para geração de leads qualificados para escritórios de advocacia previdenciária.

O projeto já contém a estrutura técnica inicial, o sistema visual configurável e o primeiro fluxo funcional de cadastro de lead com captura de atribuição. O quiz, motor de regras, resultado funcional, autenticação, e-mails, APIs públicas e integrações externas de tracking ainda não foram implementados.

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

## Estrutura

- `app/`: rotas, layouts e Metadata API.
- `components/`: componentes reutilizáveis, UI shadcn e layout.
- `config/`: branding, tema, SEO, jurídico e dados institucionais do escritório.
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

## Deploy

O projeto está pronto para deploy na Vercel. Configure as variáveis necessárias no painel da Vercel antes de habilitar integrações reais.
