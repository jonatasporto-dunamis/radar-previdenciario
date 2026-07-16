# Revisão jurídica, ética e comunicacional do MVP

Status: revisão técnica e preventiva concluída; revisão jurídica periódica recomendada.

Esta revisão não é parecer jurídico, aprovação regulatória ou validação ética definitiva. O objetivo foi reduzir riscos evidentes de linguagem, apresentação e privacidade antes da publicação do MVP, sem transformar a revisão jurídica em gate técnico permanente.

## Fontes oficiais consultadas

- Lei Geral de Proteção de Dados Pessoais (LGPD): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm
- Estatuto da Advocacia e da OAB: https://www.planalto.gov.br/ccivil_03/leis/l8906.htm
- Provimento OAB nº 205/2021: https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021
- Código de Ética e Disciplina da OAB: https://www.oab.org.br/publicacoes/AbrirPDF?LivroId=0000004085
- Cartilha oficial de publicidade na advocacia da OAB: https://marketingjuridico.oab.org.br/doc/cfoab--cartilha-digital-publicidade-advocacia.pdf
- Ementários oficiais da OAB: https://www.oab.org.br/jurisprudencia/ementarios
- Guia orientativo da ANPD sobre cookies e proteção de dados pessoais: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
- Guia orientativo da ANPD sobre legítimo interesse: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia_legitimo_interesse.pdf
- Guia orientativo da ANPD sobre agentes de tratamento: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/Segunda_Versao_do_Guia_de_Agentes_de_Tratamento_retificada.pdf
- Página oficial do INSS sobre auxílio por incapacidade temporária: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-por-incapacidade/auxilio-por-incapacidade-temporaria
- Página oficial do INSS sobre BPC à pessoa com deficiência: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-a-pessoa-com-deficiencia-bpc-loas
- Página oficial do INSS sobre BPC à pessoa idosa: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-a-pessoa-idosa-bpc-loas

## Escopo auditado

- Home, cadastro, quiz, resultado, privacidade e termos.
- Componentes de CTA, header, hero, formulário de lead e banner de consentimento.
- Configurações de marca, SEO, legal, escritório e perguntas do quiz.
- Result Engine, labels de resultado e sínteses informativas.
- Notificações internas por e-mail e payload de WhatsApp.
- Testes E2E e unitários relacionados aos textos revisados.

## Matriz de perguntas

| Pergunta              | Tipo     | Sensibilidade         | Risco observado                                             | Ação aplicada                                                                             |
| --------------------- | -------- | --------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Temas previdenciários | checkbox | Baixa/média           | Pode sugerir enquadramento jurídico definitivo              | Mantida como orientação de triagem; sem alteração de regra                                |
| Data de nascimento    | date     | Dado pessoal          | Pode sugerir conclusão por idade isolada                    | Descrição reforça que idade não confirma direito                                          |
| Trabalho atual        | boolean  | Dado socioeconômico   | Interpretação isolada pode induzir conclusão                | Mantida sem mudança de regra                                                              |
| Tipo de atividade     | radio    | Dado profissional     | Pode exigir opção neutra futura                             | Mantida; opção neutra depende de aprovação funcional                                      |
| Anos de contribuição  | number   | Dado previdenciário   | Estimativa pode ser confundida com prova                    | Descrição reforça estimativa e conferência documental                                     |
| Renda mensal          | currency | Dado financeiro       | Dado sensível de contexto socioeconômico                    | Descrição reforça opcionalidade, estimativa e ausência de documentos                      |
| Condição de saúde     | boolean  | Dado pessoal sensível | Pode induzir relato de diagnóstico/laudo                    | Descrição orienta não incluir diagnóstico, laudo ou detalhes médicos                      |
| Contexto adicional    | textarea | Campo livre sensível  | Pode receber documentos, dados de terceiros ou diagnósticos | Descrição orienta evitar documentos, laudos, diagnósticos detalhados e dados de terceiros |

## Riscos mapeados

| Severidade | Risco                                                        | Evidência                                                         | Tratamento                                                                                              |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Alta       | Exibição pública de score numérico no resultado              | Página `/resultado` mostrava "Score" e barra de progresso         | Removida da superfície pública; indicador permanece apenas operacional/interno                          |
| Alta       | Linguagem "Benefício provável"                               | E-mails e textos internos usavam rótulo de probabilidade          | Substituído por "Tema para análise" e aviso interno                                                     |
| Alta       | WhatsApp interno com nome e telefone no texto pré-preenchido | URL interna de notificação poderia conter PII no parâmetro `text` | Link interno de notificação usa apenas o destino do número; botão público usa mensagem genérica sem PII |
| Média      | CTA com "gratuita"                                           | Botões diziam "Iniciar análise gratuita"                          | Substituído por "Iniciar triagem informativa"                                                           |
| Média      | Privacidade e termos genéricos para dados sensíveis          | Páginas legais não detalhavam categorias/finalidades              | Textos reforçados com categorias de dados, finalidades, cookies, direitos e limites                     |
| Média      | Resultado poderia parecer conclusão jurídica                 | Página exibia classificação e benefício com pouca ressalva        | Textos reforçados como triagem interna, sem decisão do INSS ou parecer jurídico                         |
| Média      | Campo de saúde sem orientação mínima                         | Pergunta booleana não explicava evitar diagnóstico/laudo          | Descrição adicionada                                                                                    |
| Baixa      | Linguagem institucional voltada a "capturar leads"           | Home usava linguagem interna/comercial                            | Texto ajustado para triagem e contato responsável                                                       |

## Correções aplicadas

- Disclaimer central reescrito para deixar claro que a triagem não constitui consulta, parecer jurídico, confirmação de direito ou decisão de órgão competente.
- CTA público alterado para "Iniciar triagem informativa".
- Página de resultado deixou de exibir score numérico e passou a apresentar "Tema identificado para análise".
- Labels de notificação trocados de "Benefício provável" e "Score interno" para "Tema para análise" e "Indicador operacional interno".
- E-mails internos receberam aviso de que classificação e indicador não são parecer, probabilidade de êxito, promessa de resultado ou decisão administrativa/judicial.
- WhatsApp de notificação interna deixou de incluir mensagem automática com nome, telefone, score, classificação ou tema sensível.
- Mensagem pública padrão do botão flutuante ficou genérica e editável, sem PII, score, classificação, benefício, diagnóstico ou afirmação de direito.
- Política de Privacidade recebeu texto de categorias, finalidades, cookies, mensuração, operadores e direitos do titular.
- Termos de Uso receberam limites sobre natureza informativa, ausência de relação advogado-cliente automática, ausência de promessa de resultado e responsabilidade do usuário.
- Perguntas sobre idade, renda, saúde e contexto adicional receberam descrições preventivas.
- Teste unitário de conteúdo adicionado para evitar regressão de CTA, score público, benefício provável e disclaimer.
- Classificação pública separada da classificação interna por `PublicResult`.
- Rótulos públicos "Alto potencial", "Médio potencial" e "Baixo potencial" removidos da página de resultado.
- Identificação profissional confirmada adicionada: EDILSON DE ALMEIDA RESENDE — OAB/BA 45.987.
- Unidades confirmadas adicionadas: Vitória da Conquista/BA, Belo Campo/BA e Jitaúna/BA.
- Consentimentos separados para ciência de termos/política, contato de triagem, dados sensíveis, mensuração e marketing futuro.
- Estados `unknown`, `withheld` e `not_applicable` adicionados ao modelo de respostas.
- `requiresHumanReview` adicionado para respostas críticas desconhecidas ou omitidas.
- Política de retenção configurável criada em `officeConfig.dataRetention`.
- Documentos criados: `docs/privacy-legal-bases.md`, `docs/data-retention-policy.md`, `docs/data-subject-rights.md` e `docs/rule-engine-legal-review.md`.

## Decisões aplicadas

- A classificação operacional interna foi preservada com `alto_potencial`, `medio_potencial`, `baixo_potencial`, score, thresholds e prioridade.
- A resposta pública passou a exibir apenas título, resumo, próximo passo, disclaimer, tema e mensagem informativa.
- Score, percentual, chance, probabilidade, prioridade, regra combinada e classificação interna não são serializados no `PublicResult`.
- As regras previdenciárias não foram alteradas; a auditoria documentou limitações e pontos recomendados para revisão periódica.

## Classificação interna e pública

Campos internos preservados:

- `classification`;
- `score`;
- `threshold`;
- `priority`;
- `shouldNotify`;
- `potentialBenefit`;
- `ruleMatches`;
- `operationalReason`;
- `dataCompleteness`;
- `missingCriticalAnswers`;
- `requiresHumanReview`.

Campos públicos permitidos:

- `title`;
- `summary`;
- `nextStep`;
- `disclaimer`;
- `topicLabel`;
- `informationalMessage`.

## Textos públicos por cenário

| Cenário interno   | Título público                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| `alto_potencial`  | Suas respostas indicam que a situação merece uma avaliação individualizada |
| `medio_potencial` | Podem ser necessárias mais informações para avaliar a situação             |
| `baixo_potencial` | Não foi possível identificar elementos suficientes nesta triagem           |

Nenhum desses textos informa score, chance de êxito, probabilidade, aprovação ou elegibilidade.

## CTAs

CTAs revisados para linguagem informativa:

- "Iniciar triagem informativa";
- "Iniciar triagem";
- "Nova triagem informativa";
- "Ver política de privacidade";
- "Abrir conversa pelo WhatsApp".

Não foram encontrados CTAs públicos com "análise gratuita", "consulta grátis", "garanta", "receba", "última chance" ou promessa de benefício após a revisão.

## Identificação profissional

- Escritório: Resende Advogados Associados.
- Profissional responsável configurado: EDILSON DE ALMEIDA RESENDE — OAB/BA 45.987.
- Unidades: Vitória da Conquista/BA, Belo Campo/BA e Jitaúna/BA.
- Não foram adicionados CNPJ, razão social registral, endereço completo, CEP, registro de sociedade, telefone adicional ou canal de privacidade não confirmado.

## Bases legais e consentimentos

Matriz documentada em `docs/privacy-legal-bases.md`.

Eventos internos de consentimento:

- `TermsAcknowledged`;
- `ContactConsentGranted`;
- `SensitiveDataConsentGranted`;
- `SensitiveDataConsentDenied`;
- `MarketingConsentGranted`;
- `MarketingConsentDenied`;
- `TrackingConsentGranted`;
- `TrackingConsentDenied`.

Marketing futuro é opcional e desmarcado. Cookies de mensuração continuam recusáveis. Dados sensíveis devem receber aviso contextual claro e opções de não resposta.

## Retenção e exclusão

- Política operacional inicial criada em `docs/data-retention-policy.md`.
- Processo de direitos do titular criado em `docs/data-subject-rights.md`.
- Configuração por tenant adicionada em `officeConfig.dataRetention`.
- Nenhum job automático de exclusão foi criado.

## Rule Engine

Documento criado em `docs/rule-engine-legal-review.md`.

Resultado da revisão:

- pesos e thresholds preservados;
- nenhuma tese jurídica nova criada;
- nenhum requisito legal removido;
- nenhum precedente isolado transformado em regra;
- todas as regras atuais marcadas como operacionais, sem exibição pública de conclusão jurídica.

## Jurisprudência

Precedentes e orientações classificados:

- STJ, repetitivo sobre BPC e miserabilidade por outros meios de prova: repetitivo.
- STJ, Súmula 149 sobre prova exclusivamente testemunhal rural: súmula.
- INSS/Lei nº 8.213/1991 sobre incapacidade: legislação/regulamento, sem conclusão automática por autodeclaração.
- EC nº 103/2019 e legislação previdenciária sobre aposentadorias: legislação expressa, insuficiente para cálculo com as perguntas atuais.

Não foram localizadas, nesta revisão técnica, bases suficientes para converter precedentes isolados em regras determinísticas. Pesquisa em STF, TNU e TRF1 permanece recomendada antes de qualquer evolução jurídica do Rule Engine.

## Divergências e limitações

- BPC exige análise de renda familiar, composição familiar, deficiência/idade e elementos sociais; o threshold de renda atual é apenas operacional.
- Incapacidade não pode ser inferida por condição de saúde autodeclarada.
- Aposentadoria depende de múltiplos critérios não capturados pelo fluxo atual.
- Jurisprudência não foi convertida em regra determinística.

## Itens para revisão periódica

| Item                      | Recomendação operacional                                                       |
| ------------------------- | ------------------------------------------------------------------------------ |
| Textos públicos           | Revisar antes de lançamento comercial amplo e quando houver mudança relevante. |
| Política de Privacidade   | Manter coerente com dados coletados, operadores e consentimentos.              |
| Termos de Uso             | Manter separação entre triagem operacional e avaliação jurídica.               |
| Bases legais              | Revisar periodicamente e quando novas finalidades forem adicionadas.           |
| Consentimentos            | Manter compactos, claros e proporcionais.                                      |
| Retenção                  | Usar política padrão configurável e registrar exceções necessárias.            |
| Processo de exclusão      | Manter fluxo operacional para direitos do titular.                             |
| Rule Engine               | Revisar mudanças jurídicas relevantes antes de produção.                       |
| Thresholds                | Tratar como priorização interna, não como chance ou conclusão.                 |
| Hipóteses de benefício    | Exibir publicamente apenas como tema para análise.                             |
| Publicidade paga/orgânica | Revisar peças para evitar promessa, urgência indevida e captação imprópria.    |

## Itens não alterados

- Pesos, thresholds e lógica do Rule Engine.
- Schema Supabase, migrations e types oficiais.
- Tracking externo, eventos, Pixel, CAPI, GA4 e GTM.
- Domínio, canonical, DNS, Vercel e deploy.
- Fluxo funcional do cadastro, quiz, persistência e notificações.
- Autenticação, API, painel administrativo, IA ou e-mails novos.

## Recomendações para evolução

- Manter os rótulos internos `alto_potencial`, `medio_potencial` e `baixo_potencial` apenas para operação interna.
- Validar mudanças relevantes de pesos, thresholds, perguntas, benefícios e sínteses do Rule Engine antes de produção.
- Completar dados institucionais opcionais quando disponíveis, sem bloquear o MVP.
- Revisar bases legais, prazos de retenção e procedimento de atendimento aos direitos do titular periodicamente.
- Simplificar consentimentos sem misturar triagem, mensuração e marketing.
- Manter opções "não sei informar" e "prefiro não informar" nos pontos sensíveis ou incertos.
- Avaliar operadores/suboperadores como Vercel, Supabase, Resend, Google e Meta quando habilitados.
- Revisar peças de campanha externas para garantir sobriedade, caráter informativo e ausência de promessa, indução ao litígio ou captação imprópria.

## Checklist operacional de lançamento

- Quality Gate técnico executado.
- Dados institucionais mínimos do tenant configurados.
- Política de Privacidade e Termos coerentes com o fluxo vigente.
- Retenção e bases legais documentadas em padrão central.
- Tracking externo validado com consentimento e payload sanitizado antes de ativação real.
- Ambiente de produção testado sem dados reais desnecessários.
- Revisão jurídica preventiva recomendada antes de lançamento comercial amplo.

Conclusão: revisão técnica e preventiva concluída; o desenvolvimento pode seguir com testes, Preview e PR, mantendo gates operacionais para produção, dados reais, tracking real e mudanças relevantes do Rule Engine central.
