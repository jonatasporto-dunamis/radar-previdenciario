import type { Metadata } from "next";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { ContactCard } from "@/components/common/contact-card";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { TrustCard } from "@/components/common/trust-card";
import { LeadRegistrationForm } from "@/components/leads/LeadRegistrationForm";
import { getAppConfig } from "@/services/configuration";

export const metadata: Metadata = {
  title: "Cadastro",
  description:
    "Cadastro inicial para continuidade da análise previdenciária informativa.",
  alternates: {
    canonical: "/cadastro",
  },
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
                description="Informe seus dados para iniciar a análise informativa. O identificador do lead é preservado com cookie seguro, sem aparecer na URL."
                eyebrow={brand.poweredBy}
                title="Cadastro inicial para continuar a análise"
              />

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {readinessItems.map((item) => (
                  <TrustCard key={item.title} {...item} />
                ))}
              </div>

              <LeadRegistrationForm />

              <p className="text-muted-foreground mt-5 text-sm leading-6">
                Seus dados serão utilizados para dar continuidade à análise e
                permitir que o escritório entre em contato com você.
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {legal.disclaimer}
              </p>
            </div>

            <ContactCard />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
