import { vi } from "vitest";

type CookieValue = {
  value: string;
};

export function mockCookies(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    get: vi.fn((key: string): CookieValue | undefined => {
      const value = values.get(key);

      return value ? { value } : undefined;
    }),
    set: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    delete: vi.fn((key: string) => {
      values.delete(key);
    }),
    values,
  };
}

export function mockHeaders(initial: Record<string, string> = {}) {
  const values = new Map(
    Object.entries(initial).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    get: vi.fn((key: string) => values.get(key.toLowerCase()) ?? null),
  };
}

export function mockSearchParams(
  values: Record<string, string | null | undefined> = {},
) {
  const searchParams = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
}

export function mockServerAction<TInput, TResult>(
  handler: (input: TInput) => Promise<TResult>,
) {
  return vi.fn((input: TInput) => handler(input));
}
