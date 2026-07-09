import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );

  if (!whatsappNumber) {
    return null;
  }

  return (
    <a
      aria-label="Abrir conversa no WhatsApp"
      className="bg-success text-success-foreground shadow-soft focus-visible:outline-ring fixed right-5 bottom-5 z-40 inline-flex size-12 items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      href={`https://wa.me/${whatsappNumber}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" className="size-6" />
    </a>
  );
}
