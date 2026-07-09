import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "Página reservada para o futuro questionário de análise previdenciária.",
};

export default function QuizPage() {
  return (
    <PageIntro
      title="Quiz"
      description="Espaço reservado para o futuro questionário. Nenhuma lógica funcional foi implementada nesta etapa."
    />
  );
}
