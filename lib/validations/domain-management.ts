import { z } from "zod";
import { normalizeHostname } from "@/lib/tenants";

export const PLATFORM_ROOT_DOMAIN = "radarprevidenciario.com.br";

export const reservedPlatformSubdomains = new Set([
  "www",
  "app",
  "api",
  "admin",
  "painel",
  "auth",
  "login",
  "mail",
  "email",
  "static",
  "assets",
  "cdn",
  "status",
  "support",
  "ajuda",
  "docs",
  "dev",
  "staging",
  "preview",
  "radarprevidenciario",
]);

export type DomainValidationResult =
  { success: true; hostname: string } | { success: false; message: string };

export function getPlatformRootDomain(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return PLATFORM_ROOT_DOMAIN;
  }

  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase();

    if (hostname === "localhost" || /^[0-9.]+$/.test(hostname)) {
      return PLATFORM_ROOT_DOMAIN;
    }

    return hostname;
  } catch {
    const hostname = normalizeHostname(siteUrl);

    if (!hostname || hostname === "localhost" || /^[0-9.]+$/.test(hostname)) {
      return PLATFORM_ROOT_DOMAIN;
    }

    return hostname;
  }
}

export function normalizeDashboardHostname(value: string): string | null {
  const raw = value.trim().toLowerCase();

  if (
    !raw ||
    raw.startsWith("*.") ||
    raw.includes("/") ||
    raw.includes("\\") ||
    raw.includes(":")
  ) {
    return null;
  }

  const hostname = normalizeHostname(raw);

  if (!hostname || hostname.startsWith("*.") || hostname.includes("..")) {
    return null;
  }

  return hostname;
}

export function validateCustomDomainHostname(
  value: string,
): DomainValidationResult {
  const hostname = normalizeDashboardHostname(value);

  if (!hostname) {
    return {
      success: false,
      message: "Informe apenas o hostname, sem protocolo, porta ou caminho.",
    };
  }

  if (
    !/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)
  ) {
    return {
      success: false,
      message: "Informe um domínio válido com pelo menos um ponto.",
    };
  }

  return { success: true, hostname };
}

export function validatePlatformSubdomainSlug(
  value: string,
): DomainValidationResult {
  const slug = value.trim().toLowerCase();

  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) {
    return {
      success: false,
      message: "Use de 3 a 40 caracteres, com letras, números e hífen no meio.",
    };
  }

  if (reservedPlatformSubdomains.has(slug)) {
    return {
      success: false,
      message: "Este subdomínio é reservado para a plataforma.",
    };
  }

  return {
    success: true,
    hostname: `${slug}.${getPlatformRootDomain()}`,
  };
}

export const requestTenantDomainSchema = z.discriminatedUnion("domainType", [
  z.object({
    domainType: z.literal("platform_subdomain"),
    subdomainSlug: z.string().min(1),
    customHostname: z.string().optional(),
  }),
  z.object({
    domainType: z.literal("custom_domain"),
    customHostname: z.string().min(1),
    subdomainSlug: z.string().optional(),
  }),
]);
