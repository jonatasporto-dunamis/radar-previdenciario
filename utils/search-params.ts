export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function buildPathWithSearchParams(
  path: string,
  searchParams?: SearchParamsRecord,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          params.append(key, item);
        }
      });

      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}
