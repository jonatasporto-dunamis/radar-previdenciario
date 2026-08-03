const repeatedDigits = /^(\d)\1+$/;

export function normalizeValidWhatsappNumber(value: string | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";

  if (
    !/^\d{10,15}$/.test(digits) ||
    repeatedDigits.test(digits) ||
    /(\d)\1{7,}$/.test(digits)
  ) {
    return "";
  }

  return digits;
}

export function formatTenantWhatsappMessage(
  message: string,
  officeName: string,
) {
  return message.replaceAll("{{officeName}}", officeName).trim();
}
