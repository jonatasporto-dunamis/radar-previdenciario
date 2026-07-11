import { Mail, MapPin, Phone } from "lucide-react";
import { getBrandConfig } from "@/services/configuration";

export async function ContactCard() {
  const brand = await getBrandConfig();
  const contactItems = [
    { label: brand.phone, href: `tel:${brand.phone}`, Icon: Phone },
    {
      label: brand.email,
      href: `mailto:${brand.email}`,
      Icon: Mail,
    },
    {
      label: `${brand.address}, ${brand.city} - ${brand.state}`,
      href: brand.website,
      Icon: MapPin,
    },
  ];

  return (
    <aside className="bg-card text-card-foreground shadow-card rounded-lg border p-[var(--card-padding)]">
      <h2 className="text-foreground text-xl font-semibold">
        Contato institucional
      </h2>
      <div className="mt-5 grid gap-3">
        {contactItems.map(({ label, href, Icon }) => (
          <a
            className="text-muted-foreground hover:text-foreground flex gap-3 text-sm transition"
            href={href}
            key={label}
          >
            <Icon aria-hidden="true" className="text-secondary mt-0.5 size-4" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
