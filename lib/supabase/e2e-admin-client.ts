import { randomUUID } from "node:crypto";

type Row = Record<string, unknown>;
type TableName =
  | "tenants"
  | "tenant_domains"
  | "tenant_tracking_configs"
  | "tenant_secrets"
  | "tenant_memberships"
  | "quiz_templates"
  | "quiz_template_questions"
  | "quiz_template_rules"
  | "quiz_template_versions"
  | "leads"
  | "lead_notes"
  | "lead_status_history"
  | "office_audit_logs"
  | "quiz_sessions"
  | "quiz_answers"
  | "quiz_results"
  | "tracking_events"
  | "notification_logs"
  | "external_tracking_deliveries";

const now = () => new Date().toISOString();
const DEFAULT_TENANT_ID = "00000000-0000-4000-8000-000000000001";
const SECOND_TENANT_ID = "00000000-0000-4000-8000-000000000002";
const INACTIVE_TENANT_ID = "00000000-0000-4000-8000-000000000003";
const DEFAULT_TIMESTAMP = "2026-07-14T00:00:00.000Z";
const DEFAULT_LEAD_ID = "00000000-0000-4000-8000-000000001001";
const SECOND_LEAD_ID = "00000000-0000-4000-8000-000000002001";
const DEFAULT_SESSION_ID = "00000000-0000-4000-8000-000000001101";
const DEFAULT_RESULT_ID = "00000000-0000-4000-8000-000000001201";
const GENERAL_TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";
const MATERNITY_TEMPLATE_ID = "22222222-2222-4222-8222-222222222222";
const E2E_ADMIN_USER_ID = "00000000-0000-4000-8000-000000000901";
const E2E_MANAGER_USER_ID = "00000000-0000-4000-8000-000000000902";
const E2E_AGENT_USER_ID = "00000000-0000-4000-8000-000000000903";
const E2E_VIEWER_USER_ID = "00000000-0000-4000-8000-000000000904";
const E2E_SUSPENDED_USER_ID = "00000000-0000-4000-8000-000000000905";
const E2E_ADMIN_B_USER_ID = "00000000-0000-4000-8000-000000000906";
const E2E_INACTIVE_TENANT_USER_ID = "00000000-0000-4000-8000-000000000907";

const store: Record<TableName, Row[]> = {
  tenants: [],
  tenant_domains: [],
  tenant_tracking_configs: [],
  tenant_secrets: [],
  tenant_memberships: [],
  quiz_templates: [],
  quiz_template_questions: [],
  quiz_template_rules: [],
  quiz_template_versions: [],
  leads: [],
  lead_notes: [],
  lead_status_history: [],
  office_audit_logs: [],
  quiz_sessions: [],
  quiz_answers: [],
  quiz_results: [],
  tracking_events: [],
  notification_logs: [],
  external_tracking_deliveries: [],
};

function createDefaultTenantRows(): void {
  if (!store.tenants.length) {
    store.tenants.push(
      {
        id: DEFAULT_TENANT_ID,
        slug: "resende-advogados",
        name: "Resende Advogados Associados",
        legal_name: "Resende Advogados Associados",
        status: "active",
        is_default: true,
        timezone: "America/Bahia",
        locale: "pt-BR",
        metadata: {},
        created_at: DEFAULT_TIMESTAMP,
        updated_at: DEFAULT_TIMESTAMP,
      },
      {
        id: SECOND_TENANT_ID,
        slug: "tenant-b",
        name: "Tenant B",
        legal_name: "Tenant B",
        status: "active",
        is_default: false,
        timezone: "America/Bahia",
        locale: "pt-BR",
        metadata: {},
        created_at: DEFAULT_TIMESTAMP,
        updated_at: DEFAULT_TIMESTAMP,
      },
      {
        id: INACTIVE_TENANT_ID,
        slug: "tenant-inativo",
        name: "Tenant Inativo",
        legal_name: "Tenant Inativo",
        status: "inactive",
        is_default: false,
        timezone: "America/Bahia",
        locale: "pt-BR",
        metadata: {},
        created_at: DEFAULT_TIMESTAMP,
        updated_at: DEFAULT_TIMESTAMP,
      },
    );
  }

  if (!store.tenant_domains.length) {
    store.tenant_domains.push(
      {
        id: "00000000-0000-4000-8000-000000000101",
        tenant_id: DEFAULT_TENANT_ID,
        hostname: "radarprevidenciario.com.br",
        is_primary: true,
        status: "active",
        metadata: {},
        created_at: DEFAULT_TIMESTAMP,
        updated_at: DEFAULT_TIMESTAMP,
      },
      {
        id: "00000000-0000-4000-8000-000000000102",
        tenant_id: DEFAULT_TENANT_ID,
        hostname: "radar-previdenciario.vercel.app",
        is_primary: false,
        status: "active",
        metadata: {},
        created_at: DEFAULT_TIMESTAMP,
        updated_at: DEFAULT_TIMESTAMP,
      },
    );
  }

  if (!store.tenant_tracking_configs.length) {
    const enabled = process.env.NEXT_PUBLIC_TRACKING_ENABLED === "true";
    const gtmContainerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || null;
    const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || null;
    const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || null;

    store.tenant_tracking_configs.push({
      id: "00000000-0000-4000-8000-000000000201",
      tenant_id: DEFAULT_TENANT_ID,
      enabled,
      consent_required:
        process.env.NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED !== "false",
      external_tracking_dry_run: true,
      meta_enabled: enabled && Boolean(metaPixelId),
      meta_pixel_id: metaPixelId,
      meta_api_version: process.env.META_CONVERSIONS_API_VERSION || "v25.0",
      meta_test_mode: process.env.META_TRACKING_TEST_MODE === "true",
      ga4_enabled: enabled && Boolean(ga4MeasurementId) && !gtmContainerId,
      ga4_measurement_id: ga4MeasurementId,
      gtm_enabled: enabled && Boolean(gtmContainerId),
      gtm_container_id: gtmContainerId,
      event_config: {},
      created_at: DEFAULT_TIMESTAMP,
      updated_at: DEFAULT_TIMESTAMP,
    });
  }

  if (!store.tenant_memberships.length) {
    store.tenant_memberships.push(
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000911",
        tenant_id: DEFAULT_TENANT_ID,
        user_id: E2E_ADMIN_USER_ID,
        role: "admin",
        status: "active",
        display_name: "Admin E2E",
        job_title: "Administrador",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000912",
        tenant_id: DEFAULT_TENANT_ID,
        user_id: E2E_MANAGER_USER_ID,
        role: "manager",
        status: "active",
        display_name: "Manager E2E",
        job_title: "Gestora",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000913",
        tenant_id: DEFAULT_TENANT_ID,
        user_id: E2E_AGENT_USER_ID,
        role: "agent",
        status: "active",
        display_name: "Agent E2E",
        job_title: "Atendimento",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000914",
        tenant_id: DEFAULT_TENANT_ID,
        user_id: E2E_VIEWER_USER_ID,
        role: "viewer",
        status: "active",
        display_name: "Viewer E2E",
        job_title: "Leitura",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000915",
        tenant_id: DEFAULT_TENANT_ID,
        user_id: E2E_SUSPENDED_USER_ID,
        role: "agent",
        status: "suspended",
        display_name: "Suspenso E2E",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000916",
        tenant_id: SECOND_TENANT_ID,
        user_id: E2E_ADMIN_B_USER_ID,
        role: "admin",
        status: "active",
        display_name: "Admin Tenant B",
        is_default: true,
      }),
      createRow("tenant_memberships", {
        id: "00000000-0000-4000-8000-000000000917",
        tenant_id: INACTIVE_TENANT_ID,
        user_id: E2E_INACTIVE_TENANT_USER_ID,
        role: "admin",
        status: "active",
        display_name: "Admin Tenant Inativo",
        is_default: true,
      }),
    );
  }

  if (!store.quiz_templates.length) {
    store.quiz_templates.push(
      createRow("quiz_templates", {
        id: GENERAL_TEMPLATE_ID,
        tenant_id: null,
        slug: "geral",
        name: "Triagem previdenciária geral",
        description: "Template geral de triagem informativa.",
        category: "previdenciario",
        audience: "leads",
        source: "platform",
        ownership: "platform_managed",
        status: "active",
        template_type: "general",
        version: 1,
        is_default: true,
        metadata: {},
        created_by_user_id: null,
        updated_at: DEFAULT_TIMESTAMP,
      }),
      createRow("quiz_templates", {
        id: MATERNITY_TEMPLATE_ID,
        tenant_id: null,
        slug: "salario-maternidade",
        name: "Triagem de salário-maternidade",
        description: "Template temático de salário-maternidade.",
        category: "previdenciario",
        audience: "leads",
        source: "platform",
        ownership: "platform_managed",
        status: "active",
        template_type: "maternity",
        version: 1,
        is_default: false,
        metadata: {},
        created_by_user_id: null,
        updated_at: DEFAULT_TIMESTAMP,
      }),
    );
  }

  if (!store.quiz_template_questions.length) {
    store.quiz_template_questions.push(
      createRow("quiz_template_questions", {
        quiz_template_id: GENERAL_TEMPLATE_ID,
        question_key: "benefit-interest",
        title: "Qual benefício deseja analisar?",
        question_type: "radio",
        description: null,
        is_required: true,
        is_sensitive: false,
        allows_unknown: true,
        allows_withheld: true,
        display_order: 1,
        options: [{ value: "aposentadoria", label: "Aposentadoria" }],
        conditions: {},
        metadata: {},
        updated_at: DEFAULT_TIMESTAMP,
      }),
      createRow("quiz_template_questions", {
        quiz_template_id: MATERNITY_TEMPLATE_ID,
        question_key: "maternity-related-situation",
        title: "Qual situação deseja analisar?",
        question_type: "radio",
        description: null,
        is_required: true,
        is_sensitive: false,
        allows_unknown: true,
        allows_withheld: true,
        display_order: 1,
        options: [{ value: "birth", label: "Nascimento" }],
        conditions: {},
        metadata: {},
        updated_at: DEFAULT_TIMESTAMP,
      }),
    );
  }

  if (!store.quiz_template_rules.length) {
    store.quiz_template_rules.push(
      createRow("quiz_template_rules", {
        quiz_template_id: GENERAL_TEMPLATE_ID,
        rule_key: "general-topic",
        rule_type: "topic",
        status: "active",
        priority: 1,
        conditions: [],
        effects: {},
        updated_at: DEFAULT_TIMESTAMP,
      }),
    );
  }

  if (!store.quiz_template_versions.length) {
    store.quiz_template_versions.push(
      createRow("quiz_template_versions", {
        quiz_template_id: GENERAL_TEMPLATE_ID,
        version: 1,
        status: "active",
        snapshot: { questions: 1, rules: 1 },
        created_by_user_id: null,
      }),
    );
  }

  if (!store.leads.length) {
    store.leads.push(
      createRow("leads", {
        id: DEFAULT_LEAD_ID,
        tenant_id: DEFAULT_TENANT_ID,
        full_name: "Maria Lead E2E",
        email: "maria.lead@example.com",
        phone: "5571999991111",
        status: "new",
        utm_source: "meta",
        utm_medium: "paid_social",
        utm_campaign: "painel_e2e",
        utm_content: "criativo_01",
        utm_term: null,
        campaign_id: "123",
        adset_id: "456",
        ad_id: "789",
        placement: "instagram_stories",
        referrer: "https://example.com/campanha",
        landing_page: "/cadastro",
      }),
      createRow("leads", {
        id: SECOND_LEAD_ID,
        tenant_id: SECOND_TENANT_ID,
        full_name: "Lead Tenant B",
        email: "lead-b@example.com",
        phone: "5571888882222",
        status: "contacted",
        utm_source: "google",
        utm_campaign: "tenant_b",
      }),
    );
  }

  if (!store.quiz_sessions.length) {
    store.quiz_sessions.push(
      createRow("quiz_sessions", {
        id: DEFAULT_SESSION_ID,
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        quiz_template_id: GENERAL_TEMPLATE_ID,
        quiz_template_version: 1,
        template_type: "general",
        status: "completed",
        completed_at: DEFAULT_TIMESTAMP,
      }),
    );
  }

  if (!store.quiz_answers.length) {
    store.quiz_answers.push(
      createRow("quiz_answers", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        session_id: DEFAULT_SESSION_ID,
        question_id: "benefit-interest",
        question_label: "Qual benefício deseja analisar?",
        answer_value: "aposentadoria",
        answer_label: "Aposentadoria",
        benefit_context: "retirement",
      }),
      createRow("quiz_answers", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        session_id: DEFAULT_SESSION_ID,
        question_id: "contribution-years",
        question_label: "Tempo aproximado de contribuição",
        answer_value: "20",
        answer_label: "20 anos",
        benefit_context: "retirement",
      }),
    );
  }

  if (!store.quiz_results.length) {
    store.quiz_results.push(
      createRow("quiz_results", {
        id: DEFAULT_RESULT_ID,
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        session_id: DEFAULT_SESSION_ID,
        quiz_template_id: GENERAL_TEMPLATE_ID,
        quiz_template_version: 1,
        template_type: "general",
        topic: "Aposentadoria",
        potential_benefit: "Aposentadoria",
        score: 82,
        classification: "alto_potencial",
        data_completeness: "complete",
        missing_critical_answers: [],
        requires_human_review: false,
        matched_rules: [{ benefitSlug: "retirement" }],
        summary:
          "Foram identificados indícios que recomendam análise previdenciária individual.",
        ethical_disclaimer:
          "Resultado informativo. Não substitui avaliação jurídica individual.",
      }),
    );
  }

  if (!store.tracking_events.length) {
    store.tracking_events.push(
      createRow("tracking_events", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        session_id: DEFAULT_SESSION_ID,
        event_name: "LeadSubmitted",
        event_payload: { source: "e2e" },
      }),
      createRow("tracking_events", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        session_id: DEFAULT_SESSION_ID,
        event_name: "QuizCompleted",
        event_payload: { source: "e2e" },
      }),
    );
  }

  if (!store.notification_logs.length) {
    store.notification_logs.push(
      createRow("notification_logs", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        result_id: DEFAULT_RESULT_ID,
        notification_type: "lead_qualified",
        recipient: "escritorio@example.com",
        provider: "email",
        priority: "high",
        status: "sent",
        attempt: 1,
        sent_at: DEFAULT_TIMESTAMP,
      }),
      createRow("notification_logs", {
        tenant_id: DEFAULT_TENANT_ID,
        lead_id: DEFAULT_LEAD_ID,
        result_id: DEFAULT_RESULT_ID,
        notification_type: "lead_qualified",
        recipient: "escritorio@example.com",
        provider: "email",
        priority: "medium",
        status: "failed",
        attempt: 2,
        failed_at: DEFAULT_TIMESTAMP,
        last_error: "Provider rejected request",
      }),
    );
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createRow(table: TableName, row: Row): Row {
  const timestamp = now();
  const id = typeof row.id === "string" ? row.id : randomUUID();

  if (table === "quiz_sessions") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
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
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
      status: "new",
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  if (table === "notification_logs") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
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

  if (table === "tenant_memberships") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
      role: "agent",
      status: "active",
      display_name: null,
      job_title: null,
      is_default: false,
      last_access_at: null,
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  if (table === "lead_notes") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
      created_at: timestamp,
      updated_at: timestamp,
      ...row,
    };
  }

  if (table === "lead_status_history" || table === "office_audit_logs") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
      created_at: timestamp,
      metadata: {},
      ...row,
    };
  }

  if (table === "external_tracking_deliveries") {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
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

  if (
    table === "quiz_answers" ||
    table === "quiz_results" ||
    table === "tracking_events"
  ) {
    return {
      id,
      tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
      created_at: timestamp,
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
  private rangeBounds?: { from: number; to: number };
  private shouldDelete = false;

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

  delete() {
    this.shouldDelete = true;
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

  lte(column: string, value: unknown) {
    this.filters.push((row) => String(row[column] ?? "") <= String(value));
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  ilike(column: string, value: string) {
    const needle = value.replace(/%/g, "").toLowerCase();

    this.filters.push((row) =>
      String(row[column] ?? "")
        .toLowerCase()
        .includes(needle),
    );

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

  range(from: number, to: number) {
    this.rangeBounds = { from, to };
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
          updated_at:
            this.table === "quiz_sessions" ||
            this.table === "leads" ||
            this.table === "lead_notes" ||
            this.table === "tenant_memberships"
              ? now()
              : row.updated_at,
        });
      });

      return {
        data: clone(projectRows(rows, this.columns)),
        error: null,
      };
    }

    if (this.shouldDelete) {
      const rows = store[this.table].filter((row) =>
        this.filters.every((filter) => filter(row)),
      );

      store[this.table] = store[this.table].filter(
        (row) => !this.filters.every((filter) => filter(row)),
      );

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

    if (this.rangeBounds) {
      rows = rows.slice(this.rangeBounds.from, this.rangeBounds.to + 1);
    }

    return {
      data: clone(projectRows(rows, this.columns)),
      error: null,
    };
  }
}

export function createSupabaseE2EAdminClient() {
  createDefaultTenantRows();

  return {
    from(table: TableName) {
      return new QueryBuilder(table);
    },
  };
}
