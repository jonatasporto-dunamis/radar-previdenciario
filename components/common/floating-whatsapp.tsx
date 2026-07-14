import { MessageCircle } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/tracking/TrackedWhatsAppLink";
import { getAppConfig } from "@/services/configuration";

export async function FloatingWhatsApp() {
  const { brand, office } = await getAppConfig();
  const whatsappNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || brand.whatsapp
  ).replace(/\D/g, "");
  const defaultMessage =
    brand.whatsappDefaultMessage || office.whatsappDefaultMessage;
  const encodedMessage = encodeURIComponent(defaultMessage);

  if (!whatsappNumber) {
    return null;
  }

  return (
    <TrackedWhatsAppLink
      aria-label={`Abrir conversa no WhatsApp com ${brand.name}`}
      className="bg-success text-success-foreground shadow-soft focus-visible:outline-ring fixed right-5 bottom-5 z-40 inline-flex size-12 items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      href={`https://wa.me/${whatsappNumber}?text=${encodedMessage}`}
      location="floating_button"
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" className="size-6" />
    </TrackedWhatsAppLink>
  );
}
