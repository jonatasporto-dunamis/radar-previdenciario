import type { Metadata } from "next";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { LeadRegistrationForm } from "@/components/leads/LeadRegistrationForm";
import { TrackedWhatsAppLink } from "@/components/tracking/TrackedWhatsAppLink";
import {
  formatTenantWhatsappMessage,
  normalizeValidWhatsappNumber,
} from "@/lib/branding/whatsapp";
import { getAppConfig } from "@/services/configuration";
import { getTenantContext } from "@/services/tenants";

export const metadata: Metadata = {
  title: "Cadastro",
  description:
    "Cadastro inicial para iniciar uma triagem rápida e informativa.",
  alternates: { canonical: "/cadastro" },
};

type CadastroPageProps = { searchParams?: Promise<{ next?: string }> };

function normalizeNextPath(value: string | undefined): string {
  if (!value?.startsWith("/quiz")) return "/quiz";
  if (value.includes("//") || value.includes("\\") || value.includes(".."))
    return "/quiz";
  return value;
}

export default async function CadastroPage({
  searchParams,
}: CadastroPageProps) {
  const tenantContext = await getTenantContext();
  const { brand } = await getAppConfig(tenantContext);
  const nextPath = normalizeNextPath((await searchParams)?.next);
  const whatsappNumber =
    normalizeValidWhatsappNumber(brand.whatsapp) ||
    (tenantContext.tenant.isDefault
      ? normalizeValidWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)
      : "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        formatTenantWhatsappMessage(brand.whatsappDefaultMessage, brand.name),
      )}`
    : null;

  return (
    <section className="px-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <p className="text-primary text-sm font-semibold">{brand.name}</p>
          <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {brand.registrationTitle || "Cadastro inicial"}
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-7">
            {brand.registrationSubtitle}
          </p>
          <p className="text-foreground mx-auto mt-2 max-w-xl text-sm leading-6">
            {brand.registrationSupportText}
          </p>
        </div>

        <LeadRegistrationForm
          buttonLabel={brand.registrationButtonLabel}
          emailPlaceholder={brand.registrationEmailPlaceholder}
          namePlaceholder={brand.registrationNamePlaceholder}
          nextPath={nextPath}
          officeName={brand.name}
          phonePlaceholder={brand.registrationPhonePlaceholder}
        />

        {whatsappHref ? (
          <TrackedWhatsAppLink
            className="hover:bg-muted mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            href={whatsappHref}
            location="registration_cta"
            rel="noopener noreferrer"
            style={{
              borderColor: brand.whatsappColor,
              color: brand.whatsappColor,
            }}
            target="_blank"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
            Falar com o escritório
          </TrackedWhatsAppLink>
        ) : null}

        <div className="text-muted-foreground mt-6 flex items-start gap-2 text-xs leading-5">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            O resultado é uma orientação inicial e não substitui a análise
            individual de um profissional.
          </p>
        </div>
      </div>
    </section>
  );
}
