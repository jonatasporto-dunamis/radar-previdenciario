import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  CircleHelp,
  FileText,
  MessageCircle,
} from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { ResultViewedTracker } from "@/components/tracking/ResultViewedTracker";
import { Button } from "@/components/ui/button";
import { getAppConfig } from "@/services/configuration";
import { getLatestQuizResultForLead } from "@/services/quiz/results";

export const metadata: Metadata = {
  title: "Resultado",
  description: "Resultado informativo da triagem previdenciária preliminar.",
};

const resultContent = {
  alto_potencial: {
    title: "Alto potencial",
    description:
      "As respostas indicam sinais relevantes para avaliação individual.",
    Icon: BadgeCheck,
    iconClassName: "bg-success text-success-foreground",
    borderClassName: "border-success/30",
  },
  medio_potencial: {
    title: "Médio potencial",
    description:
      "As respostas indicam elementos de atenção que dependem de análise documental.",
    Icon: CircleHelp,
    iconClassName: "bg-warning text-warning-foreground",
    borderClassName: "border-warning/30",
  },
  baixo_potencial: {
    title: "Baixo potencial",
    description:
      "A triagem inicial encontrou poucos sinais, sem substituir avaliação individual.",
    Icon: AlertTriangle,
    iconClassName: "bg-danger text-danger-foreground",
    borderClassName: "border-danger/30",
  },
};

function getResultContent(classification: string) {
  if (
    classification === "alto_potencial" ||
    classification === "medio_potencial" ||
    classification === "baixo_potencial"
  ) {
    return resultContent[classification];
  }

  return resultContent.baixo_potencial;
}

export default async function ResultadoPage() {
  const cookieStore = await cookies();
  const leadId = cookieStore.get("rp_lead_session")?.value;

  if (!leadId) {
    redirect("/cadastro");
  }

  const [config, result] = await Promise.all([
    getAppConfig(),
    getLatestQuizResultForLead(leadId),
  ]);

  if (!result) {
    redirect("/quiz");
  }

  const content = getResultContent(result.classification);
  const { Icon } = content;
  const disclaimer = result.ethical_disclaimer ?? config.legal.disclaimer;

  return (
    <PageContainer>
      <ResultViewedTracker resultId={result.id} />
      <section className="py-section">
        <ContentContainer>
          <div className="mx-auto max-w-4xl">
            <SectionTitle
              align="center"
              description="A classificação abaixo é preliminar e foi gerada a partir das respostas informadas no questionário."
              eyebrow={config.brand.poweredBy}
              title="Resultado informativo"
            />

            <article
              className={`bg-card shadow-card mt-12 rounded-xl border p-[var(--card-padding)] ${content.borderClassName}`}
            >
              <div
                className={`mb-6 inline-flex size-12 items-center justify-center rounded-lg ${content.iconClassName}`}
              >
                <Icon aria-hidden="true" className="size-6" />
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_240px] lg:items-start">
                <div>
                  <p className="text-secondary text-sm font-medium">
                    {result.classification}
                  </p>
                  <h1 className="text-foreground mt-2 text-3xl font-semibold">
                    {content.title}
                  </h1>
                  <p className="text-muted-foreground mt-4 leading-7">
                    {content.description}
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
                      {result.summary}
                    </p>
                  </div>
                </div>

                <aside className="bg-background rounded-lg border p-5">
                  <p className="text-muted-foreground text-sm">Score</p>
                  <p className="text-foreground mt-1 text-4xl font-semibold">
                    {result.score}
                  </p>
                  <div
                    aria-label={`Pontuação ${result.score} de 100`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={result.score}
                    className="bg-muted mt-4 h-2 overflow-hidden rounded-full"
                    role="progressbar"
                  >
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${Math.min(result.score, 100)}%` }}
                    />
                  </div>

                  <p className="text-muted-foreground mt-6 text-sm">
                    Benefício em destaque
                  </p>
                  <p className="text-foreground mt-1 font-medium">
                    {result.potential_benefit ??
                      "Triagem previdenciária inicial"}
                  </p>
                </aside>
              </div>

              <div className="mt-8 rounded-lg border p-5">
                <p className="text-muted-foreground text-sm leading-6">
                  {disclaimer}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/cadastro">
                    <MessageCircle aria-hidden="true" className="size-4" />
                    Nova análise
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
