import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { EventMappingsTable } from "@/components/office-dashboard/integrations/EventMappingsTable";
import { IntegrationDeliveryLogsTable } from "@/components/office-dashboard/integrations/IntegrationLogsTable";
import { canManageIntegrations } from "@/lib/office-dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  listIntegrationDeliveryLogs,
  listTenantEventMappings,
} from "@/services/office-dashboard/integrations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function OfficeIntegrationEventsPage({
  searchParams,
}: PageProps) {
  const context = await requireTenantRole("viewIntegrations");
  const [mappings, logs, query] = await Promise.all([
    listTenantEventMappings(context),
    listIntegrationDeliveryLogs(context),
    searchParams,
  ]);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <Link
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            href="/painel/integracoes"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar para integrações
          </Link>
          <p className="text-muted-foreground mt-5 text-sm">Eventos</p>
          <h2 className="text-2xl font-semibold">
            Mapeamento e entregas externas
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Cada evento interno pode ter um nome externo por provedor. Esta
            página mostra também o histórico sanitizado de entrega.
          </p>
        </div>

        {query.saved === "1" ? (
          <p className="bg-success/10 text-success rounded-md p-3 text-sm">
            Mapeamento salvo.
          </p>
        ) : null}

        {query.error ? (
          <p className="bg-danger/10 text-danger rounded-md p-3 text-sm">
            Não foi possível salvar o mapeamento.
          </p>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Mapeamentos</h3>
          <EventMappingsTable
            canManage={canManageIntegrations(context.role)}
            mappings={mappings}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Logs de entrega</h3>
          <IntegrationDeliveryLogsTable logs={logs} />
        </section>
      </div>
    </DashboardShell>
  );
}
