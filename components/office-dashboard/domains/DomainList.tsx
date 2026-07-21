import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DomainStatusBadge } from "./DomainStatusBadge";
import type { TenantDomain } from "@/types/tenants";

export function DomainList({ domains }: { domains: TenantDomain[] }) {
  if (!domains.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Nenhum domínio cadastrado</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Adicione um subdomínio da plataforma ou um domínio personalizado para
          iniciar a verificação.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {domains.map((domain) => (
        <article
          className="rounded-lg border bg-white p-5 shadow-sm dark:bg-neutral-950"
          key={domain.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{domain.hostname}</h3>
                {domain.isPrimary ? (
                  <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950">
                    Principal
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {domain.domainType === "platform_subdomain"
                  ? "Subdomínio da plataforma"
                  : "Domínio personalizado"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DomainStatusBadge
                sslStatus={domain.sslStatus}
                status={domain.status}
              />
              <Link
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
                href={`/painel/configuracoes/dominio/${domain.id}`}
              >
                Abrir
                <ExternalLink aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
          {domain.lastError ? (
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {domain.lastError}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
