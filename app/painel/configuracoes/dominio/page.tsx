import Link from "next/link";
import { Globe2, Plus } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { DomainList } from "@/components/office-dashboard/domains/DomainList";
import { canManageDomains } from "@/lib/office-dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  isDomainProviderConfigured,
  listTenantDomains,
} from "@/services/office-dashboard/domains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantDomainsPage() {
  const context = await requireTenantRole("viewDomains");
  const [domains, providerConfigured] = await Promise.all([
    listTenantDomains(context),
    Promise.resolve(isDomainProviderConfigured()),
  ]);
  const canManage = canManageDomains(context.role);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Configurações</p>
            <h2 className="text-2xl font-semibold">Domínios do escritório</h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
              Gerencie subdomínios da plataforma e domínios personalizados sem
              expor credenciais de Vercel ou Cloudflare ao navegador.
            </p>
          </div>
          {canManage ? (
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950"
              href="/painel/configuracoes/dominio/novo"
            >
              <Plus aria-hidden="true" className="size-4" />
              Novo domínio
            </Link>
          ) : null}
        </div>

        <div className="rounded-lg border bg-neutral-50 p-5 dark:bg-neutral-950/70">
          <div className="flex gap-3">
            <Globe2 aria-hidden="true" className="mt-0.5 size-5" />
            <div>
              <h3 className="font-semibold">Provisionamento controlado</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {providerConfigured
                  ? "A plataforma possui credenciais server-side para solicitar e verificar domínios na Vercel."
                  : "A plataforma ainda não possui credenciais server-side de Vercel configuradas. Novos domínios ficarão aguardando DNS/instrução manual."}
              </p>
            </div>
          </div>
        </div>

        <DomainList domains={domains} />
      </div>
    </DashboardShell>
  );
}
