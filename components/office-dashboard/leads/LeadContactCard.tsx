import { formatDateTime } from "@/lib/office-dashboard";
import type { OfficeLeadDetail } from "@/types/office-dashboard";
import { LeadStatusBadge } from "./LeadStatusBadge";

export function LeadContactCard({ lead }: { lead: OfficeLeadDetail }) {
  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-contact"
    >
      <h2 className="text-lg font-semibold" id="lead-contact">
        Identificação
      </h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Nome</dt>
          <dd className="font-medium">{lead.fullName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Telefone</dt>
          <dd>{lead.phone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">E-mail</dt>
          <dd>{lead.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cadastro</dt>
          <dd>{formatDateTime(lead.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tenant</dt>
          <dd>{lead.tenantName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <LeadStatusBadge status={lead.commercialStatus} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
