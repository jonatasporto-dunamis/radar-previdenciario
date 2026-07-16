# Guia de revisão preventiva

Este guia substitui o checklist de aprovação jurídica do MVP. Ele é orientativo,
reutilizável por tenants e não bloqueia desenvolvimento, commit, push, Pull
Request, Preview, testes, migrations em ambiente controlado ou integração do
painel.

O Radar Previdenciário é uma plataforma de qualificação preliminar de leads. A
plataforma organiza informações, identifica temas previdenciários e mede
prioridade operacional. A avaliação jurídica individual continua sendo feita
pelo escritório responsável pelo atendimento.

Os textos e critérios da plataforma devem ser revisados periodicamente por
profissional habilitado.

## Fluxo recomendado

```text
desenvolvimento
→ testes
→ revisão técnica
→ Preview
→ validação operacional
→ migration controlada
→ deploy
→ monitoramento
```

A revisão jurídica é preventiva, periódica e proporcional. Ela é recomendada
antes do lançamento comercial amplo e necessária antes de mudanças jurídicas
relevantes no Rule Engine central em produção.

## Gates que permanecem

Manter autorização humana operacional para:

- migration em produção;
- deploy de produção;
- uso de dados reais;
- criação de usuários reais;
- ativação de tracking externo real;
- disparo de marketing;
- exclusão de dados;
- alteração destrutiva de banco;
- merge em `main` sem CI verde;
- mudança relevante no Rule Engine central em produção.

## Responsabilidade da plataforma

O Radar Previdenciário fornece:

- infraestrutura técnica;
- segurança e controle de acesso;
- templates padrão `platform_managed`;
- mensagens preventivas;
- termos-base e política-base;
- regras operacionais iniciais;
- registros técnicos e auditoria operacional.

Os templates padrão usam linguagem neutra e não prometem concessão de benefício,
êxito, valor, direito confirmado ou diagnóstico médico.

## Responsabilidade do tenant

O escritório tenant é responsável por:

- atendimento dos leads;
- avaliação jurídica individual;
- conteúdo customizado `tenant_managed`;
- usuários autorizados;
- uso dos dados dentro da sua operação;
- cumprimento das regras profissionais;
- atendimento a titulares dentro do seu fluxo operacional.

Aviso recomendado para customizações:

> Perguntas, regras e textos personalizados são de responsabilidade do
> escritório que os configurou. Evite promessas, conclusões jurídicas
> automáticas, pedidos desnecessários de dados e informações que possam induzir
> o usuário.

## Dados mínimos do tenant

Para criação e operação inicial, exigir apenas:

- nome público do escritório;
- slug;
- e-mail operacional;
- telefone ou WhatsApp;
- cidade/estado;
- status ativo;
- responsável operacional.

Dados opcionais não bloqueantes:

- nome de advogado;
- OAB;
- CNPJ;
- razão social;
- endereço;
- unidades;
- canal de privacidade;
- logo;
- redes sociais.

Campos opcionais vazios não devem aparecer como placeholders públicos.

## Identidade conhecida do tenant Resende

Dados mantidos no MVP:

- Resende Advogados Associados;
- EDILSON DE ALMEIDA RESENDE;
- OAB/BA 45.987;
- Vitória da Conquista/BA;
- Belo Campo/BA;
- Jitaúna/BA.

Nenhum novo documento institucional é obrigatório para continuidade técnica do
MVP.

## Natureza da ferramenta

Disclaimer curto padrão:

> O Radar Previdenciário organiza informações para uma triagem inicial. O
> resultado não confirma direito a benefício, não constitui parecer jurídico e
> pode depender de documentos e avaliação individual.

Para temas de saúde:

> A ferramenta não realiza diagnóstico médico nem avalia incapacidade.

## Qualificação operacional

Campos como `classification`, `score`, `priority`, `topic`,
`dataCompleteness`, `missingCriticalAnswers`, `requiresHumanReview` e
`matchedRules` são internos. Eles servem para organizar atendimento e não devem
ser exibidos como probabilidade, chance, conclusão jurídica ou confirmação de
direito.

Resultados públicos devem conter apenas:

- `title`;
- `summary`;
- `topicLabel`;
- `nextStep`;
- `disclaimer`.

Não exibir ao público:

- score;
- alto/médio/baixo;
- percentual;
- chance;
- regra acionada;
- threshold.

## Conteúdo customizado

Conteúdo criado ou alterado por tenant deve registrar:

- usuário responsável;
- tenant;
- versão;
- data;
- conteúdo anterior;
- conteúdo novo;
- status ativo/inativo.

Templates da plataforma não devem ser editados diretamente por tenant. O tenant
deve clonar o template e editar sua própria versão.

## Moderação

Validações automáticas devem alertar ou bloquear expressões como:

- direito garantido;
- benefício garantido;
- causa ganha;
- será aprovado;
- você tem direito;
- chance de êxito;
- consulta grátis;
- análise gratuita;
- receba agora;
- não perca seu direito;
- valor garantido;
- indenização certa;
- resultado garantido.

A moderação deve considerar contexto e permitir explicações neutras quando a
expressão aparece apenas para descrever uma limitação ou uma proibição.

## Revisão periódica

Revisões recomendadas:

- antes do lançamento comercial amplo;
- quando um template novo for publicado;
- quando houver mudança relevante em regra central;
- quando houver atualização legal, regulatória ou jurisprudencial relevante;
- quando um tenant publicar conteúdo próprio;
- quando a moderação sinalizar expressão de risco.

Não é necessário exigir assinatura, upload de documento, aprovação item a item
ou aceite formal de risco para desenvolvimento técnico, Preview, testes ou PR.
