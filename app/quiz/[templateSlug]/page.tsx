import type { Metadata } from "next";
import { getQuizTemplateBySlug } from "@/services/quiz/templates";
import { QuizPageContent } from "../QuizPageContent";

type QuizTemplatePageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: QuizTemplatePageProps): Promise<Metadata> {
  const { templateSlug } = await params;
  const template = getQuizTemplateBySlug(templateSlug);

  return {
    title: template?.name ?? "Quiz",
    description:
      template?.description ?? "Questionário de triagem previdenciária.",
    alternates: {
      canonical: `/quiz/${templateSlug}`,
    },
  };
}

export default async function QuizTemplatePage({
  params,
  searchParams,
}: QuizTemplatePageProps) {
  const { templateSlug } = await params;

  return (
    <QuizPageContent
      searchParams={await searchParams}
      templateSlug={templateSlug}
    />
  );
}
