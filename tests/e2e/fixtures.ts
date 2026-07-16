import { expect, test as base } from "@playwright/test";

type LeadFixture = {
  fullName: string;
  email: string;
  phone: string;
};

type E2EFixtures = {
  lead: LeadFixture;
};

export const test = base.extend<E2EFixtures>({
  lead: async ({}, provideLead, testInfo) => {
    const projectSlug = testInfo.project.name.replace(/\W/g, "-").toLowerCase();
    const hash = Array.from(
      `${testInfo.project.name}-${testInfo.title}`,
    ).reduce((total, item) => (total * 31 + item.charCodeAt(0)) % 100_000, 0);
    const phoneSuffix = String(9_000_0000 + hash).slice(-8);

    await provideLead({
      fullName: `Lead E2E ${projectSlug} ${hash}`,
      email: `lead-${projectSlug}-${hash}@example.com`,
      phone: `719${phoneSuffix}`,
    });
  },
});

export { expect };

async function waitForAutosave(page: import("@playwright/test").Page) {
  await expect(page.getByText("Resposta salva")).toBeVisible({
    timeout: 30_000,
  });
}

export async function startLeadRegistration(
  page: import("@playwright/test").Page,
  lead: LeadFixture,
) {
  await page.goto(
    `/cadastro?utm_source=e2e&utm_medium=quality_gate&utm_campaign=playwright&utm_content=${lead.email}`,
  );
  const fullNameInput = page.getByLabel("Nome completo", { exact: true });
  await fullNameInput.click();
  await fullNameInput.pressSequentially(lead.fullName);
  await expect(fullNameInput).toHaveValue(lead.fullName);
  await page.getByLabel("E-mail", { exact: true }).fill(lead.email);
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(
    lead.email,
  );
  await page.getByLabel("Telefone", { exact: true }).fill(lead.phone);
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue(
    /^\(\d{2}\) \d{5}-\d{4}$/,
  );
  await page.getByLabel(/Li a Política de Privacidade/i).check();
  await page
    .getByRole("button", { name: /Iniciar triagem informativa/i })
    .click();
  await page.waitForURL(/\/quiz$/, { timeout: 120_000 });
}

export async function answerRequiredQuiz(
  page: import("@playwright/test").Page,
) {
  await page.getByText("Aposentadoria", { exact: true }).click();
  await waitForAutosave(page);
  await page.getByRole("button", { name: /Próximo/i }).click();
  await page.getByText("Ainda não fiz pedido", { exact: true }).click();
  await waitForAutosave(page);
  await page.getByRole("button", { name: /Próximo/i }).click();
  await page.getByText("Sim", { exact: true }).click();
  await waitForAutosave(page);
  await page.getByRole("button", { name: /Próximo/i }).click();
  await page.getByText("Sim", { exact: true }).click();
  await waitForAutosave(page);
  await page.getByRole("button", { name: /Próximo/i }).click();
}
