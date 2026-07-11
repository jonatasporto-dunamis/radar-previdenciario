import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileSearch,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { BenefitCard } from "@/components/common/benefit-card";
import { ContentContainer } from "@/components/common/content-container";
import { CTASection } from "@/components/common/cta-section";
import { Hero } from "@/components/common/hero";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { TrustCard } from "@/components/common/trust-card";
import {
  getBrandConfig,
  getLegalConfig,
  getSeoConfig,
} from "@/services/configuration";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoConfig();

  return {
    title: "Início",
    description: seo.description,
  };
}

const benefits = [
  {
    icon: <FileSearch aria-hidden="true" className="size-5" />,
    title: "Triagem previdenciária inicial",
    description:
      "Organize informações essenciais para uma primeira leitura sobre possíveis caminhos previdenciários.",
  },
  {
    icon: <ShieldCheck aria-hidden="true" className="size-5" />,
    title: "Experiência com confiança",
    description:
      "Fluxo preparado para transmitir clareza, proteção de dados e orientação responsável.",
  },
  {
    icon: <MessageCircle aria-hidden="true" className="size-5" />,
    title: "Contato qualificado",
    description:
      "A jornada foi estruturada para apoiar uma conversa posterior com o escritório responsável.",
  },
];

const steps = [
  {
    icon: <ClipboardCheck aria-hidden="true" className="size-6" />,
    title: "Cadastro inicial",
    description:
      "Espaço preparado para identificar o interessado antes do questionário.",
  },
  {
    icon: <ArrowRight aria-hidden="true" className="size-6" />,
    title: "Perguntas guiadas",
    description:
      "A estrutura visual já prevê etapas progressivas e respostas objetivas.",
  },
  {
    icon: <BadgeCheck aria-hidden="true" className="size-6" />,
    title: "Resultado informativo",
    description:
      "A apresentação final separa indícios por níveis visuais de potencial.",
  },
];

export default async function Home() {
  const [brand, legal] = await Promise.all([
    getBrandConfig(),
    getLegalConfig(),
  ]);

  return (
    <PageContainer>
      <Hero
        subtitle="Uma experiência digital configurável para escritórios previdenciários capturarem leads com clareza, confiança e responsabilidade."
        title="Análise previdenciária informativa em uma jornada simples e segura."
      />

      <section className="py-section">
        <ContentContainer>
          <SectionTitle
            align="center"
            description="A arquitetura visual nasce preparada para múltiplos escritórios, com dados institucionais editáveis por configuração."
            eyebrow={brand.poweredBy}
            title="Uma base visual preparada para escalar"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </ContentContainer>
      </section>

      <section className="bg-muted/45 py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionTitle
              description="O fluxo ainda não possui lógica funcional, mas os espaços visuais já foram definidos para receber a implementação futura."
              eyebrow="Como funciona"
              title="Da entrada ao resultado com previsibilidade visual"
            />
            <div className="grid gap-4">
              {steps.map((step) => (
                <TrustCard key={step.title} {...step} />
              ))}
            </div>
          </div>
        </ContentContainer>
      </section>

      <section className="py-section">
        <ContentContainer>
          <div className="bg-card shadow-card rounded-xl border p-8">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
              <div className="bg-accent text-accent-foreground inline-flex size-12 items-center justify-center rounded-lg">
                <LockKeyhole aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-semibold">
                  Aviso ético e responsabilidade
                </h2>
                <p className="text-muted-foreground mt-4 max-w-3xl leading-7">
                  {legal.disclaimer}
                </p>
                <p className="text-muted-foreground mt-3 max-w-3xl leading-7">
                  As informações institucionais exibidas nesta aplicação são
                  consumidas por arquivos em `config/`, permitindo adaptar a
                  experiência para outros escritórios sem reescrever
                  componentes.
                </p>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>

      <CTASection
        description="A próxima etapa da jornada poderá receber cadastro e questionário quando a regra de negócio for definida."
        title="Comece pela estrutura visual da análise"
      />
    </PageContainer>
  );
}
