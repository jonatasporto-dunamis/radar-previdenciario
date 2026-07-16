import type { OfficeLeadDetail } from "@/types/office-dashboard";
import { LeadAttribution } from "./LeadAttribution";
import { LeadContactCard } from "./LeadContactCard";
import { LeadInternalQualification } from "./LeadInternalQualification";
import { LeadNotificationHistory } from "./LeadNotificationHistory";
import { LeadQuizAnswers } from "./LeadQuizAnswers";
import { LeadTrackingTimeline } from "./LeadTrackingTimeline";

export function LeadDetails({ lead }: { lead: OfficeLeadDetail }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <LeadContactCard lead={lead} />
        <LeadInternalQualification lead={lead} />
        <section
          className="bg-card rounded-lg border p-5"
          aria-labelledby="public-result"
        >
          <h2 className="text-lg font-semibold" id="public-result">
            Resultado público apresentado
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            {lead.latestResult?.summary ??
              "Nenhum resultado público foi registrado para este lead."}
          </p>
          {lead.latestResult?.ethicalDisclaimer ? (
            <p className="mt-3 rounded-md bg-neutral-100 p-3 text-sm dark:bg-neutral-900">
              {lead.latestResult.ethicalDisclaimer}
            </p>
          ) : null}
        </section>
        <LeadQuizAnswers answers={lead.quizAnswers} />
      </div>
      <div className="space-y-5">
        <LeadAttribution attribution={lead.attribution} />
        <LeadNotificationHistory notifications={lead.notifications} />
        <LeadTrackingTimeline items={lead.timeline} />
      </div>
    </div>
  );
}
