"use client";

import { useEffect } from "react";

export function SecretFieldsReset({
  fieldNames,
  resetKey,
}: {
  fieldNames: readonly string[];
  resetKey: string;
}) {
  useEffect(() => {
    const fields = new Set(fieldNames);

    document
      .querySelectorAll<HTMLInputElement>('input[type="password"]')
      .forEach((input) => {
        if (fields.has(input.name)) {
          input.value = "";
        }
      });
  }, [fieldNames, resetKey]);

  return null;
}
