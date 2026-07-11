import type { Metadata } from "next";
import { ContactCard } from "@/components/common/contact-card";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { getAppConfig } from "@/services/configuration";

export async function generateMetadata(): Promise<Metadata> {
  const { brand, legal } = await getAppConfig();

  return {
    title: legal.privacyPolicyTitle,
    description: `Informações iniciais de privacidade de ${brand.name}.`,
  };
}

export default async function PrivacidadePage() {
  const { brand, legal, office } = await getAppConfig();

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <article className="bg-card shadow-card rounded-xl border p-8">
              <SectionTitle
                description={`Documento base para ${legal.privacyPolicyCompany}. O texto final deverá ser revisado antes de uso em produção.`}
                eyebrow={brand.poweredBy}
                title={legal.privacyPolicyTitle}
              />

              <div className="text-muted-foreground mt-8 grid gap-6 leading-7">
                <p>
                  Esta página utiliza informações institucionais configuradas
                  para identificar o controlador responsável e os canais de
                  contato.
                </p>
                <p>
                  Canal de privacidade:{" "}
                  <a
                    className="text-foreground underline"
                    href={`mailto:${brand.privacyEmail}`}
                  >
                    {brand.privacyEmail}
                  </a>
                  .
                </p>
                <p>
                  Atendimento configurado: {office.serviceMode}. Horário:{" "}
                  {office.workingHours}.
                </p>
                <p>{legal.cookiePolicy}</p>
                <p>{legal.disclaimer}</p>
              </div>
            </article>

            <ContactCard />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
