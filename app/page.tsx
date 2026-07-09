import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Página inicial do Radar Previdenciário preparada para futura jornada de análise previdenciária.",
};

export default function Home() {
  return (
    <PageIntro
      title="Radar Previdenciário"
      description="Estrutura inicial preparada para a futura experiência de análise previdenciária."
    />
  );
}
