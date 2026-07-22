import { expect, test } from "@playwright/test";

async function login(
  page: import("@playwright/test").Page,
  email = "admin@example.com",
) {
  await page.goto("/painel/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("painel-e2e");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await page.waitForURL(/\/painel$/, { timeout: 60_000 });
}

test.describe("tenant tracking integrations", () => {
  test("saves Meta configuration without test event code", async ({ page }) => {
    await login(page, "admin-b@example.com");
    await page.goto("/painel/integracoes/meta");

    await page.getByLabel("Pixel/Dataset ID").fill("123456789012345");
    await page
      .getByLabel("Access token da Conversions API")
      .fill("token-without-test-code");
    await page.getByLabel("Código de teste").fill("");
    await page.getByLabel("Ativar integração").check();
    await page.getByLabel("Tracking no navegador").check();
    await page.getByLabel("Tracking server-side").check();
    await page.getByRole("button", { name: "Salvar configuração" }).click();

    await expect(page).toHaveURL(/saved=1/);
    await expect(
      page.getByText(
        "Configuração salva. Agora teste a conexão antes de ativar a integração.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("Teste pendente", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Token configurado").first()).toBeVisible();
    await expect(
      page.getByText("Código de teste pendente").first(),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Token configurado").first(),
    ).toBeVisible();
    await expect(
      page.getByLabel("Access token da Conversions API"),
    ).toHaveValue("");
    await expect(page.getByLabel("Código de teste")).toHaveValue("");
    await expect(page.getByText("token-without-test-code")).toHaveCount(0);

    await page.getByRole("button", { name: "Testar conexão" }).click();
    await expect(page).toHaveURL(/tested=configuration_required/);
    await expect(
      page.getByRole("paragraph").filter({
        hasText: "Para enviar um evento à área Test Events da Meta",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Teste pendente", { exact: true }),
    ).toBeVisible();
  });

  test("configures and tests Meta without exposing secrets", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/painel/integracoes");

    await expect(
      page.getByRole("heading", { name: "Central de tracking do tenant" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Meta" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Google Analytics 4" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Configurar" }).first().click();
    await expect(page).toHaveURL(/\/painel\/integracoes\/meta/);
    await page.getByLabel("Pixel/Dataset ID").fill("123456789012345");
    await page.getByLabel("Access token da Conversions API").fill("token-e2e");
    await page.getByLabel("Código de teste").fill("TEST123");
    await page.getByLabel("Ativar integração").check();
    await page.getByLabel("Tracking no navegador").check();
    await page.getByLabel("Tracking server-side").check();
    await page.getByRole("button", { name: "Salvar configuração" }).click();

    await expect(page).toHaveURL(/saved=1/);
    await expect(page.getByText("Configuração salva.")).toBeVisible();
    await expect(page.getByText("Token configurado").first()).toBeVisible();
    await expect(
      page.getByText("Código de teste configurado").first(),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Token configurado").first(),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Código de teste configurado").first(),
    ).toBeVisible();
    await expect(
      page.getByLabel("Access token da Conversions API"),
    ).toHaveValue("");
    await expect(page.getByLabel("Código de teste")).toHaveValue("");
    await expect(page.getByText("token-e2e")).toHaveCount(0);
    await expect(page.getByText("TEST123")).toHaveCount(0);

    await page.getByRole("button", { name: "Testar conexão" }).click();
    await expect(page).toHaveURL(/tested=success/);
    await expect(
      page.getByText("Teste registrado com status: success."),
    ).toBeVisible();

    await page.getByLabel("Ativar integração").check();
    await page.getByRole("button", { name: "Salvar configuração" }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect(page.getByText("Conectado")).toBeVisible();

    await page.goto("/painel/integracoes/eventos");
    await expect(
      page.getByRole("heading", { name: "Mapeamento e entregas externas" }),
    ).toBeVisible();
    await expect(page.getByText("Lead enviado").first()).toBeVisible();

    await page.goto("/painel/integracoes/testes");
    await expect(
      page.getByRole("heading", { name: "Histórico de testes de conexão" }),
    ).toBeVisible();
    await expect(
      page.getByText("Meta CAPI validada em modo E2E mockado.").first(),
    ).toBeVisible();
  });
});
