import { expect, test } from "@playwright/test";

async function login(
  page: import("@playwright/test").Page,
  email = "admin@example.com",
  waitForPanel = true,
) {
  await page.goto("/painel/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("painel-e2e");
  await page.getByRole("button", { name: "Entrar no painel" }).click();

  if (waitForPanel) {
    await page.waitForURL(/\/painel$/, { timeout: 60_000 });
  }
}

test.describe("office dashboard", () => {
  test("redirects protected routes to login", async ({ page }) => {
    await page.goto("/painel/leads");
    await expect(page).toHaveURL(/\/painel\/login/);
  });

  test("rejects invalid login without account enumeration", async ({
    page,
  }) => {
    await page.goto("/painel/login");
    await page.getByLabel("E-mail").fill("admin@example.com");
    await page.getByLabel("Senha").fill("senha-incorreta");
    await page.getByRole("button", { name: "Entrar no painel" }).click();

    await expect(
      page.getByText("Não foi possível entrar com os dados informados."),
    ).toBeVisible();
  });

  test("blocks users without an active office membership", async ({ page }) => {
    await login(page, "suspended@example.com", false);
    await expect(page).toHaveURL(/\/painel\/acesso-negado/);

    await page.goto("/painel/login");
    await page.getByLabel("E-mail").fill("nomembership@example.com");
    await page.getByLabel("Senha").fill("painel-e2e");
    await page.getByRole("button", { name: "Entrar no painel" }).click();
    await expect(page).toHaveURL(/\/painel\/acesso-negado/);
  });

  test("ignores unsafe post-login redirects", async ({ page }) => {
    await page.goto("/painel/login?next=https://evil.example");
    await page.getByLabel("E-mail").fill("admin@example.com");
    await page.getByLabel("Senha").fill("painel-e2e");
    await page.getByRole("button", { name: "Entrar no painel" }).click();

    await expect(page).toHaveURL(/\/painel$/);
  });

  test("opens dashboard after valid login with noindex metadata", async ({
    page,
  }) => {
    await login(page);
    await expect(page).toHaveURL(/\/painel$/);
    await expect(
      page.getByRole("heading", { name: "Indicadores do escritório" }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("lists and filters leads", async ({ page, browserName }) => {
    await login(page);
    await page.goto("/painel/leads");
    await expect(
      page.getByRole("heading", { name: "Acompanhamento comercial" }),
    ).toBeVisible();
    await expect(page.getByText("Maria Lead E2E")).toBeVisible();

    await page.getByLabel("Busca").fill("Maria");
    const filterResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/painel/leads"),
    );
    await page.getByRole("button", { name: "Filtrar" }).click();
    await filterResponsePromise;
    await expect(page).not.toHaveURL(/search=/);
    await expect(page.getByLabel("Busca")).toHaveValue("Maria");
    await expect(page.getByText("Maria Lead E2E")).toBeVisible();
    await expect
      .poll(async () => {
        const searchCookie = (await page.context().cookies(page.url())).find(
          (cookie) => cookie.name === "rp_office_lead_search",
        );

        return searchCookie
          ? {
              httpOnly: searchCookie.httpOnly,
              path: searchCookie.path,
              sameSite: searchCookie.sameSite,
              value: searchCookie.value,
            }
          : null;
      })
      .toEqual({
        httpOnly: true,
        path: "/painel",
        sameSite:
          browserName === "webkit"
            ? expect.stringMatching(/^(Lax|None)$/)
            : "Lax",
        value: "Maria",
      });
  });

  test("shows lead details, qualification, answers and timeline", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/painel/leads");
    await page.getByRole("link", { name: "Abrir" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Identificação" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Qualificação interna" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Respostas do quiz" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Notificações" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  });

  test("manages modular quiz templates", async ({ page }) => {
    await login(page);
    await page.goto("/painel/quizzes");

    await expect(
      page.getByRole("heading", { name: "Gestão básica de templates" }),
    ).toBeVisible();
    await expect(page.getByText("Triagem previdenciária geral")).toBeVisible();

    await page.getByRole("button", { name: "Clonar" }).first().click();
    await page.waitForURL(/\/painel\/quizzes\/[0-9a-f-]+/);
    await expect(
      page.getByRole("heading", { name: /rascunho/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Editar draft" }).click();
    await page.getByLabel("Nome").fill("Template E2E de triagem");
    await page
      .getByLabel("Descrição")
      .fill("Template customizado de teste para o painel interno.");
    await page.getByRole("button", { name: "Salvar agora" }).click();
    await expect(page.getByText("Draft salvo.")).toBeVisible({
      timeout: 30_000,
    });
    await page.goto(page.url().replace(/\/editar(?:\?.*)?$/, ""));

    await expect(
      page.getByRole("heading", { name: "Template E2E de triagem" }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Ativo").first()).toBeVisible();
  });

  test("manages tenant domain requests without exposing provider credentials", async ({
    page,
  }, testInfo) => {
    await login(page);
    await page.goto("/painel/configuracoes/dominio");

    await expect(
      page.getByRole("heading", { name: "Domínios do escritório" }),
    ).toBeVisible();
    await expect(
      page.getByText("resende.radarprevidenciario.com.br"),
    ).toBeVisible();
    await expect(page.getByText("VERCEL_TOKEN")).toHaveCount(0);

    await page.getByRole("link", { name: "Novo domínio" }).click();
    const slug = `dominio-${testInfo.project.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .slice(0, 24)}`;
    await page.getByLabel("Slug do subdomínio").fill(slug);
    await page.getByRole("button", { name: "Criar solicitação" }).click();

    await expect(page).toHaveURL(
      /\/painel\/configuracoes\/dominio\/[0-9a-f-]+/,
    );
    await expect(page.getByText("Solicitação criada.")).toBeVisible();
    await expect(
      page.getByText(`${slug}.radarprevidenciario.com.br`),
    ).toBeVisible();
    await expect(page.getByText("Aguardando DNS").first()).toBeVisible();
    await expect(page.getByText("VERCEL_TOKEN")).toHaveCount(0);

    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/verified=1/);
    await expect(page.getByText("Verificação atualizada.")).toBeVisible();
  });

  test("updates status and manages an internal note", async ({ page }) => {
    await login(page);
    await page.goto("/painel/leads");
    await page.getByRole("link", { name: "Abrir" }).first().click();

    await page.getByLabel("Novo status").selectOption("contacted");
    await page
      .getByLabel("Motivo opcional")
      .fill("Contato inicial pelo painel.");
    await page
      .getByRole("button", { name: "Atualizar status" })
      .click({ force: true });
    await expect(page.getByText("Status atualizado.")).toBeVisible();

    await page.getByLabel("Nota interna").fill("Nota E2E sem dados sensíveis.");
    await page
      .getByRole("button", { name: "Adicionar nota" })
      .click({ force: true });
    await expect(page.getByText("Nota salva.")).toBeVisible();
    await expect(
      page.locator("p").filter({ hasText: "Nota E2E sem dados sensíveis." }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Excluir nota" })
      .first()
      .click({ force: true });
    await expect(
      page.locator("p").filter({ hasText: "Nota E2E sem dados sensíveis." }),
    ).toHaveCount(0);
  });

  test("keeps viewer users read-only", async ({ page }) => {
    await login(page, "viewer@example.com");
    await page.goto("/painel/leads");
    await page.getByRole("link", { name: "Abrir" }).first().click();

    await expect(
      page.getByText("Seu perfil possui acesso somente leitura.").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Atualizar status" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Adicionar nota" }),
    ).toHaveCount(0);
  });

  test("logs out securely", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Sair" }).first().click();
    await expect(page).toHaveURL(/\/painel\/login/);
    await page.goto("/painel");
    await expect(page).toHaveURL(/\/painel\/login/);
  });
});
