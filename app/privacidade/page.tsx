import type { Metadata } from "next";
import { PageIntro } from "@/components/common/page-intro";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Página reservada para a futura política de privacidade do Radar Previdenciário.",
};

export default function PrivacidadePage() {
  return (
    <PageIntro
      title="Política de Privacidade"
      description="Espaço reservado para a futura política de privacidade."
    />
  );
}
