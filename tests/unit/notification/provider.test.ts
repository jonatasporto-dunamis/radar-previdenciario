import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResendProvider } from "@/services/notification/providers";
import type { OfficeConfig } from "@/types/brand";

const providerInput = {
  subject: "Novo lead qualificado — Radar Previdenciário",
  html: "<p>Lead</p>",
  text: "Lead",
  payloadHash:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  priority: "high" as const,
  idempotencyKey:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

const officeConfig: OfficeConfig = {
  responsibleLawyer: "Responsavel",
  oab: "OAB/UF 000000",
  specialties: ["Direito Previdenciario"],
  citiesServed: ["Cidade"],
  statesServed: ["UF"],
  serviceMode: "Remoto",
  workingHours: "9h as 18h",
  whatsappDefaultMessage: "Mensagem",
  email: {
    fromName: "Radar Previdenciario",
    fromAddress: "no-reply@example.com",
    replyTo: "reply@example.com",
    notificationEmail: "office@example.com",
  },
};

describe("ResendProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.OFFICE_NOTIFICATION_EMAIL;
  });

  it("valida configuracao em dry-run sem exigir chamada externa", async () => {
    const provider = new ResendProvider({
      dryRun: true,
      apiKey: null,
      loadOfficeConfig: async () => officeConfig,
    });

    await expect(provider.validate()).resolves.toEqual({
      ok: true,
      provider: "email",
    });
  });

  it("envia via Resend com chave encapsulada no provider", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
      }),
    );
    const provider = new ResendProvider({
      dryRun: false,
      apiKey: "resend-secret",
      fetcher,
      loadOfficeConfig: async () => officeConfig,
    });

    await expect(provider.send(providerInput)).resolves.toEqual({
      ok: true,
      providerMessageId: "email_123",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Idempotency-Key": providerInput.idempotencyKey,
        }),
      }),
    );
    expect(
      JSON.parse(fetcher.mock.calls[0]?.[1]?.body as string),
    ).toMatchObject({
      from: "Radar Previdenciario <no-reply@example.com>",
      to: ["office@example.com"],
      reply_to: "reply@example.com",
    });
  });

  it("monta identidade de email a partir de getOfficeConfig", async () => {
    process.env.OFFICE_NOTIFICATION_EMAIL = "office@example.com";
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
      }),
    );
    const provider = new ResendProvider({
      dryRun: false,
      apiKey: "resend-secret",
      fetcher,
    });

    await expect(provider.send(providerInput)).resolves.toEqual({
      ok: true,
      providerMessageId: "email_123",
    });
    expect(
      JSON.parse(fetcher.mock.calls[0]?.[1]?.body as string),
    ).toMatchObject({
      from: "Resende Advogados Associados <contato@mail.radarprevidenciario.com.br>",
      to: ["office@example.com"],
      reply_to: "contato@resendeadvogados.com.br",
      subject: providerInput.subject,
      html: providerInput.html,
      text: providerInput.text,
    });
  });

  it("marca erro 5xx como temporario para retry", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("service unavailable", {
        status: 503,
      }),
    );
    const provider = new ResendProvider({
      dryRun: false,
      apiKey: "resend-secret",
      fetcher,
      loadOfficeConfig: async () => officeConfig,
    });

    await expect(provider.send(providerInput)).resolves.toMatchObject({
      ok: false,
      temporary: true,
    });
  });

  it("falha validacao quando a configuracao de email do escritorio esta incompleta", async () => {
    const provider = new ResendProvider({
      dryRun: true,
      apiKey: null,
      loadOfficeConfig: async () => ({
        ...officeConfig,
        email: {
          ...officeConfig.email,
          fromAddress: "",
        },
      }),
    });

    await expect(provider.validate()).resolves.toMatchObject({
      ok: false,
      reason: "Office email configuration is incomplete.",
    });
  });
});
