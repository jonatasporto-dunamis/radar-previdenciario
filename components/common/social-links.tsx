import {
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  Link2,
  Music2,
  type LucideIcon,
} from "lucide-react";
import { getBrandConfig } from "@/services/configuration";

export async function SocialLinks() {
  const brand = await getBrandConfig();
  const socialLinks: Array<{
    href: string;
    label: string;
    Icon: LucideIcon;
  }> = [
    { href: brand.instagram, label: "Instagram", Icon: Camera },
    { href: brand.facebook, label: "Facebook", Icon: Link2 },
    { href: brand.linkedin, label: "LinkedIn", Icon: BriefcaseBusiness },
    { href: brand.youtube, label: "YouTube", Icon: Clapperboard },
    { href: brand.tiktok, label: "TikTok", Icon: Music2 },
  ].filter((item) => Boolean(item.href));

  if (!socialLinks.length) {
    return null;
  }

  return (
    <nav aria-label="Redes sociais">
      <ul className="flex flex-wrap gap-2">
        {socialLinks.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              aria-label={label}
              className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-10 items-center justify-center rounded-md border transition"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon aria-hidden="true" className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
