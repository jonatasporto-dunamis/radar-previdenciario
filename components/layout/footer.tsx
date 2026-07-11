import { ContactCard } from "@/components/common/contact-card";
import { FooterCompany } from "@/components/common/footer-company";
import { LegalFooter } from "@/components/common/legal-footer";
import { OfficeInformation } from "@/components/common/office-information";
import { SocialLinks } from "@/components/common/social-links";

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="px-page mx-auto grid w-full max-w-[var(--spacing-content)] gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="grid gap-6">
          <FooterCompany />
          <SocialLinks />
        </div>
        <OfficeInformation />
        <ContactCard />
      </div>
      <div className="px-page mx-auto w-full max-w-[var(--spacing-content)] pb-8">
        <LegalFooter />
      </div>
    </footer>
  );
}
