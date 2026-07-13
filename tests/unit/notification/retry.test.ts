import { describe, expect, it, vi } from "vitest";
import {
  calculateRetryBackoffMs,
  NotificationDispatcher,
} from "@/services/notification/dispatcher";
import { createNotificationLogFixture } from "@/tests/fixtures";
import type { NotificationLogRow } from "@/services/notification/persistence";
import type { NotificationProvider } from "@/services/notification/providers";

const log = createNotificationLogFixture() as NotificationLogRow;
const providerInput = {
  to: "office@example.com",
  from: "Radar Previdenciario <onboarding@resend.dev>",
  subject: "Novo lead qualificado — Radar Previdenciário",
  html: "<p>Lead</p>",
  text: "Lead",
  payloadHash: log.payload_hash ?? "",
  priority: "high" as const,
  idempotencyKey: log.payload_hash ?? "",
};

describe("notification retry", () => {
  it("calcula backoff exponencial", () => {
    expect(calculateRetryBackoffMs(1, 250)).toBe(250);
    expect(calculateRetryBackoffMs(2, 250)).toBe(500);
    expect(calculateRetryBackoffMs(3, 250)).toBe(1000);
  });

  it("tenta novamente erros temporarios ate enviar", async () => {
    const provider: NotificationProvider = {
      id: "email",
      validate: vi.fn(),
      health: vi.fn(),
      send: vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          temporary: true,
          error: "timeout",
        })
        .mockResolvedValueOnce({
          ok: false,
          temporary: true,
          error: "timeout",
        })
        .mockResolvedValueOnce({
          ok: true,
          providerMessageId: "email_123",
        }),
    };
    const retrying = vi.fn().mockResolvedValue(log);
    const track = vi.fn().mockResolvedValue(undefined);
    const dispatcher = new NotificationDispatcher({
      delay: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(log),
      markRetrying: retrying,
      markFailed: vi.fn().mockResolvedValue(log),
      markSent: vi.fn().mockResolvedValue(log),
      track,
    });

    await expect(
      dispatcher.dispatch({
        log,
        provider,
        providerInput,
        sessionId: "44444444-4444-4444-8444-444444444444",
      }),
    ).resolves.toEqual({
      status: "sent",
      attempt: 3,
    });
    expect(provider.send).toHaveBeenCalledTimes(3);
    expect(retrying).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "NotificationSent",
      }),
    );
  });

  it("falha sem retry quando erro nao e temporario", async () => {
    const provider: NotificationProvider = {
      id: "email",
      validate: vi.fn(),
      health: vi.fn(),
      send: vi.fn().mockResolvedValue({
        ok: false,
        temporary: false,
        error: "invalid_request",
      }),
    };
    const failed = vi.fn().mockResolvedValue(log);
    const dispatcher = new NotificationDispatcher({
      delay: vi.fn().mockResolvedValue(undefined),
      markProcessing: vi.fn().mockResolvedValue(log),
      markRetrying: vi.fn().mockResolvedValue(log),
      markFailed: failed,
      markSent: vi.fn().mockResolvedValue(log),
      track: vi.fn().mockResolvedValue(undefined),
    });

    await expect(
      dispatcher.dispatch({
        log,
        provider,
        providerInput,
      }),
    ).resolves.toMatchObject({
      status: "failed",
      attempt: 1,
      error: "invalid_request",
    });
    expect(failed).toHaveBeenCalledOnce();
  });
});
