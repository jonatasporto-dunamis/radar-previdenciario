import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { buildThemeCss } from "@/config/theme";
import { AttributionCapture } from "@/components/tracking/AttributionCapture";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import {
  getBrandConfig,
  getSeoConfig,
  getThemeConfig,
} from "@/services/configuration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [brand, seo] = await Promise.all([getBrandConfig(), getSeoConfig()]);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    brand.website ||
    "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    applicationName: seo.title,
    title: {
      default: seo.title,
      template: `%s | ${seo.title}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    manifest: "/manifest.json",
    icons: {
      icon: brand.favicon,
    },
    openGraph: {
      type: "website",
      locale: seo.locale,
      url: siteUrl,
      siteName: brand.name,
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.twitterImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeConfig();
  const themeCss = buildThemeCss(theme);

  return (
    <html lang="pt-BR">
      <head>
        <style
          id="radar-theme"
          // Theme values come from local config files and are not user input.
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-svh font-sans antialiased`}
      >
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo principal
        </a>
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
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
