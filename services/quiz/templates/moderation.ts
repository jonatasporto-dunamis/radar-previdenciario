import type { ModerationResult } from "@/types/quiz";

const blockedTerms = [
  "direito garantido",
  "benefício garantido",
  "beneficio garantido",
  "causa ganha",
  "será aprovado",
  "sera aprovado",
  "você tem direito",
  "voce tem direito",
  "chance de êxito",
  "chance de exito",
  "receba agora",
  "não perca seu direito",
  "nao perca seu direito",
  "valor garantido",
  "indenização certa",
  "indenizacao certa",
  "resultado garantido",
];

const warningTerms = [
  "consulta grátis",
  "consulta gratis",
  "análise gratuita",
  "analise gratuita",
];

const neutralContextTerms = [
  "não prometa",
  "nao prometa",
  "evite",
  "não use",
  "nao use",
  "não confirma",
  "nao confirma",
  "não constitui",
  "nao constitui",
  "não é",
  "nao e",
  "não significa",
  "nao significa",
  "sem promessa",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function hasNeutralContext(normalizedText: string, index: number): boolean {
  const contextStart = Math.max(0, index - 80);
  const context = normalizedText.slice(contextStart, index + 80);

  return neutralContextTerms.some((term) => context.includes(normalize(term)));
}

export function moderateCustomQuizContent(value: string): ModerationResult {
  const normalizedText = normalize(value);
  const matches: ModerationResult["matches"] = [];

  for (const term of blockedTerms) {
    const normalizedTerm = normalize(term);
    const index = normalizedText.indexOf(normalizedTerm);

    if (index >= 0 && !hasNeutralContext(normalizedText, index)) {
      matches.push({ term, level: "blocked" });
    }
  }

  for (const term of warningTerms) {
    const normalizedTerm = normalize(term);
    const index = normalizedText.indexOf(normalizedTerm);

    if (index >= 0 && !hasNeutralContext(normalizedText, index)) {
      matches.push({ term, level: "warning" });
    }
  }

  if (matches.some((match) => match.level === "blocked")) {
    return { level: "blocked", matches };
  }

  if (matches.length > 0) {
    return { level: "warning", matches };
  }

  return { level: "allowed", matches: [] };
}
