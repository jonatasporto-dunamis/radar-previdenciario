import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PrimaryButton } from "@/components/common/primary-button";
import { SecondaryButton } from "@/components/common/secondary-button";
import { getAppConfig } from "@/services/configuration";

type HeroProps = {
  title: string;
  subtitle: string;
  primaryHref?: string;
};

export async function Hero({
  title,
  subtitle,
  primaryHref = "/cadastro",
}: HeroProps) {
  const { brand, legal, office } = await getAppConfig();

  return (
    <section className="relative overflow-hidden border-b">
      <ContentContainer className="py-section grid min-h-[calc(100svh-4rem)] items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="max-w-3xl">
          <p className="text-muted-foreground mb-5 text-sm font-medium uppercase">
            {brand.poweredBy}
          </p>
          <h1 className="text-foreground text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton asChild size="lg">
              <Link href={primaryHref}>
                Iniciar triagem informativa
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </PrimaryButton>
            <SecondaryButton asChild size="lg">
              <Link href="/privacidade">Ver política de privacidade</Link>
            </SecondaryButton>
          </div>
          <p className="text-muted-foreground mt-6 max-w-xl text-sm leading-6">
            {legal.disclaimer}
          </p>
        </div>

        <div
          aria-label="Resumo visual de confiança da análise previdenciária"
          className="bg-card text-card-foreground shadow-elevated rounded-xl border p-6"
        >
          <div className="bg-accent rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-accent-foreground text-sm font-medium">
                  Ambiente preparado para
                </p>
                <p className="text-accent-foreground mt-1 text-2xl font-semibold">
                  triagem informativa
                </p>
              </div>
              <ShieldCheck
                aria-hidden="true"
                className="text-secondary size-10 shrink-0"
              />
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {office.specialties.map((specialty) => (
              <div className="flex items-center gap-3" key={specialty}>
                <CheckCircle2
                  aria-hidden="true"
                  className="text-success size-5"
                />
                <span className="text-muted-foreground text-sm">
                  {specialty}
                </span>
              </div>
            ))}
          </div>
          <div className="border-border mt-6 border-t pt-6">
            <p className="text-muted-foreground text-sm leading-6">
              {office.serviceMode} · {office.workingHours}
            </p>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
