import { clsx } from "clsx";
import type {
  IntegrationDeliveryStatus,
  IntegrationStatus,
  IntegrationTestStatus,
} from "@/types/integrations";

type Status =
  IntegrationStatus | IntegrationDeliveryStatus | IntegrationTestStatus;

const labels: Record<string, string> = {
  connected: "Conectado",
  configuration_required: "Configuração incompleta",
  disconnected: "Desconectado",
  error: "Erro",
  test_pending: "Teste pendente",
  pending: "Pendente",
  processing: "Processando",
  sent: "Enviado",
  failed: "Falhou",
  retrying: "Tentando novamente",
  ignored: "Ignorado",
  cancelled: "Cancelado",
  dead_letter: "Fila morta",
  success: "Sucesso",
};

const tones: Record<string, string> = {
  connected: "bg-success/15 text-success",
  success: "bg-success/15 text-success",
  sent: "bg-success/15 text-success",
  configuration_required: "bg-warning/15 text-warning",
  test_pending: "bg-warning/15 text-warning",
  pending: "bg-warning/15 text-warning",
  processing: "bg-warning/15 text-warning",
  retrying: "bg-warning/15 text-warning",
  disconnected:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
  ignored:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
  cancelled:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
  error: "bg-danger/15 text-danger",
  failed: "bg-danger/15 text-danger",
  dead_letter: "bg-danger/15 text-danger",
};

export function IntegrationStatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[status] ?? tones.disconnected,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
