import type { FlowDefinition } from "@/types/quiz";

export const defaultFlow: FlowDefinition = {
  id: "flow-previdenciario-inicial",
  slug: "triagem-previdenciaria-inicial",
  benefit: "triagem-geral",
  steps: [
    "primary-interest",
    "birth-date",
    "currently-working",
    "work-type",
    "contribution-years",
    "last-income",
    "has-medical-condition",
    "additional-context",
  ],
  version: 1,
  active: true,
};

export const defaultFlows: FlowDefinition[] = [defaultFlow];
