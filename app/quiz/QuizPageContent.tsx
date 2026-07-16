import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { QuizExperience } from "@/components/quiz/experience";
import { getAppConfig } from "@/services/configuration";
import { getLatestQuizResultForLead } from "@/services/quiz/results";
import { getQuizSessionState } from "@/services/quiz/session";
import { getQuizTemplateBySlug } from "@/services/quiz/templates";
import { getTenantContext } from "@/services/tenants";

type QuizSearchParams = Record<string, string | string[] | undefined>;

const allowedCampaignParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [firstIp] = value.split(",");
  const ip = firstIp?.trim();

  return ip || null;
}

function buildCadastroRedirect(
  templateSlug: string,
  isDefault: boolean,
  searchParams?: QuizSearchParams,
): string {
  const params = new URLSearchParams();

  if (!isDefault) {
    params.set("next", `/quiz/${templateSlug}`);
  }

  for (const key of allowedCampaignParams) {
    const value = searchParams?.[key];
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  const query = params.toString();

  return query ? `/cadastro?${query}` : "/cadastro";
}

export async function QuizPageContent({
  searchParams,
  templateSlug,
}: {
  searchParams?: QuizSearchParams;
  templateSlug?: string;
}) {
  const template = getQuizTemplateBySlug(templateSlug);

  if (!template) {
    notFound();
  }

  const cookieStore = await cookies();
  const leadId = cookieStore.get("rp_lead_session")?.value;

  if (!leadId) {
    redirect(
      buildCadastroRedirect(template.slug, template.isDefault, searchParams),
    );
  }

  const requestHeaders = await headers();
  const tenantContext = await getTenantContext({
    hostname:
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  });
  const sessionState = await getQuizSessionState(
    tenantContext.tenantId,
    leadId,
    {
      ipAddress:
        getFirstForwardedIp(requestHeaders.get("x-forwarded-for")) ??
        requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
    },
    template,
  );

  if (!sessionState) {
    redirect("/cadastro");
  }

  if (sessionState.session.status === "completed") {
    const result = await getLatestQuizResultForLead(
      tenantContext.tenantId,
      leadId,
    );

    if (!result) {
      redirect("/cadastro");
    }

    redirect("/resultado");
  }

  const { brand, legal } = await getAppConfig(tenantContext);

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="mx-auto max-w-4xl">
            <SectionTitle
              align="center"
              description={template.preventiveText.shortDisclaimer}
              eyebrow={brand.poweredBy}
              title={template.name}
            />

            <QuizExperience
              disclaimer={legal.disclaimer}
              flowTitle={template.name}
              initialAnswers={sessionState.answers}
              initialProgress={sessionState.progress}
              initialQuestionId={sessionState.currentQuestionId}
              quizStartedExternalEventId={
                sessionState.quizStartedExternalEventId
              }
              questions={sessionState.questions}
              sensitiveDisclaimer={template.preventiveText.sensitiveDisclaimer}
              sessionId={sessionState.session.id}
            />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
