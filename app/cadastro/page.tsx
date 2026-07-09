import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Cadastro",
  description:
    "Página de cadastro preparada para a futura captação de leads previdenciários.",
};

export default function CadastroPage() {
  return (
    <PageIntro
      title="Cadastro"
      description="Espaço reservado para a futura etapa de cadastro da jornada."
    />
  );
}
