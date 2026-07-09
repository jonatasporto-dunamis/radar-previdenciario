# Radar Previdenciário

Aplicação web responsiva para geração de leads qualificados para escritórios de advocacia previdenciária.

Esta etapa contém apenas a estrutura técnica inicial do projeto. O quiz, banco de dados, autenticação, tracking, e-mails, APIs e regras de negócio ainda não foram implementados.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
OFFICE_NOTIFICATION_EMAIL=
```

## Estrutura

- `app/`: rotas, layouts e Metadata API.
- `components/`: componentes reutilizáveis, UI shadcn e layout.
- `hooks/`: hooks React futuros.
- `lib/`: utilitários de infraestrutura.
- `services/`: integrações e serviços futuros.
- `types/`: tipos compartilhados.
- `utils/`: funções utilitárias.
- `styles/`: estilos compartilhados futuros.
- `public/`: assets públicos.
- `docs/`: documentação técnica inicial.
- `supabase/`: estrutura reservada para configuração futura do Supabase.

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
