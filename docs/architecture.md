# Arquitetura

## Supabase

O Supabase será usado como banco de dados principal do Radar Previdenciário. A aplicação Next.js mantém integrações em `lib/supabase/`, com cliente público baseado em publishable/anon key e cliente administrativo exclusivo de servidor em `lib/supabase/admin.ts`.

A service role é usada somente em Server Actions e serviços server-only. Ela não deve ser importada por Client Components, não deve receber prefixo `NEXT_PUBLIC_` e nunca deve ser exposta em logs, bundle do navegador ou repositório.

## Brand Config System

A camada visual foi estruturada para SaaS multi-escritório. Dados institucionais, identidade visual, SEO e textos legais ficam centralizados em `config/`:

- `config/brand/`: nome, logo, contatos, redes sociais e dados institucionais.
- `config/theme/`: cores, fontes, radius, sombras, botões, cards e badges.
- `config/office/`: responsável técnico, OAB, especialidades, cidades, estados, atendimento e mensagem padrão.
- `config/seo/`: título, descrição, keywords, locale e imagens sociais.
- `config/legal/`: títulos legais, disclaimer e política de cookies.

Componentes de layout e UI consomem essas informações por meio de `services/configuration`. Para trocar o escritório exibido pela aplicação, a regra é alterar apenas os arquivos em `config/`, mantendo componentes sem dados institucionais hardcoded.

Os tokens de Tailwind usam CSS variables geradas a partir de `themeConfig` no layout raiz. Isso mantém dark mode e identidade visual editáveis sem reescrever classes de componentes.

## Configuration Service Layer

A aplicação usa uma camada intermediária para leitura de configurações. Componentes e páginas não importam arquivos `default.ts` diretamente, porque essa dependência criaria acoplamento com a origem local dos dados e dificultaria a futura evolução para SaaS multi-tenant.

Fluxo atual:

```text
Component/Page
    ↓
Configuration Service
    ↓
App Config Loader
    ↓
Local Config — MVP
    ↓
Supabase Config — Futuro
```

Responsabilidades:

- `config/loader.ts`: único ponto autorizado a importar os arquivos locais `default.ts`; valida a configuração completa com Zod e retorna `AppConfig`.
- `config/schemas.ts`: schemas Zod para `BrandConfig`, `OfficeConfig`, `ThemeConfig`, `SeoConfig`, `LegalConfig` e `AppConfig`.
- `services/configuration/getAppConfig.ts`: serviço de leitura da configuração completa.
- `services/configuration/getBrandConfig.ts`: retorna apenas a configuração de marca.
- `services/configuration/getOfficeConfig.ts`: retorna apenas a configuração institucional do escritório.
- `services/configuration/getThemeConfig.ts`: retorna apenas tokens visuais.
- `services/configuration/getSeoConfig.ts`: retorna apenas SEO.
- `services/configuration/getLegalConfig.ts`: retorna apenas textos legais.

No MVP, `loadAppConfig()` delega para `loadLocalConfig()`. O contrato já aceita `ConfigurationContext`, mas ainda não resolve tenant. A resolução futura poderá seguir a ordem:

```text
hostname
→ slug
→ tenantId
→ configuração padrão
```

Quando a aplicação evoluir para SaaS, essa camada poderá buscar configurações no Supabase, adicionar cache seguro por tenant e manter os componentes visuais inalterados.

## Lead Registration Flow

O primeiro fluxo funcional do MVP segue a cadeia:

```text
Client Form
    ↓
Server Action
    ↓
Validation
    ↓
Deduplication
    ↓
Supabase Admin
    ↓
leads
    ↓
tracking_events
    ↓
HTTP-only cookie
    ↓
/quiz
```

O formulário de `/cadastro` roda como Client Component para usar React Hook Form, validação Zod e estado de envio. A persistência acontece apenas em `app/cadastro/actions.ts`, evitando escrita direta no Supabase pelo navegador.

A Server Action valida o payload recebido, rejeita honeypot preenchido com mensagem genérica, normaliza nome, e-mail e telefone, extrai IP somente de headers do servidor, aplica rate limit best effort por IP e chama serviços server-only.

`services/leads/createLead.ts` usa o Supabase Admin Client para buscar leads recentes com o mesmo telefone normalizado nos últimos 15 minutos. Quando encontra registro recente, reutiliza o `leadId` sem sobrescrever dados anteriores. Essa deduplicação é proteção operacional, não regra definitiva de identidade.

Após criar ou reutilizar o lead, `services/tracking/trackEvent.ts` registra o evento interno `LeadSubmitted`. Se o tracking falhar, o lead não é removido e o usuário continua o fluxo; a conversão principal não depende de tracking secundário.

O `leadId` é preservado no cookie HTTP-only `rp_lead_session`, com `SameSite=Lax`, `Secure` em produção e duração de 2 horas. A rota `/quiz` verifica esse cookie no servidor e redireciona para `/cadastro` quando ausente. Nenhum dado pessoal é salvo em URL, cookie público ou `sessionStorage`.
