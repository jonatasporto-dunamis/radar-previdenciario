import type { Metadata } from "next";
import { ChevronRight, HelpCircle } from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { getAppConfig } from "@/services/configuration";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Layout preparado para o futuro questionário previdenciário.",
};

const previewOptions = [
  "Aposentadoria",
  "Auxílio ou benefício por incapacidade",
  "Pensão ou benefício familiar",
];

export default async function QuizPage() {
  const { brand, legal } = await getAppConfig();

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="mx-auto max-w-4xl">
            <SectionTitle
              align="center"
              description="A estrutura visual do questionário está preparada, mas nenhuma pergunta, resposta ou regra de negócio foi implementada."
              eyebrow={brand.poweredBy}
              title="Questionário previdenciário"
            />

            <div className="bg-card shadow-card mt-10 rounded-xl border p-6">
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground font-medium">35%</span>
                </div>
                <div
                  aria-label="Progresso demonstrativo do questionário"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={35}
                  className="bg-muted h-2 overflow-hidden rounded-full"
                  role="progressbar"
                >
                  <div className="bg-secondary h-full w-[35%] rounded-full" />
                </div>
              </div>

              <div className="bg-accent text-accent-foreground mb-6 inline-flex size-11 items-center justify-center rounded-md">
                <HelpCircle aria-hidden="true" className="size-5" />
              </div>

              <h1 className="text-foreground text-2xl font-semibold">
                Qual contexto melhor descreve sua busca?
              </h1>
              <p className="text-muted-foreground mt-3 leading-7">
                Exemplo visual de card de pergunta. As opções abaixo são apenas
                demonstrativas e não registram respostas.
              </p>

              <div className="mt-8 grid gap-3">
                {previewOptions.map((option) => (
                  <div
                    className="border-border bg-background flex items-center justify-between rounded-md border p-4"
                    key={option}
                  >
                    <span className="text-foreground font-medium">
                      {option}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="text-muted-foreground size-5"
                    />
                  </div>
                ))}
              </div>

              <p className="text-muted-foreground mt-8 text-sm leading-6">
                {legal.disclaimer}
              </p>
            </div>
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
