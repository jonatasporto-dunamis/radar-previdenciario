import "server-only";
import type {
  TenantDnsInstructions,
  TenantDomainSslStatus,
  TenantDomainStatus,
  TenantDomainType,
} from "@/types/tenants";

type VercelConfig = {
  token: string;
  projectId: string;
  teamId?: string;
};

export type DomainProvisioningResult = {
  status: TenantDomainStatus;
  sslStatus: TenantDomainSslStatus;
  providerDomainId: string | null;
  dnsInstructions: TenantDnsInstructions;
  lastError: string | null;
};

const defaultDnsInstructions: TenantDnsInstructions = {
  records: [],
  notes: [
    "Configure as credenciais server-side da Vercel para gerar as instruções oficiais de DNS.",
    "Não altere nameservers do domínio principal sem autorização explícita.",
  ],
};

function getVercelConfig(): VercelConfig | null {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return null;
  }

  return {
    token,
    projectId,
    teamId: process.env.VERCEL_TEAM_ID || undefined,
  };
}

function buildVercelUrl(config: VercelConfig, path: string): string {
  const url = new URL(`https://api.vercel.com${path}`);

  if (config.teamId) {
    url.searchParams.set("teamId", config.teamId);
  }

  return url.toString();
}

function sanitizeProviderError(value: unknown): string {
  if (!value) {
    return "Não foi possível concluir a operação no provedor.";
  }

  if (typeof value === "string") {
    return value.slice(0, 280);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.code;

    return typeof message === "string"
      ? message.slice(0, 280)
      : "O provedor retornou um erro sem detalhes seguros para exibição.";
  }

  return "O provedor retornou um erro inesperado.";
}

function parseVercelDnsInstructions(
  hostname: string,
  domainType: TenantDomainType,
  payload: Record<string, unknown>,
): TenantDnsInstructions {
  const verification = Array.isArray(payload.verification)
    ? payload.verification
    : [];
  const records = verification
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const type = String(record.type ?? "TXT").toUpperCase();
      const value = String(record.value ?? record.reason ?? "").trim();
      const name = String(record.domain ?? record.name ?? hostname).trim();

      if (!value || !["A", "AAAA", "CNAME", "TXT"].includes(type)) {
        return null;
      }

      return {
        type: type as "A" | "AAAA" | "CNAME" | "TXT",
        name,
        value,
        ttl: "Auto",
        status: String(record.status ?? "pending"),
        purpose: "verification",
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const notes = [
    domainType === "platform_subdomain"
      ? "Subdomínio da plataforma provisionado no projeto Vercel. Configure o DNS conforme a instrução retornada pelo provedor."
      : "Domínio personalizado adicionado ao projeto Vercel. Configure os registros abaixo no provedor DNS do cliente.",
  ];

  if (!records.length) {
    notes.push(
      "A Vercel não retornou registros específicos nesta etapa. Use o botão verificar para atualizar o diagnóstico.",
    );
  }

  return { records, notes };
}

async function readVercelResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

export function isDomainProviderConfigured(): boolean {
  return Boolean(getVercelConfig());
}

export async function provisionDomainOnProvider(input: {
  hostname: string;
  domainType: TenantDomainType;
}): Promise<DomainProvisioningResult> {
  const config = getVercelConfig();

  if (!config) {
    return {
      status: "awaiting_dns",
      sslStatus: "pending",
      providerDomainId: null,
      dnsInstructions: defaultDnsInstructions,
      lastError: "Credenciais da Vercel não configuradas na plataforma.",
    };
  }

  const response = await fetch(
    buildVercelUrl(config, `/v10/projects/${config.projectId}/domains`),
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: input.hostname }),
      cache: "no-store",
    },
  );
  const payload = await readVercelResponse(response);

  if (!response.ok && response.status !== 409) {
    return {
      status: "failed",
      sslStatus: "failed",
      providerDomainId: null,
      dnsInstructions: defaultDnsInstructions,
      lastError: sanitizeProviderError(payload),
    };
  }

  return {
    status: "awaiting_dns",
    sslStatus: "pending",
    providerDomainId:
      typeof payload.uid === "string"
        ? payload.uid
        : typeof payload.name === "string"
          ? payload.name
          : null,
    dnsInstructions: parseVercelDnsInstructions(
      input.hostname,
      input.domainType,
      payload,
    ),
    lastError:
      response.status === 409 ? "Domínio já existe no projeto Vercel." : null,
  };
}

export async function verifyDomainOnProvider(input: {
  hostname: string;
  domainType: TenantDomainType;
}): Promise<DomainProvisioningResult> {
  const config = getVercelConfig();

  if (!config) {
    return {
      status: "awaiting_dns",
      sslStatus: "pending",
      providerDomainId: null,
      dnsInstructions: defaultDnsInstructions,
      lastError: "Credenciais da Vercel não configuradas na plataforma.",
    };
  }

  const response = await fetch(
    buildVercelUrl(
      config,
      `/v9/projects/${config.projectId}/domains/${input.hostname}/verify`,
    ),
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
      },
      cache: "no-store",
    },
  );
  const payload = await readVercelResponse(response);

  if (!response.ok) {
    return {
      status: "awaiting_dns",
      sslStatus: "pending",
      providerDomainId: null,
      dnsInstructions: parseVercelDnsInstructions(
        input.hostname,
        input.domainType,
        payload,
      ),
      lastError: sanitizeProviderError(payload),
    };
  }

  return {
    status: "active",
    sslStatus: "active",
    providerDomainId:
      typeof payload.uid === "string"
        ? payload.uid
        : typeof payload.name === "string"
          ? payload.name
          : null,
    dnsInstructions: parseVercelDnsInstructions(
      input.hostname,
      input.domainType,
      payload,
    ),
    lastError: null,
  };
}
