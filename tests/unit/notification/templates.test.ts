import { describe, expect, it } from "vitest";
import { renderLeadNotificationEmail } from "@/services/notification/templates";
import type { LeadNotificationPayload } from "@/services/notification/pipeline/payload";

const payload: LeadNotificationPayload = {
  lead: {
    id: "22222222-2222-4222-8222-222222222222",
    fullName: "Maria Silva",
    phone: "+55 (71) 98153-3737",
    email: "maria@example.com",
  },
  result: {
    id: "33333333-3333-4333-8333-333333333333",
    benefit: "BPC/LOAS",
    classification: "alto_potencial",
    score: 88,
    summary: "Resumo preliminar.",
  },
  answers: [
    {
      questionId: "age",
      question: "Qual sua idade?",
      answer: "67",
      benefitContext: "bpc",
    },
  ],
  attribution: {
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "teste_bpc",
    utmContent: "criativo_01",
    campaignId: "123",
    adsetId: "456",
    adId: "789",
    placement: "instagram_stories",
    referrer: null,
    landingPage: "/cadastro",
  },
  generatedAt: "2026-07-12T12:10:00.000Z",
  whatsappUrl: "https://wa.me/5571981533737?text=Ol%C3%A1%21%0A%0ALead",
  qualification: {
    classification: "alto_potencial",
    priority: "high",
    shouldNotify: true,
    reason: "Lead classificado com alto potencial preliminar.",
    providers: ["email"],
  },
};

describe("lead notification templates", () => {
  it("renderiza template de alto potencial com dados essenciais", async () => {
    const rendered = renderLeadNotificationEmail({
      template: "lead-qualified",
      payload,
    });

    await expect(rendered).resolves.toMatchObject({
      text: expect.stringContaining("UTM Source: meta"),
    });
    await expect(rendered).resolves.toMatchObject({
      html: expect.stringContaining("Maria Silva"),
    });
    await expect(rendered).resolves.toMatchObject({
      html: expect.stringContaining("Conversar pelo WhatsApp"),
    });
    await expect(rendered).resolves.toMatchObject({
      text: expect.stringContaining("BPC/LOAS"),
    });
  });

  it("renderiza template de medio potencial", async () => {
    const rendered = await renderLeadNotificationEmail({
      template: "lead-medium",
      payload: {
        ...payload,
        result: {
          ...payload.result,
          classification: "medio_potencial",
          score: 52,
        },
      },
    });

    expect(rendered.html).toContain("Novo lead de medio potencial");
    expect(rendered.text).toContain("Score interno: 52");
  });
});
