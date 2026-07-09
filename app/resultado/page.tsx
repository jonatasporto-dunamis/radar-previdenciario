import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Resultado",
  description:
    "Página reservada para apresentação futura de resultado da análise previdenciária.",
};

export default function ResultadoPage() {
  return (
    <PageIntro
      title="Resultado"
      description="Espaço reservado para a futura apresentação de resultados da análise."
    />
  );
}
