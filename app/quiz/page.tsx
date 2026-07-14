import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { QuizExperience } from "@/components/quiz/experience";
import { getAppConfig } from "@/services/configuration";
import { getLatestQuizResultForLead } from "@/services/quiz/results";
import { getQuizSessionState } from "@/services/quiz/session";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Layout preparado para o futuro questionário previdenciário.",
};

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

export default async function QuizPage() {
  const cookieStore = await cookies();
  const leadId = cookieStore.get("rp_lead_session")?.value;

  if (!leadId) {
    redirect("/cadastro");
  }

  const requestHeaders = await headers();
  const sessionState = await getQuizSessionState(leadId, {
    ipAddress:
      getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
      requestHeaders.get("x-real-ip"),
    userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
  });

  if (!sessionState) {
    redirect("/cadastro");
  }

  if (sessionState.session.status === "completed") {
    const result = await getLatestQuizResultForLead(leadId);

    if (!result) {
      redirect("/cadastro");
    }

    redirect("/resultado");
  }

  const { brand, legal } = await getAppConfig();

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="mx-auto max-w-4xl">
            <SectionTitle
              align="center"
              description="Responda às perguntas de triagem. Cada resposta é salva automaticamente para permitir retomada posterior."
              eyebrow={brand.poweredBy}
              title="Questionário previdenciário"
            />

            <QuizExperience
              disclaimer={legal.disclaimer}
              flowTitle="Triagem inicial"
              initialAnswers={sessionState.answers}
              initialProgress={sessionState.progress}
              initialQuestionId={sessionState.currentQuestionId}
              quizStartedExternalEventId={
                sessionState.quizStartedExternalEventId
              }
              questions={sessionState.questions}
              sessionId={sessionState.session.id}
            />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
