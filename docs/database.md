# Database

## Visão geral do modelo

O Supabase será usado como banco relacional principal do Radar Previdenciário. A modelagem inicial cobre captura de leads, sessões do quiz, respostas, resultados, eventos de tracking e logs de notificação.

Nesta etapa, o banco está preparado apenas como estrutura. Não há formulários, autenticação, APIs públicas ou escrita real conectada à interface.

## Tabelas

### leads

Armazena dados básicos do lead e campos de atribuição de campanha capturados no momento da entrada.

### quiz_sessions

Representa uma sessão de questionário associada a um lead, com início, conclusão e status.

### quiz_answers

Armazena respostas individuais de uma sessão do quiz, vinculadas ao lead e à sessão.

### quiz_results

Armazena o resultado calculado para uma sessão, incluindo pontuação, classificação e textos explicativos futuros.

### tracking_events

Registra eventos previstos da jornada e um payload flexível em `jsonb`.

### notification_logs

Registra tentativas futuras de notificação associadas a leads e resultados.

## Relacionamentos

- `leads` 1:N `quiz_sessions`
- `leads` 1:N `quiz_answers`
- `leads` 1:N `quiz_results`
- `quiz_sessions` 1:N `quiz_answers`
- `quiz_sessions` 1:N `quiz_results`
- `leads` 1:N `tracking_events`
- `quiz_sessions` 1:N `tracking_events`
- `leads` 1:N `notification_logs`
- `quiz_results` 1:N `notification_logs`

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

Inserções e leituras devem ser implementadas futuramente via Server Actions ou API segura, usando service role no servidor quando houver fluxo definido. A service role não foi adicionada nesta etapa.

## Próximos passos

- Criar projeto Supabase real.
- Aplicar a migration em ambiente de desenvolvimento.
- Gerar tipos automáticos do Supabase quando o projeto remoto existir.
- Implementar Server Actions ou endpoints seguros para escrita.
- Revisar policies de RLS quando autenticação ou painel administrativo forem definidos.

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

Os types oficiais foram gerados com:

```bash
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Arquivo gerado:

- `types/supabase.ts`

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
