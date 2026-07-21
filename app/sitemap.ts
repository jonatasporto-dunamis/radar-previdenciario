import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantContext, getTenantSiteUrl } from "@/services/tenants";

const routes = [
  "/",
  "/cadastro",
  "/quiz",
  "/resultado",
  "/privacidade",
  "/termos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const tenantContext = await getTenantContext({
    hostname:
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  });
  const siteUrl = await getTenantSiteUrl(tenantContext);

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
