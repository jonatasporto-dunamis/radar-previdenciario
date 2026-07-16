import { BrandLogo } from "@/components/common/brand-logo";
import { BrandName } from "@/components/common/brand-name";
import { getAppConfig } from "@/services/configuration";

export async function FooterCompany() {
  const { brand, office } = await getAppConfig();

  return (
    <div>
      <div className="flex items-center gap-3">
        <BrandLogo className="size-9" />
        <BrandName />
      </div>
      <p className="text-muted-foreground mt-4 max-w-md text-sm leading-6">
        {brand.legalName}
      </p>
      {office.legalProfessional ? (
        <p className="text-muted-foreground mt-2 text-sm">
          {office.legalProfessional.name} —{" "}
          {office.legalProfessional.displayRegistration}
        </p>
      ) : null}
      <p className="text-muted-foreground mt-2 text-sm">
        Atendimento com unidades em {office.units.join(", ")}.
      </p>
    </div>
  );
}
