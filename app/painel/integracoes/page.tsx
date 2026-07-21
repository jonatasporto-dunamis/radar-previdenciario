import Link from "next/link";
import { Activity, TestTube2 } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { IntegrationCards } from "@/components/office-dashboard/integrations/IntegrationCards";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { listIntegrationCards } from "@/services/office-dashboard/integrations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeIntegrationsPage() {
  const context = await requireTenantRole("viewIntegrations");
  const integrations = await listIntegrationCards(context);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Integrações</p>
            <h2 className="text-2xl font-semibold">
              Central de tracking do tenant
            </h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
              Configure provedores por escritório, mantenha credenciais
              criptografadas no servidor e acompanhe testes e entregas
              sanitizadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
              href="/painel/integracoes/testes"
            >
              <TestTube2 aria-hidden="true" className="size-4" />
              Testes
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
              href="/painel/integracoes/eventos"
            >
              <Activity aria-hidden="true" className="size-4" />
              Eventos
            </Link>
          </div>
        </div>

        <IntegrationCards integrations={integrations} />
      </div>
    </DashboardShell>
  );
}
