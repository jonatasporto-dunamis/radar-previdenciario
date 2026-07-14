import { expect, startLeadRegistration, test } from "./fixtures";

async function getExternalEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item),
      )
      .map((item) => item.rp_event_name)
      .filter(Boolean),
  );
}

test("tracking consent accepted pushes PageView, LeadStarted and LeadSubmitted without PII", async ({
  page,
  lead,
}) => {
  await page.goto("/cadastro");
  await page.getByRole("button", { name: /Aceitar mensuração/i }).click();

  await expect.poll(() => getExternalEvents(page)).toContain("PageView");

  await startLeadRegistration(page, {
    ...lead,
    email: `tracking-${lead.email}`,
  });

  await expect
    .poll(() => getExternalEvents(page))
    .toEqual(
      expect.arrayContaining(["PageView", "LeadStarted", "LeadSubmitted"]),
    );

  const serializedDataLayer = await page.evaluate(() =>
    JSON.stringify(window.dataLayer ?? []),
  );

  expect(serializedDataLayer).not.toContain(`tracking-${lead.email}`);
  expect(serializedDataLayer).not.toContain(lead.fullName);
  expect(serializedDataLayer).not.toContain(lead.phone);
  expect(serializedDataLayer).not.toContain("alto_potencial");
  expect(serializedDataLayer).not.toContain("Aposentadoria");
});

test("tracking consent denied prevents browser external events", async ({
  page,
}) => {
  await page.goto("/cadastro");
  await page.getByRole("button", { name: /Continuar sem mensuração/i }).click();
  await page.getByLabel("Nome completo", { exact: true }).click();

  await expect.poll(() => getExternalEvents(page)).toEqual([]);
});

test("WhatsAppClick is tracked in dry-run without blocking the link", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Aceitar mensuração/i }).click();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: /Abrir conversa no WhatsApp/i }).click();
  const popup = await popupPromise;
  await popup.close();

  await expect.poll(() => getExternalEvents(page)).toContain("WhatsAppClick");
});
