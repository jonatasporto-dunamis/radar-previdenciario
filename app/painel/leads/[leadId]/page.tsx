import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { LeadDetails } from "@/components/office-dashboard/leads/LeadDetails";
import { LeadNotes } from "@/components/office-dashboard/notes/LeadNotes";
import { LeadStatusForm } from "@/components/office-dashboard/status/LeadStatusForm";
import { LeadStatusHistory } from "@/components/office-dashboard/status/LeadStatusHistory";
import { canChangeLeadStatus, canCreateLeadNote } from "@/lib/office-dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getOfficeLead } from "@/services/office-dashboard/leads";
import { listLeadStatusHistory } from "@/services/office-dashboard/history";
import { listLeadNotes } from "@/services/office-dashboard/notes";

type LeadPageProps = {
  params: Promise<{ leadId: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeLeadDetailPage({ params }: LeadPageProps) {
  const context = await requireTenantRole("viewLead");
  const { leadId } = await params;
  const lead = await getOfficeLead({ context, leadId });

  if (!lead) {
    notFound();
  }

  const [statusHistory, notes] = await Promise.all([
    listLeadStatusHistory({ tenantId: context.tenantId, leadId }),
    listLeadNotes({ context, leadId }),
  ]);

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <Link className="text-primary text-sm font-medium" href="/painel/leads">
          Voltar para leads
        </Link>
        <div>
          <p className="text-muted-foreground text-sm">Detalhes do lead</p>
          <h2 className="text-2xl font-semibold">{lead.fullName}</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            <LeadDetails lead={lead} />
          </div>
          <aside className="space-y-5">
            <LeadStatusForm
              canChange={canChangeLeadStatus(context.role)}
              currentStatus={lead.commercialStatus}
              leadId={lead.id}
            />
            <LeadStatusHistory items={statusHistory} />
            <LeadNotes
              canCreate={canCreateLeadNote(context.role)}
              leadId={lead.id}
              notes={notes}
            />
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
