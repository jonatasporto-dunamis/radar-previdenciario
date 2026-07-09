import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteDescription =
  "Aplicação web para geração de leads qualificados em advocacia previdenciária.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Radar Previdenciário",
  title: {
    default: "Radar Previdenciário",
    template: "%s | Radar Previdenciário",
  },
  description: siteDescription,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Radar Previdenciário",
    title: "Radar Previdenciário",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar Previdenciário",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-svh font-sans antialiased`}
      >
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo principal
        </a>
        <div className="flex min-h-svh flex-col">
          <Header />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
