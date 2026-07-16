import {
  answerRequiredQuiz,
  expect,
  startLeadRegistration,
  test,
} from "./fixtures";

test("Home -> Cadastro -> Quiz -> Resultado -> WhatsApp CTA", async ({
  page,
  lead,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Triagem previdenciária informativa em uma jornada simples e segura.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Abrir conversa no WhatsApp/i }),
  ).toHaveAttribute("href", /https:\/\/wa\.me\/5571981533737/);

  await expect(
    page.getByRole("link", { name: /Iniciar triagem informativa/i }).first(),
  ).toHaveAttribute("href", "/cadastro");

  await startLeadRegistration(page, lead);
  await answerRequiredQuiz(page);
  await page.getByRole("button", { name: /Finalizar/i }).click();

  await page.waitForURL(/\/resultado$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", {
      name: /informações foram organizadas/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/organiza informações para uma triagem inicial/i),
  ).toBeVisible();
  await expect(page.getByText(/^Score$/)).toHaveCount(0);
  await expect(page.getByText(/Alto potencial/i)).toHaveCount(0);
  await expect(page.getByText(/Médio potencial/i)).toHaveCount(0);
  await expect(page.getByText(/Baixo potencial/i)).toHaveCount(0);
  await expect(page.getByText(/Tema identificado para análise/i)).toBeVisible();
});

test("Cadastro inválido mostra mensagens de validação", async ({ page }) => {
  await page.goto("/cadastro");
  await page
    .getByRole("button", { name: /Iniciar triagem informativa/i })
    .click();

  await expect(page.getByText(/Informe seu nome completo/i)).toBeVisible();
  await expect(page.getByText(/Informe um e-mail válido/i)).toBeVisible();
  await expect(page.getByText(/Informe seu telefone/i)).toBeVisible();
  await expect(
    page.getByText(/É necessário autorizar o uso das informações/i),
  ).toBeVisible();
});

test("Retomada mantém o usuário na pergunta anterior não finalizada", async ({
  page,
  lead,
}) => {
  await startLeadRegistration(page, {
    ...lead,
    email: `resume-${lead.email}`,
  });
  await answerRequiredQuiz(page);
  await expect(
    page.getByRole("heading", {
      name: /Há documentos ou informações/i,
    }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("heading", {
      name: /Há documentos ou informações/i,
    }),
  ).toBeVisible();
});

test("Refresh no resultado não perde a classificação", async ({
  page,
  lead,
}) => {
  await startLeadRegistration(page, {
    ...lead,
    email: `refresh-${lead.email}`,
  });
  await answerRequiredQuiz(page);
  await page.getByRole("button", { name: /Finalizar/i }).dblclick();
  await page.waitForURL(/\/resultado$/, { timeout: 30_000 });

  await page.reload();

  await expect(
    page.getByRole("heading", {
      name: /informações foram organizadas/i,
    }),
  ).toBeVisible();
});

test("Cookie ausente redireciona /quiz para cadastro", async ({ page }) => {
  await page.goto("/quiz");

  await expect(page).toHaveURL(/\/cadastro$/);
});

test("Resultado inexistente redireciona para cadastro", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "rp_lead_session",
      value: "lead-inexistente",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/resultado");

  await expect(page).toHaveURL(/\/cadastro$/);
});

test("Mobile possui labels, foco e navegação por teclado básicos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").focus();
  await expect(page.getByLabel("Nome completo")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("E-mail")).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Iniciar triagem informativa/i }),
  ).toBeVisible();
});
