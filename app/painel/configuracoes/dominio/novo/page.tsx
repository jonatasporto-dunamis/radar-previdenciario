import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { requestTenantDomainAction } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NewTenantDomainPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewTenantDomainPage({
  searchParams,
}: NewTenantDomainPageProps) {
  const context = await requireTenantRole("manageDomains");
  const error = (await searchParams)?.error;

  return (
    <DashboardShell context={context}>
      <div className="max-w-3xl space-y-6">
        <Link
          className="text-muted-foreground inline-flex items-center gap-2 text-sm font-semibold"
          href="/painel/configuracoes/dominio"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar
        </Link>

        <div>
          <p className="text-muted-foreground text-sm">Novo domínio</p>
          <h2 className="text-2xl font-semibold">
            Solicitar domínio para o tenant
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            O painel valida o hostname, cria a solicitação e registra auditoria.
            Tokens da plataforma permanecem apenas no servidor.
          </p>
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            Não foi possível cadastrar o domínio. Verifique o formato e se ele
            já não está em uso.
          </p>
        ) : null}

        <form
          action={requestTenantDomainAction}
          className="space-y-6 rounded-lg border bg-white p-6 shadow-sm dark:bg-neutral-950"
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Tipo de domínio</legend>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input
                className="mt-1"
                defaultChecked
                name="domainType"
                type="radio"
                value="platform_subdomain"
              />
              <span>
                <span className="block font-medium">
                  Subdomínio da plataforma
                </span>
                <span className="text-muted-foreground text-sm">
                  Exemplo: resende.radarprevidenciario.com.br
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input
                className="mt-1"
                name="domainType"
                type="radio"
                value="custom_domain"
              />
              <span>
                <span className="block font-medium">Domínio personalizado</span>
                <span className="text-muted-foreground text-sm">
                  Exemplo: beneficios.escritorio.com.br
                </span>
              </span>
            </label>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Slug do subdomínio</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="subdomainSlug"
                placeholder="resende"
              />
              <span className="text-muted-foreground block text-xs">
                Use somente letras minúsculas, números e hífen.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Hostname personalizado
              </span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="customHostname"
                placeholder="beneficios.escritorio.com.br"
              />
              <span className="text-muted-foreground block text-xs">
                Informe sem https, sem porta e sem caminho.
              </span>
            </label>
          </div>

          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            O sistema não troca nameservers. Quando necessário, ele exibirá as
            instruções oficiais de DNS para configuração manual.
          </div>

          <button
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950"
            type="submit"
          >
            Criar solicitação
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
