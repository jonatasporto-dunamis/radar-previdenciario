type SupabaseSchemaErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

export function isMissingSchemaError(
  error: unknown,
  markers: string[],
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as SupabaseSchemaErrorLike;
  const code = candidate.code;
  const text = [candidate.message, candidate.details, candidate.hint, code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    code !== "42703" &&
    code !== "42P01" &&
    code !== "PGRST200" &&
    code !== "PGRST204" &&
    !text.includes("column") &&
    !text.includes("schema cache") &&
    !text.includes("relation")
  ) {
    return false;
  }

  return markers.some((marker) => text.includes(marker.toLowerCase()));
}
