import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --turbopack --hostname 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      E2E_MOCK_SUPABASE: "true",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role",
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      NEXT_PUBLIC_WHATSAPP_NUMBER: "5571981533737",
      RESEND_API_KEY: "test-resend-key",
      OFFICE_NOTIFICATION_EMAIL: "office@example.com",
      EMAIL_FROM_NAME: "Radar Previdenciario",
      EMAIL_FROM_ADDRESS: "no-reply@example.com",
      EMAIL_REPLY_TO: "reply@example.com",
      TENANT_SECRETS_ENCRYPTION_KEY:
        "0000000000000000000000000000000000000000000000000000000000000000",
      NEXT_PUBLIC_TRACKING_ENABLED: "true",
      NEXT_PUBLIC_TRACKING_CONSENT_REQUIRED: "true",
      EXTERNAL_TRACKING_DRY_RUN: "true",
      META_CAPI_TEST_MOCK: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
    },
  ],
});
