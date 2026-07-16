import type { Metadata } from "next";
import { QuizPageContent } from "./QuizPageContent";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Questionário de triagem previdenciária informativa.",
  alternates: {
    canonical: "/quiz",
  },
};

type QuizPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuizPage({ searchParams }: QuizPageProps) {
  return <QuizPageContent searchParams={await searchParams} />;
}
