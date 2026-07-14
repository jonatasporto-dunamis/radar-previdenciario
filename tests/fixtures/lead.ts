import type { AttributionData } from "@/types/attribution";
import type { Lead } from "@/types/database";
import { TEST_TENANT_ID } from "./tenant";

const defaultCreatedAt = "2026-07-12T12:00:00.000Z";

export function createLeadFixture(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-fixture-001",
    tenant_id: TEST_TENANT_ID,
    full_name: "Maria Previdencia Silva",
    email: "maria.previdencia@example.com",
    phone: "5571987654321",
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
    referrer: "https://example.com/origem",
    landing_page: "https://radar.test/cadastro",
    user_agent: "Vitest",
    ip_address: "127.0.0.1",
    status: "new",
    created_at: defaultCreatedAt,
    updated_at: defaultCreatedAt,
    ...overrides,
  };
}

export function createAttributionFixture(
  overrides: AttributionData = {},
): AttributionData {
  return {
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "teste_bpc",
    utmContent: "criativo_01",
    campaignId: "123",
    adsetId: "456",
    adId: "789",
    placement: "instagram_stories",
    referrer: "https://example.com/origem",
    landingPage: "https://radar.test/cadastro",
    ...overrides,
  };
}
