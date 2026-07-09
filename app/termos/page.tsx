import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Página reservada para os futuros termos de uso do Radar Previdenciário.",
};

export default function TermosPage() {
  return (
    <PageIntro
      title="Termos de Uso"
      description="Espaço reservado para os futuros termos de uso."
    />
  );
}
