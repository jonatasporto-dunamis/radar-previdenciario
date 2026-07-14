import { describe, expect, it } from "vitest";
import {
  buildLeadNotificationPayload,
  buildLeadWhatsappUrl,
  computeNotificationPayloadHash,
} from "@/services/notification/pipeline/payload";
import { TEST_TENANT_ID } from "@/tests/fixtures";
import type { LeadQualification } from "@/services/qualification";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ResultRow = Database["public"]["Tables"]["quiz_results"]["Row"];

const lead: LeadRow = {
  id: "22222222-2222-4222-8222-222222222222",
  tenant_id: TEST_TENANT_ID,
  full_name: "Maria Silva",
  email: "maria@example.com",
  phone: "+55 (71) 98153-3737",
  utm_source: "meta",
  utm_medium: "paid_social",
  utm_campaign: "teste_bpc",
  utm_content: "criativo_01",
  utm_term: null,
  fbclid: null,
  gclid: null,
  campaign_id: "123",
  adset_id: "456",
  ad_id: "789",
  placement: "instagram_stories",
  site_source_name: null,
  referrer: "https://example.com",
  landing_page: "/cadastro",
  user_agent: "vitest",
  ip_address: "127.0.0.1",
  status: "new",
  created_at: "2026-07-12T12:00:00.000Z",
  updated_at: "2026-07-12T12:00:00.000Z",
};

const result: ResultRow = {
  id: "33333333-3333-4333-8333-333333333333",
  tenant_id: TEST_TENANT_ID,
  session_id: "44444444-4444-4444-8444-444444444444",
  lead_id: lead.id,
  potential_benefit: "BPC/LOAS",
  score: 88,
  classification: "alto_potencial",
  summary: "Resumo preliminar.",
  ethical_disclaimer: "Aviso.",
  created_at: "2026-07-12T12:05:00.000Z",
};

const qualification: LeadQualification = {
  classification: "alto_potencial",
  priority: "high",
  shouldNotify: true,
  reason: "Lead classificado com alto potencial preliminar.",
  providers: ["email"],
};

describe("notification payload", () => {
  it("monta payload com lead, resultado, respostas e atribuicao", () => {
    const payload = buildLeadNotificationPayload({
      lead,
      result,
      computedResult: {
        potentialBenefit: "BPC/LOAS",
        score: 88,
        classification: "alto_potencial",
        summary: "Resumo preliminar.",
        ethicalDisclaimer: "Aviso.",
        candidates: [],
      },
      answers: {
        age: {
          questionId: "age",
          questionLabel: "Qual sua idade?",
          answerValue: 67,
          answerLabel: "67",
          benefitContext: "bpc",
        },
      },
      qualification,
      generatedAt: "2026-07-12T12:10:00.000Z",
    });

    expect(payload.lead.fullName).toBe("Maria Silva");
    expect(payload.result.benefit).toBe("BPC/LOAS");
    expect(payload.answers).toEqual([
      {
        questionId: "age",
        question: "Qual sua idade?",
        answer: "67",
        benefitContext: "bpc",
      },
    ]);
    expect(payload.attribution).toMatchObject({
      utmSource: "meta",
      utmMedium: "paid_social",
      campaignId: "123",
      placement: "instagram_stories",
    });
    expect(payload.whatsappUrl).toContain("https://wa.me/5571981533737");
  });

  it("gera link de WhatsApp sem enviar mensagem automaticamente", () => {
    const url = buildLeadWhatsappUrl(lead);

    expect(url).toContain("https://wa.me/5571981533737");
    expect(decodeURIComponent(url)).toContain("Maria Silva");
    expect(decodeURIComponent(url)).toContain("+55 (71) 98153-3737");
  });

  it("gera payload_hash estavel para a mesma notificacao", () => {
    const first = computeNotificationPayloadHash({
      tenantId: TEST_TENANT_ID,
      provider: "email",
      recipient: "office@example.com",
      leadId: lead.id,
      resultId: result.id,
      template: "lead-qualified",
    });
    const second = computeNotificationPayloadHash({
      tenantId: TEST_TENANT_ID,
      template: "lead-qualified",
      resultId: result.id,
      leadId: lead.id,
      recipient: "office@example.com",
      provider: "email",
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });
});
