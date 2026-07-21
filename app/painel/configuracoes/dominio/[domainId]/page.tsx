import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { DomainDnsInstructions } from "@/components/office-dashboard/domains/DomainDnsInstructions";
import { DomainStatusBadge } from "@/components/office-dashboard/domains/DomainStatusBadge";
import { canManageDomains } from "@/lib/office-dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getTenantDomain } from "@/services/office-dashboard/domains";
import {
  disableTenantDomainAction,
  makeTenantDomainPrimaryAction,
  removeTenantDomainAction,
  verifyTenantDomainAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TenantDomainDetailPageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function TenantDomainDetailPage({
  params,
  searchParams,
}: TenantDomainDetailPageProps) {
  const context = await requireTenantRole("viewDomains");
  const { domainId } = await params;
  const domain = await getTenantDomain({ context, domainId });
  const notices = await searchParams;

  if (!domain) {
    notFound();
  }

  const canManage = canManageDomains(context.role);

  return (
    <DashboardShell context={context}>
      <div className="max-w-5xl space-y-6">
        <Link
          className="text-muted-foreground inline-flex items-center gap-2 text-sm font-semibold"
          href="/painel/configuracoes/dominio"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar
        </Link>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                {domain.domainType === "platform_subdomain"
                  ? "Subdomínio da plataforma"
                  : "Domínio personalizado"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{domain.hostname}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <DomainStatusBadge
                  sslStatus={domain.sslStatus}
                  status={domain.status}
                />
                {domain.isPrimary ? (
                  <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950">
                    Domínio principal
                  </span>
                ) : null}
              </div>
            </div>

            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <form action={verifyTenantDomainAction}>
                  <input name="domainId" type="hidden" value={domain.id} />
                  <button
                    className="rounded-md border px-3 py-2 text-sm font-semibold"
                    type="submit"
                  >
                    Verificar
                  </button>
                </form>
                {!domain.isPrimary && domain.status === "active" ? (
                  <form action={makeTenantDomainPrimaryAction}>
                    <input name="domainId" type="hidden" value={domain.id} />
                    <button
                      className="rounded-md border px-3 py-2 text-sm font-semibold"
                      type="submit"
                    >
                      Tornar principal
                    </button>
                  </form>
                ) : null}
                {!domain.isPrimary ? (
                  <form action={disableTenantDomainAction}>
                    <input name="domainId" type="hidden" value={domain.id} />
                    <button
                      className="rounded-md border px-3 py-2 text-sm font-semibold"
                      type="submit"
                    >
                      Desativar
                    </button>
                  </form>
                ) : null}
                {!domain.isPrimary ? (
                  <form action={removeTenantDomainAction}>
                    <input name="domainId" type="hidden" value={domain.id} />
                    <button
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
                      type="submit"
                    >
                      Remover
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </div>

          {notices?.created ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Solicitação criada.
            </p>
          ) : null}
          {notices?.verified ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Verificação atualizada.
            </p>
          ) : null}
          {notices?.error ? (
            <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              A ação não pôde ser concluída. Verifique o status do domínio.
            </p>
          ) : null}
          {domain.lastError ? (
            <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {domain.lastError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-neutral-950">
            <CheckCircle2 aria-hidden="true" className="size-5" />
            <h3 className="mt-3 font-semibold">Roteamento seguro</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              O tenant é resolvido pelo hostname no servidor. O painel não usa
              parâmetro de URL nem cookie como fonte principal de tenant.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-neutral-950">
            <ShieldAlert aria-hidden="true" className="size-5" />
            <h3 className="mt-3 font-semibold">Área administrativa canônica</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              A autenticação administrativa permanece no domínio oficial da
              plataforma. Domínios de tenant são priorizados para a experiência
              pública.
            </p>
          </div>
        </div>

        <DomainDnsInstructions instructions={domain.dnsInstructions} />
      </div>
    </DashboardShell>
  );
}
