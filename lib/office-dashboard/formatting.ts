export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bahia",
  }).format(new Date(value));
}

export function maskEmail(value: string | null | undefined): string {
  if (!value || !value.includes("@")) {
    return "Não informado";
  }

  const [name, domain] = value.split("@");
  const visibleName = name.slice(0, 2);
  const domainParts = domain.split(".");
  const domainStart = domainParts[0]?.slice(0, 2) ?? "";
  const suffix = domainParts.slice(1).join(".");

  return `${visibleName}***@${domainStart}***${suffix ? `.${suffix}` : ""}`;
}

export function maskPhone(value: string | null | undefined): string {
  if (!value) {
    return "Não informado";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return "***";
  }

  return `(**) *****-${digits.slice(-4)}`;
}

export function formatClassification(value: string | null | undefined): string {
  if (value === "alto_potencial") {
    return "Alto potencial";
  }

  if (value === "medio_potencial") {
    return "Médio potencial";
  }

  if (value === "baixo_potencial") {
    return "Baixo potencial";
  }

  return "Não classificado";
}

export function formatBoolean(value: boolean): string {
  return value ? "Sim" : "Não";
}
