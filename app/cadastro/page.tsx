import type { Metadata } from "next";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { ContactCard } from "@/components/common/contact-card";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { TrustCard } from "@/components/common/trust-card";
import { getAppConfig } from "@/services/configuration";

export const metadata: Metadata = {
  title: "Cadastro",
  description:
    "Layout preparado para futura etapa de cadastro da análise previdenciária.",
};

const readinessItems = [
  {
    icon: <FileText aria-hidden="true" className="size-5" />,
    title: "Dados pessoais",
    description: "Área reservada para identificação do interessado.",
  },
  {
    icon: <ShieldCheck aria-hidden="true" className="size-5" />,
    title: "Consentimento",
    description: "Espaço visual para aviso de privacidade e termos.",
  },
  {
    icon: <CheckCircle2 aria-hidden="true" className="size-5" />,
    title: "Próximo passo",
    description: "Estrutura preparada para encaminhar ao questionário.",
  },
];

export default async function CadastroPage() {
  const { brand, legal } = await getAppConfig();

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <div>
              <SectionTitle
                description="Esta página ainda não possui formulário funcional. O layout reserva espaço para receber campos, consentimento e ações futuras."
                eyebrow={brand.poweredBy}
                title="Cadastro preparado para a futura captação"
              />

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {readinessItems.map((item) => (
                  <TrustCard key={item.title} {...item} />
                ))}
              </div>

              <div className="bg-card shadow-card mt-10 rounded-xl border p-6">
                <div className="grid gap-4">
                  <div className="bg-muted h-12 rounded-md" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-muted h-12 rounded-md" />
                    <div className="bg-muted h-12 rounded-md" />
                  </div>
                  <div className="bg-muted h-24 rounded-md" />
                  <div className="bg-primary h-11 w-full rounded-md sm:w-56" />
                </div>
                <p className="text-muted-foreground mt-5 text-sm leading-6">
                  {legal.disclaimer}
                </p>
              </div>
            </div>

            <ContactCard />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
