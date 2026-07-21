import { describe, expect, it } from "vitest";
import {
  canManageQuizTemplate,
  cloneQuizTemplateForTenant,
  getDefaultQuizTemplate,
  getQuizTemplateBySlug,
  getQuizTemplates,
  moderateCustomQuizContent,
} from "@/services/quiz/templates";

describe("Quiz templates", () => {
  it("exposes the five active platform templates and default general fallback", () => {
    const templates = getQuizTemplates();

    expect(templates.map((template) => template.type)).toEqual([
      "general",
      "maternity",
      "fibromyalgia",
      "depression",
      "autism",
    ]);
    expect(getDefaultQuizTemplate().slug).toBe("geral");
    expect(getQuizTemplateBySlug()).toMatchObject({
      type: "general",
      status: "active",
    });
    expect(getQuizTemplateBySlug("fibromialgia")).toMatchObject({
      type: "fibromyalgia",
      ownership: "platform_managed",
    });
    expect(getQuizTemplateBySlug("inexistente")).toBeNull();
  });

  it("keeps thematic health templates preventive and sensitive-aware", () => {
    const fibromyalgia = getQuizTemplateBySlug("fibromialgia");
    const depression = getQuizTemplateBySlug("depressao");
    const autism = getQuizTemplateBySlug("autismo");

    expect(fibromyalgia?.result.summary).toContain(
      "não confirma direito a benefício",
    );
    expect(depression?.result.summary).toContain("não avalia diagnóstico");
    expect(autism?.result.summary).toContain(
      "diagnóstico não confirma, por si só",
    );
    expect(
      fibromyalgia?.questions.some((question) => question.metadata?.sensitive),
    ).toBe(true);
  });

  it("moderates risky custom content with warning and blocked levels", () => {
    expect(moderateCustomQuizContent("Texto informativo neutro")).toEqual({
      level: "allowed",
      matches: [],
    });
    expect(
      moderateCustomQuizContent("Agende sua análise gratuita hoje"),
    ).toMatchObject({
      level: "warning",
    });
    expect(
      moderateCustomQuizContent("Seu benefício garantido está pronto"),
    ).toMatchObject({
      level: "blocked",
    });
    expect(
      moderateCustomQuizContent("Seu benefício está garantido."),
    ).toMatchObject({
      level: "blocked",
    });
    expect(
      moderateCustomQuizContent("Não use a expressão benefício garantido."),
    ).toMatchObject({
      level: "allowed",
    });
  });

  it("enforces role permissions and platform clone rule", () => {
    const template = getDefaultQuizTemplate();

    expect(
      canManageQuizTemplate({ role: "admin", action: "clone", template }),
    ).toBe(true);
    expect(
      canManageQuizTemplate({ role: "admin", action: "edit", template }),
    ).toBe(false);
    expect(canManageQuizTemplate({ role: "manager", action: "publish" })).toBe(
      false,
    );
    expect(canManageQuizTemplate({ role: "agent", action: "view" })).toBe(true);
    expect(canManageQuizTemplate({ role: "viewer", action: "edit" })).toBe(
      false,
    );
  });

  it("clones a platform template as tenant-managed draft", () => {
    const clone = cloneQuizTemplateForTenant({
      template: getDefaultQuizTemplate(),
      tenantId: "tenant-1",
      slug: "triagem-customizada",
      name: "Triagem customizada",
    });

    expect(clone).toMatchObject({
      tenantId: "tenant-1",
      slug: "triagem-customizada",
      source: "tenant",
      ownership: "tenant_managed",
      status: "draft",
      isDefault: false,
      version: 1,
    });
    expect(clone.id).not.toBe(getDefaultQuizTemplate().id);
  });
});
