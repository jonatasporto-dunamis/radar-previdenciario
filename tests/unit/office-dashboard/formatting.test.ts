import { describe, expect, it } from "vitest";
import {
  formatClassification,
  getQuizAnswerState,
  maskEmail,
  maskPhone,
  parseLeadListFilters,
} from "@/lib/office-dashboard";

describe("office dashboard formatting and filters", () => {
  it("masks lead contact data in list views", () => {
    expect(maskEmail("maria.silva@example.com")).toMatch(/^ma\*\*\*@ex\*\*\*/);
    expect(maskPhone("+55 (71) 98153-3737")).toBe("(**) *****-3737");
  });

  it("formats internal classifications", () => {
    expect(formatClassification("alto_potencial")).toBe("Alto potencial");
    expect(formatClassification(null)).toBe("Não classificado");
  });

  it("detects non-definitive answer states", () => {
    expect(getQuizAnswerState("unknown", "Não sei")).toBe("unknown");
    expect(getQuizAnswerState("withheld", "Prefiro não informar")).toBe(
      "withheld",
    );
    expect(getQuizAnswerState("20", "20 anos")).toBe("answered");
  });

  it("normalizes lead list filters", () => {
    const filters = parseLeadListFilters(
      new URLSearchParams({
        page: "1",
        pageSize: "200",
        search: "nao-deve-ser-usado",
        status: "new",
        requiresHumanReview: "true",
      }),
      "Maria",
    );

    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(50);
    expect(filters.search).toBe("Maria");
    expect(filters.status).toBe("new");
    expect(filters.requiresHumanReview).toBe(true);
  });
});
