const BRAZIL_COUNTRY_CODE = "55";

export function normalizeBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length >= 12) {
    return digits;
  }

  return `${BRAZIL_COUNTRY_CODE}${digits}`;
}

export function isValidBrazilianPhone(value: string): boolean {
  const normalized = normalizeBrazilianPhone(value);
  const localNumber = normalized.startsWith(BRAZIL_COUNTRY_CODE)
    ? normalized.slice(BRAZIL_COUNTRY_CODE.length)
    : normalized;

  return localNumber.length === 10 || localNumber.length === 11;
}

export function formatBrazilianPhone(value: string): string {
  const rawDigits = value.replace(/\D/g, "");
  const digits = (
    rawDigits.startsWith(BRAZIL_COUNTRY_CODE) && rawDigits.length >= 12
      ? rawDigits.slice(BRAZIL_COUNTRY_CODE.length)
      : rawDigits
  ).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
