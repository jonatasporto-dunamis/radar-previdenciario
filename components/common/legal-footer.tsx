import Link from "next/link";
import { getAppConfig } from "@/services/configuration";

export async function LegalFooter() {
  const { brand, legal, seo } = await getAppConfig();

  return (
    <div className="border-border text-muted-foreground flex flex-col gap-4 border-t pt-6 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between">
      <p>
        &copy; {new Date().getFullYear()} {brand.legalName}. {brand.copyright}
      </p>
      <nav aria-label="Links legais">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li>
            <Link
              className="hover:text-foreground transition"
              href="/privacidade"
            >
              {legal.privacyPolicyTitle}
            </Link>
          </li>
          <li>
            <Link className="hover:text-foreground transition" href="/termos">
              {legal.termsTitle}
            </Link>
          </li>
          <li>
            <span>{seo.locale}</span>
          </li>
          <li>
            <span>{brand.poweredBy}</span>
          </li>
        </ul>
      </nav>
    </div>
  );
}
