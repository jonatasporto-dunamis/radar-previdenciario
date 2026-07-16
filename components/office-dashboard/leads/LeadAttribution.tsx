import type { OfficeLeadAttribution } from "@/types/office-dashboard";

export function LeadAttribution({
  attribution,
}: {
  attribution: OfficeLeadAttribution;
}) {
  const entries = [
    ["utm_source", attribution.utmSource],
    ["utm_medium", attribution.utmMedium],
    ["utm_campaign", attribution.utmCampaign],
    ["utm_content", attribution.utmContent],
    ["utm_term", attribution.utmTerm],
    ["campaign_id", attribution.campaignId],
    ["adset_id", attribution.adsetId],
    ["ad_id", attribution.adId],
    ["placement", attribution.placement],
    ["referrer", attribution.referrer],
    ["landing_page", attribution.landingPage],
  ];

  return (
    <section
      className="bg-card rounded-lg border p-5"
      aria-labelledby="lead-attribution"
    >
      <h2 className="text-lg font-semibold" id="lead-attribution">
        Origem e atribuição
      </h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="break-words">{value || "Não informado"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
