import { DEVELOPMENT_HOSTNAMES } from "./constants";

export function normalizeHostname(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const [forwardedHost] = value.split(",");
  const trimmed = forwardedHost?.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const [withoutPath] = withoutProtocol.split("/");
  const withoutPort = withoutPath?.replace(/:\d+$/, "");

  return withoutPort || null;
}

export function isDevelopmentHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname);

  return normalized ? DEVELOPMENT_HOSTNAMES.has(normalized) : false;
}

export function isVercelPreviewHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname);

  return Boolean(normalized?.endsWith(".vercel.app"));
}
