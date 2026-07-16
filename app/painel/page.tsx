import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { DashboardMetrics } from "@/components/office-dashboard/metrics/DashboardMetrics";
import { getDashboardMetrics } from "@/services/office-dashboard/dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeDashboardPage() {
  const context = await requireTenantRole("viewMetrics");
  const metrics = await getDashboardMetrics(context);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground text-sm">Visão geral</p>
          <h2 className="text-2xl font-semibold">Indicadores do escritório</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Indicadores operacionais de captação e triagem. Não representam
            probabilidade de concessão, êxito ou parecer jurídico.
          </p>
        </div>
        <DashboardMetrics metrics={metrics} />
      </div>
    </DashboardShell>
  );
}
