import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantContext, getTenantSiteUrl } from "@/services/tenants";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const tenantContext = await getTenantContext({
    hostname:
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  });
  const siteUrl = await getTenantSiteUrl(tenantContext);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
