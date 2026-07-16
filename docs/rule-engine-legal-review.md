# Revisão técnica do Rule Engine

Status: revisão preventiva documentada. As regras, pesos e thresholds permanecem operacionais e não devem ser tratados como parecer jurídico.

Data da pesquisa: 15/07/2026.

## Fontes oficiais consultadas

- Constituição Federal, seguridade social e assistência social: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
- Lei nº 8.212/1991: https://www.planalto.gov.br/ccivil_03/leis/l8212compilado.htm
- Lei nº 8.213/1991: https://www.planalto.gov.br/ccivil_03/leis/l8213compilado.htm
- Decreto nº 3.048/1999: https://www.planalto.gov.br/ccivil_03/decreto/d3048compilado.htm
- Lei nº 8.742/1993: https://www.planalto.gov.br/ccivil_03/leis/L8742compilado.htm
- Emenda Constitucional nº 103/2019: https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc103.htm
- IN PRES/INSS nº 128/2022: https://www.in.gov.br/web/dou/-/instrucao-normativa-pres/inss-n-128-de-28-de-marco-de-2022-389275446
- Página INSS sobre benefício por incapacidade temporária: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-por-incapacidade/auxilio-por-incapacidade-temporaria
- Página INSS sobre BPC pessoa com deficiência: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-a-pessoa-com-deficiencia-bpc-loas
- Página INSS sobre BPC pessoa idosa: https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-a-pessoa-idosa-bpc-loas
- Página INSS sobre aposentadoria por incapacidade permanente: https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadorias/aposentadoria-por-incapacidade-permanente
- STJ, jurisprudência em teses sobre aposentadoria rural e Súmula 149/STJ: https://www.stj.jus.br/internet_docs/jurisprudencia/jurisprudenciaemteses/Jurisprud%C3%AAncia%20em%20teses%2094%20-%20Aposentadoria%20Rural.pdf
- STJ, repetitivo sobre BPC e miserabilidade por outros meios de prova: https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-repetitivos-2018_1_capDireitoPrevidenciario.pdf

## Classificação de precedentes

| Tema                                                   | Fonte                                                                | Classificação          | Impacto                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| BPC e renda familiar per capita                        | STJ, recurso repetitivo registrado em revista oficial de repetitivos | Repetitivo             | Critério de renda não deve ser tratado como única forma de prova em regra determinística |
| Aposentadoria rural e prova exclusivamente testemunhal | Súmula 149/STJ citada em material oficial do STJ                     | Súmula                 | Regra automatizada não deve concluir direito rural sem início de prova material          |
| Incapacidade laboral                                   | Páginas oficiais do INSS e Lei nº 8.213/1991                         | Legislação/regulamento | Condição de saúde autodeclarada não equivale a incapacidade reconhecida por perícia      |
| Regras de transição e aposentadorias                   | EC nº 103/2019, Lei nº 8.213/1991 e Decreto nº 3.048/1999            | Legislação expressa    | Perguntas atuais são insuficientes para cálculo ou elegibilidade definitiva              |

## Mapa das regras atuais

| ID               | Benefício interno | Perguntas usadas      | Condição                    | Peso | Resultado interno     | Fundamento jurídico preliminar                                                                      | Risco                                             | Decisão recomendada                                         |
| ---------------- | ----------------- | --------------------- | --------------------------- | ---- | --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| aposentadoria-01 | aposentadoria     | primary-interest      | Inclui aposentadoria        | 35   | Pontuação operacional | Interesse declarado não é requisito legal                                                           | Falso positivo alto se tratado como elegibilidade | Manter apenas como sinal de tema                            |
| aposentadoria-02 | aposentadoria     | contribution-years    | Mínimo 15 anos estimados    | 30   | Pontuação operacional | Regras de aposentadoria dependem de idade, carência, sexo, filiação e transições                    | Falso positivo alto                               | Revisar antes de mudança jurídica relevante em produção     |
| aposentadoria-03 | aposentadoria     | contribution-years    | Mínimo 5 anos estimados     | 15   | Pontuação operacional | Histórico contributivo parcial não permite conclusão                                                | Falso positivo e negativo                         | Manter apenas como dado de triagem                          |
| aposentadoria-04 | aposentadoria     | work-type             | Diferente de sem atividade  | 10   | Pontuação operacional | Atividade atual não confirma qualidade de segurado nem carência                                     | Baixa confiança                                   | Manter sem conclusão pública                                |
| incapacidade-01  | incapacidade      | primary-interest      | Inclui incapacidade         | 30   | Pontuação operacional | Interesse declarado não confirma incapacidade                                                       | Falso positivo alto                               | Manter apenas como sinal de tema                            |
| incapacidade-02  | incapacidade      | has-medical-condition | Condição de saúde informada | 45   | Pontuação operacional | Benefício por incapacidade depende de incapacidade laborativa e avaliação/perícia                   | Falso positivo alto                               | Manter revisão humana no atendimento; não pedir diagnóstico |
| incapacidade-03  | incapacidade      | currently-working     | Não trabalha atualmente     | 10   | Pontuação operacional | Ausência de trabalho não prova incapacidade                                                         | Falso positivo alto                               | Manter apenas como sinal contextual                         |
| assistencial-01  | assistencial      | primary-interest      | Inclui assistencial         | 35   | Pontuação operacional | Interesse declarado não comprova requisitos do BPC                                                  | Falso positivo alto                               | Manter apenas como sinal de tema                            |
| assistencial-02  | assistencial      | last-income           | Renda aproximada até 1800   | 25   | Pontuação operacional | BPC exige análise de renda familiar e outros elementos; jurisprudência admite outros meios de prova | Falso positivo/negativo alto                      | Tratar threshold como priorização operacional               |
| assistencial-03  | assistencial      | has-medical-condition | Condição de saúde informada | 10   | Pontuação operacional | BPC deficiência exige impedimento de longo prazo e avaliação social/médica                          | Falso positivo alto                               | Manter apenas como necessidade de análise                   |

## Respostas unknown e withheld

- `unknown`: não pontua, não penaliza, marca informação pendente e pode ativar `requiresHumanReview`.
- `withheld`: não inferir resposta, não pontuar, não tratar como negativa e pode ativar `requiresHumanReview`.
- `not_applicable`: reservado para exclusão de cálculo pertinente; não usado no fluxo atual.

## Thresholds atuais

- Alto interno: score >= 70.
- Médio interno: score >= 40.
- Baixo interno: score < 40.

Esses thresholds foram preservados para operação interna e não devem ser apresentados ao usuário. Mudanças relevantes no Rule Engine central devem passar por revisão técnica e preventiva antes de produção.

## Alterações aplicadas

- Nenhum peso, threshold ou requisito jurídico foi alterado.
- Criado `PublicResult` allowlistado para impedir vazamento de classificação e score.
- Criados estados `unknown`, `withheld` e `not_applicable`.
- Criado `requiresHumanReview` quando respostas críticas estão desconhecidas ou omitidas.
- E-mail interno passou a exibir completude e necessidade de revisão humana.

## Pendências

- Revisão preventiva de regras, pesos, thresholds e hipóteses de benefício antes de mudanças relevantes em produção.
- Ampliação das perguntas para capturar critérios legais reais, quando houver necessidade de produto.
- Revisão específica para aposentadoria urbana/rural, BPC idoso, BPC pessoa com deficiência, incapacidade temporária e permanente.
- Validação de jurisprudência atualizada em STF, STJ, TNU e TRF1 antes de qualquer conclusão automatizada.
