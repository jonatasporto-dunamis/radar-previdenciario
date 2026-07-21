import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { IntegrationDeliveryLogsTable } from "@/components/office-dashboard/integrations/IntegrationLogsTable";
import { IntegrationProviderForm } from "@/components/office-dashboard/integrations/IntegrationProviderForm";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  getIntegrationDetail,
  getIntegrationProviderFromSlug,
  integrationProviderDefinitions,
} from "@/services/office-dashboard/integrations";
import { canManageIntegrations } from "@/lib/office-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ providerSlug: string }>;
  searchParams: Promise<{
    saved?: string;
    tested?: string;
    error?: string;
  }>;
};

export default async function OfficeIntegrationProviderPage({
  params,
  searchParams,
}: PageProps) {
  const { providerSlug } = await params;
  const provider = getIntegrationProviderFromSlug(providerSlug);

  if (!provider) {
    notFound();
  }

  const context = await requireTenantRole("viewIntegrations");
  const detail = await getIntegrationDetail({ context, provider });
  const query = await searchParams;
  const definition = integrationProviderDefinitions[provider];

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
          <p className="text-muted-foreground mt-5 text-sm">
            {definition.shortName}
          </p>
          <h2 className="text-2xl font-semibold">{definition.name}</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            {definition.setupHint}
          </p>
        </div>

        <IntegrationProviderForm
          canManage={canManageIntegrations(context.role)}
          detail={detail}
          error={query.error}
          saved={query.saved === "1"}
          tested={query.tested}
        />

        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Últimos eventos</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Diagnóstico sanitizado do provedor. Payload bruto e PII não são
              armazenados.
            </p>
          </div>
          <IntegrationDeliveryLogsTable logs={detail.latestDeliveries} />
        </section>
      </div>
    </DashboardShell>
  );
}
