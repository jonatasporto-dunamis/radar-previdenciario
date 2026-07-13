import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResendProvider } from "@/services/notification/providers";

const providerInput = {
  to: "office@example.com",
  from: "Radar Previdenciario <onboarding@resend.dev>",
  subject: "Novo lead qualificado — Radar Previdenciário",
  html: "<p>Lead</p>",
  text: "Lead",
  payloadHash:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  priority: "high" as const,
  idempotencyKey:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

describe("ResendProvider", () => {
  beforeEach(() => {
    process.env.OFFICE_NOTIFICATION_EMAIL = "office@example.com";
  });

  it("valida configuracao em dry-run sem exigir chamada externa", async () => {
    const provider = new ResendProvider({ dryRun: true, apiKey: null });

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
    });

    await expect(provider.send(providerInput)).resolves.toMatchObject({
      ok: false,
      temporary: true,
    });
  });

  it("falha validacao sem OFFICE_NOTIFICATION_EMAIL", async () => {
    delete process.env.OFFICE_NOTIFICATION_EMAIL;

    const provider = new ResendProvider({ dryRun: true, apiKey: null });

    await expect(provider.validate()).resolves.toMatchObject({
      ok: false,
      reason: "OFFICE_NOTIFICATION_EMAIL is not configured.",
    });
  });
});
