import { vi } from "vitest";

export function mockSupabase() {
  let queryResult: unknown = { data: [], error: null };
  const maybeSingle = vi.fn();
  const single = vi.fn();
  const select = vi.fn(() => builder);
  const insert = vi.fn(() => builder);
  const update = vi.fn(() => builder);
  const upsert = vi.fn(() => builder);
  const eq = vi.fn(() => builder);
  const gte = vi.fn(() => builder);
  const order = vi.fn(() => builder);
  const limit = vi.fn(() => builder);
  const contains = vi.fn(() => builder);
  const filter = vi.fn(() => builder);
  const setQueryResult = (result: unknown) => {
    queryResult = result;
  };

  const builder = {
    select,
    insert,
    update,
    upsert,
    eq,
    gte,
    order,
    limit,
    contains,
    filter,
    maybeSingle,
    single,
    then: vi.fn((onfulfilled, onrejected) =>
      Promise.resolve(queryResult).then(onfulfilled, onrejected),
    ),
  };

  const from = vi.fn(() => builder);

  return {
    client: { from },
    builder,
    from,
    select,
    insert,
    update,
    upsert,
    eq,
    gte,
    order,
    limit,
    contains,
    filter,
    maybeSingle,
    single,
    setQueryResult,
  };
}
