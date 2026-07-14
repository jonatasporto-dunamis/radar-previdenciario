import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { buildThemeCss } from "@/config/theme";
import { AttributionCapture } from "@/components/tracking/AttributionCapture";
import { TrackingConsentBanner } from "@/components/tracking/TrackingConsentBanner";
import { TrackingPageView } from "@/components/tracking/TrackingPageView";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { TrackingScripts } from "@/components/tracking/TrackingScripts";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import {
  getBrandConfig,
  getSeoConfig,
  getThemeConfig,
  getTrackingConfig,
} from "@/services/configuration";
import type { PublicTrackingConfig } from "@/lib/tracking";
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
  const [theme, tracking] = await Promise.all([
    getThemeConfig(),
    getTrackingConfig(),
  ]);
  const themeCss = buildThemeCss(theme);
  const publicTrackingConfig: PublicTrackingConfig = {
    enabled: tracking.enabled,
    consentRequired: tracking.consentRequired,
    meta: {
      enabled: tracking.meta.enabled,
      pixelId: tracking.meta.pixelId,
    },
    ga4: {
      enabled: tracking.ga4.enabled,
      measurementId: tracking.ga4.measurementId,
    },
    gtm: {
      enabled: tracking.gtm.enabled,
      containerId: tracking.gtm.containerId,
    },
    events: {
      PageView: tracking.events.PageView,
      LeadStarted: tracking.events.LeadStarted,
      LeadSubmitted: tracking.events.LeadSubmitted,
      QuizStarted: tracking.events.QuizStarted,
      QuizCompleted: tracking.events.QuizCompleted,
      QualifiedLead: tracking.events.QualifiedLead,
      ResultViewed: tracking.events.ResultViewed,
      WhatsAppClick: tracking.events.WhatsAppClick,
    },
  };

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
        <TrackingProvider config={publicTrackingConfig}>
          <TrackingScripts />
          <TrackingPageView />
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
          <TrackingConsentBanner />
        </TrackingProvider>
      </body>
    </html>
  );
}
