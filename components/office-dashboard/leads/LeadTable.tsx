import Link from "next/link";
import { formatDateTime, formatBoolean } from "@/lib/office-dashboard";
import type { OfficeLeadListItem } from "@/types/office-dashboard";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LeadStatusBadge } from "./LeadStatusBadge";

export function LeadTable({ leads }: { leads: OfficeLeadListItem[] }) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y text-sm">
        <caption className="sr-only">
          Leads recebidos pelo Radar Previdenciário
        </caption>
        <thead className="text-muted-foreground bg-neutral-50 text-left text-xs uppercase dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3" scope="col">
              Data
            </th>
            <th className="px-4 py-3" scope="col">
              Lead
            </th>
            <th className="px-4 py-3" scope="col">
              Quiz
            </th>
            <th className="px-4 py-3" scope="col">
              Classificação
            </th>
            <th className="px-4 py-3" scope="col">
              Revisão
            </th>
            <th className="px-4 py-3" scope="col">
              Status
            </th>
            <th className="px-4 py-3" scope="col">
              Origem
            </th>
            <th className="px-4 py-3" scope="col">
              Ação
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-4 whitespace-nowrap">
                {formatDateTime(lead.createdAt)}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium">{lead.fullName}</p>
                <p className="text-muted-foreground">{lead.maskedPhone}</p>
                <p className="text-muted-foreground">{lead.maskedEmail}</p>
              </td>
              <td className="px-4 py-4">
                <p>{lead.templateName ?? "Quiz legado"}</p>
                <p className="text-muted-foreground">
                  {lead.templateType ?? "sem tipo"}{" "}
                  {lead.templateVersion ? `v${lead.templateVersion}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {lead.potentialBenefit ?? "Tema não identificado"}
                </p>
              </td>
              <td className="px-4 py-4">
                <LeadPriorityBadge classification={lead.classification} />
              </td>
              <td className="px-4 py-4">
                <p>{formatBoolean(lead.requiresHumanReview)}</p>
                <p className="text-muted-foreground">
                  {lead.dataCompleteness ?? "sem completude"}
                </p>
              </td>
              <td className="px-4 py-4">
                <LeadStatusBadge status={lead.commercialStatus} />
              </td>
              <td className="px-4 py-4">
                <p>{lead.source ?? "Não informado"}</p>
                <p className="text-muted-foreground">
                  {lead.utmCampaign ?? ""}
                </p>
              </td>
              <td className="px-4 py-4">
                <Link
                  className="rounded-md border px-3 py-2 text-sm font-medium"
                  href={`/painel/leads/${lead.id}`}
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
