import { randomUUID } from "node:crypto";

type Row = Record<string, unknown>;
type TableName =
  | "leads"
  | "quiz_sessions"
  | "quiz_answers"
  | "quiz_results"
  | "tracking_events"
  | "notification_logs"
  | "external_tracking_deliveries";

const now = () => new Date().toISOString();

const store: Record<TableName, Row[]> = {
  leads: [],
  quiz_sessions: [],
  quiz_answers: [],
  quiz_results: [],
  tracking_events: [],
  notification_logs: [],
  external_tracking_deliveries: [],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createRow(table: TableName, row: Row): Row {
  const timestamp = now();
  const id = typeof row.id === "string" ? row.id : randomUUID();

  if (table === "quiz_sessions") {
    return {
      id,
      status: "started",
      started_at: timestamp,
      completed_at: null,
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  if (table === "leads") {
    return {
      id,
      status: "new",
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  if (table === "notification_logs") {
    return {
      id,
      provider: "email",
      priority: "medium",
      status: "pending",
      attempt: 0,
      queued_at: null,
      processing_started_at: null,
      sent_at: null,
      failed_at: null,
      error_message: null,
      last_error: null,
      created_at: timestamp,
      ...row,
    };
  }

  if (table === "external_tracking_deliveries") {
    return {
      id,
      status: "pending",
      attempt: 0,
      test_event: false,
      queued_at: null,
      processing_started_at: null,
      sent_at: null,
      failed_at: null,
      last_error: null,
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  return {
    id,
    created_at: timestamp,
    ...row,
  };
}

function projectRows(rows: Row[], columns: string | undefined): Row[] {
  if (!columns || columns === "*") {
    return rows;
  }

  const selectedColumns = columns
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);

  return rows.map((row) =>
    selectedColumns.reduce<Row>((acc, column) => {
      acc[column] = row[column];
      return acc;
    }, {}),
  );
}

function matchesJsonContains(rowValue: unknown, expected: Row): boolean {
  if (!rowValue || typeof rowValue !== "object" || Array.isArray(rowValue)) {
    return false;
  }

  return Object.entries(expected).every(
    ([key, value]) => (rowValue as Row)[key] === value,
  );
}

class QueryBuilder {
  private columns?: string;
  private filters: Array<(row: Row) => boolean> = [];
  private sortBy?: { column: string; ascending: boolean };
  private maxRows?: number;
  private insertRows?: Row[];
  private updateValues?: Row;
  private upsertRows?: Row[];
  private onConflict?: string;

  constructor(private table: TableName) {}

  select(columns = "*") {
    this.columns = columns;
    return this;
  }

  insert(values: Row | Row[]) {
    this.insertRows = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: Row) {
    this.updateValues = values;
    return this;
  }

  upsert(values: Row | Row[], options?: { onConflict?: string }) {
    this.upsertRows = Array.isArray(values) ? values : [values];
    this.onConflict = options?.onConflict;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push((row) => String(row[column] ?? "") >= String(value));
    return this;
  }

  contains(column: string, value: Row) {
    this.filters.push((row) => matchesJsonContains(row[column], value));
    return this;
  }

  filter(column: string, operator: string, value: unknown) {
    if (column.includes("->>") && operator === "eq") {
      const [jsonColumn, key] = column.split("->>");

      this.filters.push((row) => {
        const jsonValue = row[jsonColumn];

        return (
          !!jsonValue &&
          typeof jsonValue === "object" &&
          !Array.isArray(jsonValue) &&
          (jsonValue as Row)[key] === value
        );
      });
    }

    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortBy = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number) {
    this.maxRows = count;
    return this;
  }

  async maybeSingle() {
    const { data, error } = await this.execute();

    return {
      data: data[0] ?? null,
      error,
    };
  }

  async single() {
    const { data, error } = await this.execute();

    return {
      data: data[0] ?? null,
      error,
    };
  }

  then<TResult1 = { data: Row[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: Row[];
          error: null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: Row[]; error: null }> {
    if (this.insertRows) {
      const rows = this.insertRows.map((row) => createRow(this.table, row));
      store[this.table].push(...rows);

      return {
        data: clone(projectRows(rows, this.columns)),
        error: null,
      };
    }

    if (this.upsertRows) {
      const rows = this.upsertRows.map((row) => {
        const conflictColumn = this.onConflict;
        const conflictColumns = conflictColumn
          ?.split(",")
          .map((column) => column.trim())
          .filter(Boolean);
        const existingIndex = conflictColumns?.length
          ? store[this.table].findIndex((item) =>
              conflictColumns.every((column) => item[column] === row[column]),
            )
          : -1;

        if (existingIndex >= 0) {
          store[this.table][existingIndex] = {
            ...store[this.table][existingIndex],
            ...row,
          };

          return store[this.table][existingIndex];
        }

        const created = createRow(this.table, row);
        store[this.table].push(created);

        return created;
      });

      return {
        data: clone(projectRows(rows, this.columns)),
        error: null,
      };
    }

    if (this.updateValues) {
      const rows = store[this.table].filter((row) =>
        this.filters.every((filter) => filter(row)),
      );

      rows.forEach((row) => {
        Object.assign(row, this.updateValues, {
          updated_at: this.table === "quiz_sessions" ? now() : row.updated_at,
        });
      });

      return {
        data: clone(projectRows(rows, this.columns)),
        error: null,
      };
    }

    let rows = store[this.table].filter((row) =>
      this.filters.every((filter) => filter(row)),
    );

    if (this.sortBy) {
      const { column, ascending } = this.sortBy;
      rows = [...rows].sort((a, b) => {
        const comparison = String(a[column] ?? "").localeCompare(
          String(b[column] ?? ""),
        );

        return ascending ? comparison : -comparison;
      });
    }

    if (typeof this.maxRows === "number") {
      rows = rows.slice(0, this.maxRows);
    }

    return {
      data: clone(projectRows(rows, this.columns)),
      error: null,
    };
  }
}

export function createSupabaseE2EAdminClient() {
  return {
    from(table: TableName) {
      return new QueryBuilder(table);
    },
  };
}
