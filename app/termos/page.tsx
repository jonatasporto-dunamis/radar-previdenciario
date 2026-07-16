import type { Metadata } from "next";
import { ContactCard } from "@/components/common/contact-card";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { getAppConfig } from "@/services/configuration";

export async function generateMetadata(): Promise<Metadata> {
  const { brand, legal } = await getAppConfig();

  return {
    title: legal.termsTitle,
    description: `Termos iniciais de uso de ${brand.name}.`,
    alternates: {
      canonical: "/termos",
    },
  };
}

export default async function TermosPage() {
  const { brand, legal, office } = await getAppConfig();
  const professionalDisplay = office.legalProfessional
    ? `${office.legalProfessional.name} — ${office.legalProfessional.displayRegistration}`
    : null;
  const supportContact =
    office.privacy.contactEmail ??
    office.privacy.contactChannel ??
    brand.email ??
    null;
  const supportContactHref =
    supportContact && supportContact.includes("@")
      ? `mailto:${supportContact}`
      : null;

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <article className="bg-card shadow-card rounded-xl border p-8">
              <SectionTitle
                description="Documento base para orientar o uso da aplicação e separar triagem operacional de avaliação jurídica profissional."
                eyebrow={brand.poweredBy}
                title={legal.termsTitle}
              />

              <div className="text-muted-foreground mt-8 grid gap-6 leading-7">
                <p>
                  A aplicação oferece uma triagem previdenciária automatizada de
                  caráter informativo para organizar dados iniciais e facilitar
                  contato posterior com o escritório responsável.
                </p>
                <p>
                  Escritório configurado: {brand.legalName}
                  {professionalDisplay
                    ? `. Responsável: ${professionalDisplay}`
                    : ""}
                  . Atendimento com unidades em {office.units.join(", ")}.
                </p>
                <p>
                  As informações apresentadas não constituem consulta, parecer
                  jurídico, contratação automática, promessa de resultado ou
                  confirmação de direito a benefício.
                </p>
                <p>
                  O uso da triagem não cria relação advogado-cliente por si só.
                  A contratação, se houver, dependerá de contato posterior,
                  análise individual, documentos e aceite específico.
                </p>
                <p>
                  O usuário deve informar dados verdadeiros e evitar inserir
                  documentos, laudos, diagnósticos detalhados ou dados de
                  terceiros no questionário. A avaliação de benefícios
                  previdenciários depende de informações e documentos que não
                  são conferidos automaticamente por esta ferramenta.
                </p>
                <p>
                  Respostas desconhecidas, omitidas ou incompletas podem limitar
                  o resultado informativo e indicar necessidade de revisão
                  humana. A ferramenta pode ficar indisponível temporariamente
                  por manutenção, falhas técnicas ou motivos de segurança.
                </p>
                <p>
                  A marca, os textos, a estrutura visual e os componentes do
                  Radar Previdenciário são protegidos pelas regras aplicáveis de
                  propriedade intelectual, sem prejuízo dos direitos do titular
                  sobre seus dados pessoais.
                </p>
                <p>{legal.disclaimer}</p>
                <p>
                  Suporte e privacidade:{" "}
                  {supportContactHref ? (
                    <a
                      className="text-foreground underline"
                      href={supportContactHref}
                    >
                      {supportContact}
                    </a>
                  ) : supportContact ? (
                    <span className="text-foreground">{supportContact}</span>
                  ) : (
                    <span className="text-foreground">
                      canal pendente de confirmação pelo escritório responsável
                    </span>
                  )}
                  .
                </p>
              </div>
            </article>

            <ContactCard />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
