import type { MetadataRoute } from "next";
import { getBrandConfig } from "@/services/configuration";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await getBrandConfig();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    brand.website ||
    "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
