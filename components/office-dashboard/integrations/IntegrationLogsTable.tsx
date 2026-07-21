import { integrationProviderDefinitions } from "@/services/office-dashboard/integrations";
import { IntegrationStatusBadge } from "./IntegrationStatusBadge";
import type {
  IntegrationDeliveryLog,
  IntegrationTestRun,
} from "@/types/integrations";

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatResult(value: Record<string, unknown>) {
  const checks = value.checks;

  if (Array.isArray(checks)) {
    return checks.slice(0, 3).join(" ");
  }

  return "Resultado sanitizado registrado.";
}

export function IntegrationDeliveryLogsTable({
  logs,
}: {
  logs: IntegrationDeliveryLog[];
}) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y text-sm">
        <caption className="sr-only">Logs sanitizados de entrega</caption>
        <thead className="text-muted-foreground bg-neutral-50 text-left text-xs uppercase dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3" scope="col">
              Provedor
            </th>
            <th className="px-4 py-3" scope="col">
              Evento
            </th>
            <th className="px-4 py-3" scope="col">
              Status
            </th>
            <th className="px-4 py-3" scope="col">
              Tentativas
            </th>
            <th className="px-4 py-3" scope="col">
              Modo
            </th>
            <th className="px-4 py-3" scope="col">
              Horário
            </th>
            <th className="px-4 py-3" scope="col">
              Erro
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.length ? (
            logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-4">
                  {integrationProviderDefinitions[log.provider].shortName}
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium">{log.externalEvent}</p>
                  <p className="text-muted-foreground">{log.eventId}</p>
                </td>
                <td className="px-4 py-4">
                  <IntegrationStatusBadge status={log.status} />
                </td>
                <td className="px-4 py-4">{log.attempt}</td>
                <td className="px-4 py-4">
                  {log.testMode ? "Teste" : "Produção"}
                </td>
                <td className="px-4 py-4">{formatDate(log.createdAt)}</td>
                <td className="max-w-sm px-4 py-4">
                  {log.sanitizedError ?? "Sem erro"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={7}>
                Nenhum evento externo registrado para este tenant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function IntegrationTestRunsTable({
  tests,
}: {
  tests: IntegrationTestRun[];
}) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y text-sm">
        <caption className="sr-only">Testes de conexão das integrações</caption>
        <thead className="text-muted-foreground bg-neutral-50 text-left text-xs uppercase dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3" scope="col">
              Provedor
            </th>
            <th className="px-4 py-3" scope="col">
              Tipo
            </th>
            <th className="px-4 py-3" scope="col">
              Status
            </th>
            <th className="px-4 py-3" scope="col">
              Resultado
            </th>
            <th className="px-4 py-3" scope="col">
              Horário
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tests.length ? (
            tests.map((testRun) => (
              <tr key={testRun.id}>
                <td className="px-4 py-4">
                  {integrationProviderDefinitions[testRun.provider].shortName}
                </td>
                <td className="px-4 py-4">{testRun.testType}</td>
                <td className="px-4 py-4">
                  <IntegrationStatusBadge status={testRun.status} />
                </td>
                <td className="max-w-xl px-4 py-4">
                  {formatResult(testRun.sanitizedResult)}
                </td>
                <td className="px-4 py-4">{formatDate(testRun.createdAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={5}>
                Nenhum teste registrado para este tenant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
