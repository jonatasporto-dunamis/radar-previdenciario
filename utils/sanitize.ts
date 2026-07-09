export function sanitizePlainText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}
