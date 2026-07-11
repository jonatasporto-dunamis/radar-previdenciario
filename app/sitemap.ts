import type { MetadataRoute } from "next";
import { getBrandConfig } from "@/services/configuration";

const routes = [
  "/",
  "/cadastro",
  "/quiz",
  "/resultado",
  "/privacidade",
  "/termos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = await getBrandConfig();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    brand.website ||
    "http://localhost:3000";

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
