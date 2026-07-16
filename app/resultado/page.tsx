import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, MessageCircle } from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { ResultViewedTracker } from "@/components/tracking/ResultViewedTracker";
import { Button } from "@/components/ui/button";
import { getAppConfig } from "@/services/configuration";
import {
  buildPublicResult,
  getLatestQuizResultForLead,
} from "@/services/quiz/results";
import { getTenantContext } from "@/services/tenants";
import { findExternalTrackingEventId } from "@/services/tracking";

export const metadata: Metadata = {
  title: "Resultado",
  description: "Resultado informativo da triagem previdenciária preliminar.",
  alternates: {
    canonical: "/resultado",
  },
};

export default async function ResultadoPage() {
  const cookieStore = await cookies();
  const leadId = cookieStore.get("rp_lead_session")?.value;

  if (!leadId) {
    redirect("/cadastro");
  }

  const tenantContext = await getTenantContext();
  const [config, result] = await Promise.all([
    getAppConfig(tenantContext),
    getLatestQuizResultForLead(tenantContext.tenantId, leadId),
  ]);

  if (!result) {
    redirect("/quiz");
  }

  const publicResult = buildPublicResult({
    result,
    fallbackDisclaimer: config.legal.disclaimer,
  });
  const qualifiedLeadExternalEventId = await findExternalTrackingEventId({
    tenantId: tenantContext.tenantId,
    leadId,
    sessionId: result.session_id,
    eventName: "QualifiedLead",
    eventPayloadContains: {
      resultId: result.id,
    },
  });

  return (
    <PageContainer>
      <ResultViewedTracker
        qualifiedLeadExternalEventId={qualifiedLeadExternalEventId}
        resultId={result.id}
      />
      <section className="py-section">
        <ContentContainer>
          <div className="mx-auto max-w-4xl">
            <SectionTitle
              align="center"
              description="A síntese abaixo é informativa, gerada a partir das respostas fornecidas e não constitui decisão do INSS, parecer jurídico ou confirmação de direito."
              eyebrow={config.brand.poweredBy}
              title="Resultado informativo"
            />

            <article className="bg-card shadow-card mt-12 rounded-xl border p-[var(--card-padding)]">
              <div className="bg-secondary text-secondary-foreground mb-6 inline-flex size-12 items-center justify-center rounded-lg">
                <FileText aria-hidden="true" className="size-6" />
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_240px] lg:items-start">
                <div>
                  <p className="text-secondary text-sm font-medium">
                    Resultado informativo da triagem
                  </p>
                  <h1 className="text-foreground mt-2 text-3xl font-semibold">
                    {publicResult.title}
                  </h1>
                  <p className="text-muted-foreground mt-4 leading-7">
                    {publicResult.summary}
                  </p>

                  <div className="bg-muted mt-8 rounded-lg p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText
                        aria-hidden="true"
                        className="text-secondary size-5"
                      />
                      <h2 className="text-foreground font-semibold">
                        Síntese preliminar
                      </h2>
                    </div>
                    <p className="text-muted-foreground leading-7">
                      {publicResult.nextStep}
                    </p>
                  </div>
                </div>

                <aside className="bg-background rounded-lg border p-5">
                  <p className="text-muted-foreground text-sm">
                    Tema identificado para análise
                  </p>
                  <p className="text-foreground mt-1 font-medium">
                    {publicResult.topicLabel}
                  </p>
                  <p className="text-muted-foreground mt-4 text-sm leading-6">
                    {publicResult.informationalMessage}
                  </p>
                </aside>
              </div>

              <div className="mt-8 rounded-lg border p-5">
                <p className="text-muted-foreground text-sm leading-6">
                  {publicResult.disclaimer}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/cadastro">
                    <MessageCircle aria-hidden="true" className="size-4" />
                    Nova triagem informativa
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/privacidade">Política de privacidade</Link>
                </Button>
              </div>
            </article>
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
