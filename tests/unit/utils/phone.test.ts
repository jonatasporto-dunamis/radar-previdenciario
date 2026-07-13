import { describe, expect, it } from "vitest";
import {
  formatBrazilianPhone,
  isValidBrazilianPhone,
  normalizeBrazilianPhone,
} from "@/utils/phone";

describe("utils/phone", () => {
  it("normalizes Brazilian phones to country code digits", () => {
    expect(normalizeBrazilianPhone("(71) 98153-3737")).toBe("5571981533737");
    expect(normalizeBrazilianPhone("5571981533737")).toBe("5571981533737");
  });

  it("validates Brazilian local numbers with DDD", () => {
    expect(isValidBrazilianPhone("(71) 98153-3737")).toBe(true);
    expect(isValidBrazilianPhone("(71) 3153-3737")).toBe(true);
    expect(isValidBrazilianPhone("98153-3737")).toBe(false);
  });

  it("formats partial and complete numbers predictably", () => {
    expect(formatBrazilianPhone("71")).toBe("71");
    expect(formatBrazilianPhone("7198")).toBe("(71) 98");
    expect(formatBrazilianPhone("7131533737")).toBe("(71) 3153-3737");
    expect(formatBrazilianPhone("71981533737")).toBe("(71) 98153-3737");
  });
});
