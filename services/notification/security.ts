export function maskEmail(email: string | null | undefined): string {
  if (!email) {
    return "";
  }

  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "[masked-email]";
  }

  const visible = name.slice(0, 2);

  return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 4) {
    return "****";
  }

  return `${"*".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-4)}`;
}

export function sanitizeErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown notification error.";

  return raw
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/key[_-]?[A-Za-z0-9._~+/=-]{12,}/gi, "key_[redacted]")
    .replace(/[A-Za-z0-9._~+/=-]{36,}/g, "[redacted]")
    .slice(0, 500);
}
