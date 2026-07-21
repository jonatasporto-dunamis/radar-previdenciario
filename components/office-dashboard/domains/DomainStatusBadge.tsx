import type {
  TenantDomainSslStatus,
  TenantDomainStatus,
} from "@/types/tenants";

const statusLabels: Record<TenantDomainStatus, string> = {
  pending: "Pendente",
  awaiting_dns: "Aguardando DNS",
  verifying: "Verificando",
  active: "Ativo",
  failed: "Falhou",
  disabled: "Desativado",
  inactive: "Inativo",
};

const sslLabels: Record<TenantDomainSslStatus, string> = {
  unknown: "SSL desconhecido",
  pending: "SSL pendente",
  provisioning: "SSL em emissão",
  active: "SSL ativo",
  failed: "SSL falhou",
};

const statusClasses: Record<TenantDomainStatus, string> = {
  pending: "border-neutral-200 bg-neutral-50 text-neutral-700",
  awaiting_dns: "border-amber-200 bg-amber-50 text-amber-800",
  verifying: "border-sky-200 bg-sky-50 text-sky-800",
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-red-200 bg-red-50 text-red-800",
  disabled: "border-neutral-200 bg-neutral-100 text-neutral-600",
  inactive: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

export function DomainStatusBadge({
  status,
  sslStatus,
}: {
  status: TenantDomainStatus;
  sslStatus?: TenantDomainSslStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {sslStatus
        ? `${statusLabels[status]} · ${sslLabels[sslStatus]}`
        : statusLabels[status]}
    </span>
  );
}
