import type { MetadataRoute } from "next";

const routes = [
  "/",
  "/cadastro",
  "/quiz",
  "/resultado",
  "/privacidade",
  "/termos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
