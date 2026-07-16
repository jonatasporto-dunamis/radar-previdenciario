# Política operacional inicial de retenção de dados

Status: política padrão conservadora e configurável para revisão periódica. Não há exclusão automática implementada nesta etapa.

Os prazos iniciais estão em `officeConfig.dataRetention` e podem ser ajustados futuramente por tenant, contrato ou obrigação operacional.

## Prazos sugeridos

| Categoria                                      | Prazo inicial                                   | Tratamento após prazo                                                           |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Sessões incompletas                            | 30 dias após última atividade                   | Excluir ou anonimizar quando houver necessidade técnica documentada             |
| Triagens concluídas sem contato ou contratação | 180 dias após conclusão                         | Excluir dados identificáveis e manter métricas anonimizadas quando necessário   |
| Leads com contato em andamento                 | Até 12 meses após última interação              | Excluir, anonimizar ou prorrogar com justificativa documentada                  |
| Leads que se tornam clientes                   | Política própria do relacionamento profissional | Não aplicar automaticamente a política do MVP                                   |
| Respostas sensíveis                            | Menor período necessário                        | Evitar retenção superior ao cadastro sem finalidade ativa                       |
| Tracking interno operacional                   | 180 dias                                        | Agregar, anonimizar ou excluir                                                  |
| Logs técnicos e segurança                      | 90 a 180 dias                                   | Excluir ou manter apenas quando necessário para segurança/exercício de direitos |
| Notification logs                              | 180 dias                                        | Remover payloads desnecessários quando possível                                 |
| External tracking deliveries                   | 180 dias                                        | Não conservar PII ou payload bruto                                              |
| Consentimentos e revogações                    | Prazo a definir por política operacional        | Manter evidência suficiente para demonstrar conformidade                        |

## Configuração atual

```ts
defaultRetentionPolicy = {
  incompleteSessionDays: 30,
  completedTriageDays: 180,
  activeLeadDays: 365,
  trackingDays: 180,
  internalTrackingDays: 180,
  securityLogDays: 180,
  notificationLogDays: 180,
  externalDeliveryDays: 180,
  auditLogDays: 365,
};
```

## Limites

- Nenhum job automático de exclusão foi criado.
- Nenhuma migration foi criada nesta etapa.
- A execução futura deve incluir dry-run, logs de auditoria e possibilidade de bloqueio por impedimento legal.
- Dados necessários para obrigação legal, exercício regular de direitos, defesa em processo, prevenção de fraude ou relação profissional ativa não devem ser excluídos automaticamente.

## Pendências

- Revisão periódica dos prazos.
- Definição de responsável operacional.
- Procedimento de anonimização.
- Política específica para clientes formalmente contratados.
