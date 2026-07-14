import "server-only";
import { createHash } from "crypto";

export function normalizeMetaEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeMetaPhone(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function hashMetaValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashMetaUserValue(
  value: string | null | undefined,
): string | undefined {
  const normalized = (value ?? "").trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return hashMetaValue(normalized);
}

export function buildFbc(input: {
  fbclid?: string | null;
  eventTime: number;
}): string | undefined {
  const fbclid = input.fbclid?.trim();

  if (!fbclid || /[\s]/.test(fbclid)) {
    return undefined;
  }

  return `fb.1.${input.eventTime}.${fbclid}`;
}

export function readFbp(cookies?: string | null): string | undefined {
  if (!cookies) {
    return undefined;
  }

  const match = cookies.match(/(?:^|;\s*)_fbp=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : undefined;
}
