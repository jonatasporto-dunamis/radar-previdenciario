import "server-only";

export type IntegrationSecretPresence = {
  hasAnySecret: boolean;
  hasAccessToken: boolean;
  hasTestEventCode: boolean;
};

const canonicalSecretAliases: Record<string, string[]> = {
  accessToken: [
    "accessToken",
    "metaConversionsApiAccessToken",
    "meta_conversions_api_access_token",
  ],
  testEventCode: [
    "testEventCode",
    "metaTestEventCode",
    "test_event_code",
    "meta_test_event_code",
  ],
};

const aliasToCanonical = Object.entries(canonicalSecretAliases).reduce<
  Record<string, string>
>((acc, [canonicalKey, aliases]) => {
  aliases.forEach((alias) => {
    acc[alias] = canonicalKey;
  });

  return acc;
}, {});

export function normalizeIntegrationSecretPayload(
  payload: unknown,
): Record<string, string> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return Object.entries(payload as Record<string, unknown>).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    if (typeof value !== "string") {
      return acc;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return acc;
    }

    acc[aliasToCanonical[key] ?? key] = trimmedValue;
    return acc;
  }, {});
}

export function getIntegrationSecretPresence(
  payload: Record<string, string>,
): IntegrationSecretPresence {
  return {
    hasAnySecret: Object.keys(payload).length > 0,
    hasAccessToken: Boolean(payload.accessToken),
    hasTestEventCode: Boolean(payload.testEventCode),
  };
}
