# Matriz preliminar de bases legais de privacidade

Status: documento técnico-operacional para revisão periódica. Não constitui parecer jurídico nem aprovação definitiva das bases legais.

Data da pesquisa: 15/07/2026.

Fontes primárias consultadas:

- LGPD, Lei nº 13.709/2018: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm
- Guia ANPD sobre cookies: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
- Guia ANPD sobre legítimo interesse: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia_legitimo_interesse.pdf
- Guia ANPD sobre agentes de tratamento: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/Segunda_Versao_do_Guia_de_Agentes_de_Tratamento_retificada.pdf
- Direitos dos titulares, ANPD: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares

## Matriz por operação

| Operação                                    | Dados                                                                                                  | Finalidade                                                                                         | Base preliminar                                                                                                                               | Observações e salvaguardas                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Cadastro e solicitação de triagem           | Nome, telefone, e-mail, origem, dados técnicos essenciais                                              | Identificar o usuário, iniciar triagem, manter sessão e permitir contato relacionado à solicitação | Procedimentos preliminares relacionados a possível contratação, quando solicitados pelo titular; consentimento quando adotado pelo escritório | Coleta mínima, sem tratar lead como cliente automaticamente                                   |
| Respostas previdenciárias e dados sensíveis | Saúde, incapacidade, deficiência, situação laboral, renda, contexto familiar e contributivo            | Executar triagem solicitada e produzir resultado informativo                                       | Consentimento específico e destacado para dados sensíveis; exercício regular de direitos somente se validado pelo advogado                    | Não usar legítimo interesse para dados sensíveis; não presumir consentimento pelo uso do site |
| Contato sobre a triagem                     | Nome, telefone, e-mail e contexto da solicitação                                                       | Responder solicitação, esclarecer próximos passos e solicitar informações complementares           | Procedimentos solicitados pelo titular; consentimento específico, se adotado como base pelo escritório                                        | Não confundir com marketing futuro                                                            |
| Marketing futuro                            | Nome, e-mail, telefone e preferências, se aprovado futuramente                                         | Conteúdos informativos, campanhas e comunicações futuras                                           | Consentimento separado, específico, opcional e revogável                                                                                      | A recusa não impede cadastro, quiz, resultado ou contato sobre a solicitação atual            |
| Cookies necessários                         | Identificadores de sessão, preferência de consentimento, cookies de segurança                          | Sessão, segurança, continuidade e funcionamento do quiz                                            | Base operacional a revisar periodicamente; não deve depender de consentimento de marketing                                                    | Permite funcionamento essencial mesmo sem cookies de mensuração                               |
| Cookies e mensuração                        | Eventos genéricos, atribuição, Meta Pixel, GA4, GTM, identificadores de publicidade quando habilitados | Analytics, atribuição e otimização consentida                                                      | Consentimento prévio, livre, informado e revogável, salvo tecnologia estritamente necessária                                                  | Tags de mensuração devem permanecer bloqueadas antes da autorização                           |
| Segurança e logs                            | IP, user agent, eventos técnicos e auditoria operacional                                               | Prevenção de fraude, segurança, auditoria e diagnóstico técnico                                    | Legítimo interesse, obrigação legal ou exercício regular de direitos, conforme teste de balanceamento                                         | Minimização, acesso restrito e retenção limitada                                              |
| Contratação futura                          | Dados do relacionamento profissional, documentos e comunicações                                        | Prestação de serviço jurídico, se houver contratação formal                                        | Política e documentação próprias do relacionamento profissional                                                                               | Lead não vira cliente automaticamente                                                         |

## Teste de legítimo interesse

Legítimo interesse não deve ser usado de forma genérica. Quando sugerido para operações não sensíveis, o responsável deve documentar:

- finalidade legítima;
- necessidade e proporcionalidade;
- expectativa razoável do titular;
- impacto sobre o titular;
- dados utilizados;
- salvaguardas adotadas;
- direito de oposição;
- conclusão;
- responsável pela aprovação.

Conclusão preliminar: no MVP, legítimo interesse pode ser avaliado apenas para segurança, prevenção de abuso e logs operacionais não sensíveis. Não deve ser usado para respostas sensíveis do quiz, saúde, deficiência, renda ou marketing.

## Consentimentos técnicos

- Ciência compacta de Termos/Política e autorização de uso das informações fornecidas: `TermsAcknowledged`.
- Contato relacionado à triagem: `ContactConsentGranted`.
- Dados sensíveis da triagem: aviso contextual e, quando registrado em fluxo específico, `SensitiveDataConsentGranted` ou `SensitiveDataConsentDenied`.
- Cookies de mensuração: `TrackingConsentGranted` ou `TrackingConsentDenied`.
- Marketing futuro: `MarketingConsentGranted` ou `MarketingConsentDenied`.

Cada evento registra `consent_type`, `consent_version`, `policy_version`, `status` e `timestamp` em `tracking_events`.

## Recomendações e pendências operacionais

- Revisar bases legais periodicamente e antes de novas finalidades relevantes.
- Configurar canal de privacidade quando disponível.
- Definir responsável interno por privacidade por tenant quando a operação exigir.
- Manter prazos de retenção padrão e permitir ajustes por tenant/contrato.
- Avaliar operadores e transferências internacionais quando novas integrações forem ativadas.
- Criar política específica para leads que venham a se tornar clientes.
