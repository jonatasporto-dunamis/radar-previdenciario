import type { Metadata } from "next";
import { AlertTriangle, BadgeCheck, CircleHelp } from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { getLegalConfig } from "@/services/configuration";

export const metadata: Metadata = {
  title: "Resultado",
  description:
    "Layout demonstrativo dos possíveis estados visuais de resultado da análise previdenciária.",
};

const resultStates = [
  {
    title: "Alto potencial",
    description:
      "Indica que as respostas poderiam apontar sinais relevantes para avaliação individual.",
    badge: "alto_potencial",
    Icon: BadgeCheck,
  },
  {
    title: "Médio potencial",
    description:
      "Indica que há elementos a observar, mas seria necessária análise documental.",
    badge: "medio_potencial",
    Icon: CircleHelp,
  },
  {
    title: "Baixo potencial",
    description:
      "Indica poucos sinais iniciais, sem afastar avaliação jurídica individual.",
    badge: "baixo_potencial",
    Icon: AlertTriangle,
  },
];

export default async function ResultadoPage() {
  const legal = await getLegalConfig();

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <SectionTitle
            align="center"
            description="Esta tela demonstra os três estados visuais previstos. Não há cálculo, classificação real ou regra de negócio implementada."
            eyebrow="Demonstração visual"
            title="Estados de resultado"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {resultStates.map(({ title, description, badge, Icon }) => (
              <article
                className="bg-card shadow-card rounded-xl border p-[var(--card-padding)]"
                key={badge}
              >
                <div className="bg-accent text-accent-foreground mb-6 inline-flex size-12 items-center justify-center rounded-lg">
                  <Icon aria-hidden="true" className="size-6" />
                </div>
                <p className="text-secondary text-sm font-medium">{badge}</p>
                <h2 className="text-foreground mt-2 text-2xl font-semibold">
                  {title}
                </h2>
                <p className="text-muted-foreground mt-4 leading-7">
                  {description}
                </p>
                <div className="bg-muted mt-6 rounded-md p-4">
                  <p className="text-muted-foreground text-sm leading-6">
                    {legal.disclaimer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
