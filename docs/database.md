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
