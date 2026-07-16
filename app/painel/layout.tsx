import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel interno",
  description: "Área restrita do escritório.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OfficeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
