import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { BrandName } from "@/components/common/brand-name";
import { getBrandConfig } from "@/services/configuration";

export async function RegistrationHeader() {
  const brand = await getBrandConfig();

  return (
    <header className="bg-background border-b">
      <div className="px-page mx-auto flex min-h-16 w-full max-w-3xl items-center py-3">
        <Link
          aria-label={`${brand.name} - página inicial`}
          className="text-foreground flex min-w-0 items-center gap-2 text-base font-semibold"
          href="/"
        >
          <BrandLogo className="size-9 shrink-0" />
          <BrandName className="truncate" />
        </Link>
      </div>
    </header>
  );
}
