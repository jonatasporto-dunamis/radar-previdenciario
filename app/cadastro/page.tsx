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
    "Cadastro inicial para continuidade da triagem previdenciária informativa.",
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
    description: "Registro de ciência sobre privacidade, termos e contato.",
  },
  {
    icon: <CheckCircle2 aria-hidden="true" className="size-5" />,
    title: "Próximo passo",
    description: "Estrutura preparada para encaminhar ao questionário.",
  },
];

type CadastroPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

function normalizeNextPath(value: string | undefined): string {
  if (!value?.startsWith("/quiz")) {
    return "/quiz";
  }

  if (value.includes("//") || value.includes("\\") || value.includes("..")) {
    return "/quiz";
  }

  return value;
}

export default async function CadastroPage({
  searchParams,
}: CadastroPageProps) {
  const { brand, legal } = await getAppConfig();
  const nextPath = normalizeNextPath((await searchParams)?.next);

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <div>
              <SectionTitle
                description="Informe seus dados para iniciar a triagem informativa. O identificador do atendimento é preservado com cookie seguro, sem aparecer na URL."
                eyebrow={brand.poweredBy}
                title="Cadastro inicial para continuar a triagem"
              />

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {readinessItems.map((item) => (
                  <TrustCard key={item.title} {...item} />
                ))}
              </div>

              <LeadRegistrationForm
                nextPath={nextPath}
                officeName={brand.name}
              />

              <p className="text-muted-foreground mt-5 text-sm leading-6">
                Seus dados serão utilizados para dar continuidade à triagem,
                registrar sua autorização de contato e permitir que o escritório
                responsável avalie se há necessidade de conversa individual.
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
