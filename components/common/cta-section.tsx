import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentContainer } from "@/components/common/content-container";
import { PrimaryButton } from "@/components/common/primary-button";
import { getLegalConfig } from "@/services/configuration";

type CTASectionProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
};

export async function CTASection({
  title,
  description,
  href = "/cadastro",
  label = "Iniciar triagem informativa",
}: CTASectionProps) {
  const legal = await getLegalConfig();

  return (
    <section className="py-section">
      <ContentContainer>
        <div className="bg-primary text-primary-foreground shadow-elevated rounded-xl p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold">{title}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 opacity-90">
                {description}
              </p>
              <p className="mt-4 max-w-2xl text-xs leading-5 opacity-80">
                {legal.disclaimer}
              </p>
            </div>
            <PrimaryButton
              asChild
              className="bg-card text-card-foreground hover:bg-card/90"
            >
              <Link href={href}>
                {label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </PrimaryButton>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
