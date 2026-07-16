import { Mail, MapPin, Phone } from "lucide-react";
import { getBrandConfig } from "@/services/configuration";

export async function ContactCard() {
  const brand = await getBrandConfig();
  const contactItems = [
    brand.phone
      ? { label: brand.phone, href: `tel:${brand.phone}`, Icon: Phone }
      : null,
    brand.email
      ? {
          label: brand.email,
          href: `mailto:${brand.email}`,
          Icon: Mail,
        }
      : null,
    brand.address && brand.city && brand.state
      ? {
          label: `${brand.address}, ${brand.city} - ${brand.state}`,
          href: brand.website,
          Icon: MapPin,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      label: string;
      href: string;
      Icon: typeof Phone;
    } => Boolean(item),
  );

  return (
    <aside className="bg-card text-card-foreground shadow-card rounded-lg border p-[var(--card-padding)]">
      <h2 className="text-foreground text-xl font-semibold">
        Contato institucional
      </h2>
      {contactItems.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {contactItems.map(({ label, href, Icon }) => (
            <a
              className="text-muted-foreground hover:text-foreground flex gap-3 text-sm transition"
              href={href}
              key={label}
            >
              <Icon
                aria-hidden="true"
                className="text-secondary mt-0.5 size-4"
              />
              <span>{label}</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-5 text-sm leading-6">
          Canal institucional pendente de confirmação pelo escritório
          responsável.
        </p>
      )}
    </aside>
  );
}
