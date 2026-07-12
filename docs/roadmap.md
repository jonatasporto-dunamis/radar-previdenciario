# Roadmap

## Próximas fases do quiz

- Criar Rule Engine separado do Question Engine.
- Criar catálogo real de benefícios previdenciários.
- Mapear perguntas por benefício e por escritório.
- Definir estratégia de versionamento de fluxos em banco.
- Criar cálculo/classificação de resultado.
- Persistir `quiz_results` somente quando o motor jurídico estiver definido.
- Implementar limpeza de atribuição ao concluir o fluxo.
- Avaliar upsert ou constraint para resposta única por sessão/pergunta.

## Fase SaaS

- Criar tabela `tenants`.
- Criar configurações por escritório.
- Resolver tenant por domínio ou slug.
- Buscar configuração no Supabase.
- Adicionar painel administrativo.
- Adicionar cache seguro por tenant.
