# Validacao operacional em producao

Data: 2026-07-21  
Ambiente: producao  
Dominio oficial: https://radarprevidenciario.com.br  
Tenant validado: `resende-advogados`  
Administrador validado: `jonatasporto@live.com`  
Commit de producao validado: `8a6203e33315bf0317ff004aec1c837971824417`

## Estado inicial

- Working tree local limpo na branch `main`.
- `origin/main` sincronizado com o deploy de producao.
- CI da `main` concluida com sucesso no job `Validate`.
- Vercel em estado `Ready` para o dominio oficial.
- Migrations remotas sincronizadas com o projeto Supabase.
- Apenas o membership ativo esperado permaneceu visivel: admin do tenant `resende-advogados`.

## Jornadas simuladas

Foram executadas quatro jornadas sinteticas com dominio `example.invalid`:

- Jornada A: quiz geral com campanha operacional geral.
- Jornada B: quiz tematico de salario-maternidade.
- Jornada C: quiz de fibromialgia com respostas `unknown` e `withheld`.
- Jornada D: abandono, retomada e conclusao da sessao.

As entradas usaram UTMs controladas para `source`, `medium`, `campaign`, `content` e `term`. PII nao foi colocada em query string.

## Cadastro, consentimentos e quiz

- Leads criados uma unica vez por jornada.
- Atribuicao persistida com campanha correta.
- `user_agent` e `ip_address` persistidos.
- Eventos internos de consentimento registrados: `TermsAcknowledged`, `ContactConsentGranted` e `MarketingConsentDenied`.
- Jornada C registrou `SensitiveDataConsentDenied`.
- Sessoes de quiz foram concluidas sem duplicidade aberta.
- Respostas foram persistidas sem duplicar a mesma pergunta.
- Jornada D retomou a mesma sessao antes de concluir.

## Resultados

- Todas as jornadas geraram `quiz_results`.
- Quiz geral e salario-maternidade ficaram com completude `complete`.
- Fibromialgia ficou com completude `insufficient`, informacoes criticas ausentes e `requires_human_review=true`.
- Resultado publico nao exibiu score, classificacao interna, percentual, promessa, diagnostico ou texto tecnico interno.
- Acesso direto a resultado sem cookie ou com cookie invalido foi bloqueado/redirecionado.

## Tracking e notificacoes

- Eventos internos validados: `LeadSubmitted`, `QuizStarted`, `QuestionAnswered`, `QuizCompleted`, `ResultGenerated`, `QualifiedLead`, `NotificationQueued`, `NotificationSent`, `NotificationIgnored` e `ResultViewed` quando aplicavel.
- `QuestionAnswered` ficou coerente com a quantidade de respostas gravadas.
- Notificacoes das jornadas qualificadas foram enviadas para `jonatasporto@live.com`.
- Jornadas nao qualificadas foram registradas como ignoradas pela pipeline.
- Nao houve notificacoes falhadas recentes durante a validacao.

## Painel

- Login administrativo validado com `jonatasporto@live.com`.
- Dashboard, lista de leads, filtros, detalhes, templates e conta abriram em producao.
- Busca por nome, e-mail sintetico e telefone sintetico foi validada sem PII na URL.
- Cookie `rp_office_lead_search` validado com `httpOnly`, `Secure`, `SameSite=Lax` e path `/painel`.
- Filtros por tipo de quiz, campanha, status, completude e revisao humana foram validados.
- Detalhes exibiram identificacao, atribuicao, qualificacao interna, respostas, notificacoes e timeline.

## Operacao comercial

- Jornada A percorreu `new -> contacted -> in_review -> converted -> archived`.
- Jornada B percorreu `new -> contacted -> in_review -> scheduled -> archived`.
- Jornada C percorreu `new -> in_review -> awaiting_information -> archived`.
- Jornada D percorreu `new -> contacted -> lost -> archived`.
- Historico de status foi preservado como append-only.
- Dashboard foi comparado com consultas diretas antes, durante e depois das movimentacoes.

## Notas e auditoria

- Foram criadas quatro notas sinteticas.
- Uma nota foi editada.
- Todas as notas sinteticas foram removidas pelo painel.
- Tentativa de nota com `<script>` foi rejeitada e nao executou dialog no navegador.
- Auditoria registrou criacao, edicao, exclusao de notas e mudancas de status.
- Metadata de auditoria nao conteve corpo completo da nota, token, cookie ou credencial.

## Isolamento

- Foi criada uma fixture minima e removivel de Tenant B e tenant inativo.
- O admin do tenant A nao conseguiu listar, buscar, abrir, criar nota, alterar status ou acessar template privado do Tenant B.
- Membership suspensa e tenant inativo nao concederam acesso.
- URL manipulada de lead de outro tenant foi bloqueada na interface.
- A fixture temporaria de isolamento foi removida.

## Navegadores e logs

- Smoke validado em Chromium, Firefox, WebKit e Mobile Chromium.
- Paginas publicas, redirecionamento seguro de `/quiz`, login, dashboard, leads e templates foram validados.
- Logs recentes da Vercel nao apresentaram `500`.
- Eventos esperados de redirecionamento apareceram como `307`.
- Supabase nao registrou notificacoes falhadas recentes.

## Falhas encontradas e correcoes

- Falha 1: reenvio de resposta igual gerava evento `QuestionAnswered` duplicado.
  - Correcao: `fix: prevent duplicate quiz answer tracking`.
  - PR: #6.
  - Status: CI verde, merge realizado e deploy `Ready`.

- Falha 2: corrida na abertura de quiz tematico podia criar sessao iniciada duplicada.
  - Correcao: `fix: prevent duplicate thematic quiz sessions`.
  - PR: #7.
  - Status: CI verde, merge realizado e deploy `Ready`.

## Fixtures

- Leads sinteticos finais foram arquivados.
- Fixtures sinteticas antigas com dominio `example.invalid` que ainda estavam abertas foram arquivadas com historico e auditoria.
- Notas sinteticas foram removidas quando permitido.
- Audit logs e historicos append-only foram preservados.

## Pendencias

- Nenhuma pendencia bloqueadora identificada nesta simulacao.
- Proxima acao recomendada: manter monitoramento das proximas capturas reais no painel e revisar a experiencia operacional com o escritorio apos os primeiros atendimentos reais.
