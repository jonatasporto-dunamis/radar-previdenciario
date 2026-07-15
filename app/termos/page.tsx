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

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <article className="bg-card shadow-card rounded-xl border p-8">
              <SectionTitle
                description="Documento base para orientar o uso futuro da aplicação. O texto jurídico final deve ser revisado antes de produção."
                eyebrow={brand.poweredBy}
                title={legal.termsTitle}
              />

              <div className="text-muted-foreground mt-8 grid gap-6 leading-7">
                <p>
                  A aplicação é uma experiência informativa configurável para
                  escritórios previdenciários.
                </p>
                <p>
                  Escritório configurado: {brand.legalName}. Responsável:{" "}
                  {office.responsibleLawyer} ({office.oab}).
                </p>
                <p>
                  As informações apresentadas não constituem parecer jurídico,
                  contratação automática ou promessa de resultado.
                </p>
                <p>{legal.disclaimer}</p>
                <p>
                  Suporte:{" "}
                  <a
                    className="text-foreground underline"
                    href={`mailto:${brand.supportEmail}`}
                  >
                    {brand.supportEmail}
                  </a>
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
