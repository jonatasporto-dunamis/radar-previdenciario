import { describe, expect, it } from "vitest";
import { qualifyLeadFromResult } from "@/services/qualification";

describe("qualifyLeadFromResult", () => {
  it("classifica alto potencial para notificacao de alta prioridade", () => {
    const qualification = qualifyLeadFromResult({
      classification: "alto_potencial",
    });

    expect(qualification).toMatchObject({
      classification: "alto_potencial",
      priority: "high",
      shouldNotify: true,
      providers: ["email"],
    });
  });

  it("classifica medio potencial para notificacao de prioridade media", () => {
    const qualification = qualifyLeadFromResult({
      classification: "medio_potencial",
    });

    expect(qualification).toMatchObject({
      classification: "medio_potencial",
      priority: "medium",
      shouldNotify: true,
      providers: ["email"],
    });
  });

  it("registra baixo potencial como ignored sem provider de envio", () => {
    const qualification = qualifyLeadFromResult({
      classification: "baixo_potencial",
    });

    expect(qualification).toMatchObject({
      classification: "baixo_potencial",
      priority: "low",
      shouldNotify: false,
      providers: [],
    });
  });
});
