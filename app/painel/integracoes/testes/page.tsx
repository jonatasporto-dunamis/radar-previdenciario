import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { IntegrationTestRunsTable } from "@/components/office-dashboard/integrations/IntegrationLogsTable";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { listIntegrationTestRuns } from "@/services/office-dashboard/integrations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeIntegrationTestsPage() {
  const context = await requireTenantRole("viewIntegrations");
  const tests = await listIntegrationTestRuns(context);

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
          <p className="text-muted-foreground mt-5 text-sm">Testes</p>
          <h2 className="text-2xl font-semibold">
            Histórico de testes de conexão
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Os testes registram somente diagnóstico sanitizado: formato,
            presença de credenciais criptografadas e modo de envio.
          </p>
        </div>

        <IntegrationTestRunsTable tests={tests} />
      </div>
    </DashboardShell>
  );
}
