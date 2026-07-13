# Roadmap

## Concluído na fundação

- Notification schema hardening.
- Lead Qualification Pipeline.
- Notification Engine com Email Provider e Resend Provider.
- Templates React Email.
- Idempotência por payload hash.
- Retry com backoff exponencial.

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

## Fase SaaS

- Criar tabela `tenants`.
- Criar configurações por escritório.
- Resolver tenant por domínio ou slug.
- Buscar configuração no Supabase.
- Adicionar painel administrativo.
- Adicionar cache seguro por tenant.
