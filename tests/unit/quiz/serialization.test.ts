import { describe, expect, it } from "vitest";
import {
  createStoredAnswer,
  deserializeQuestionAnswer,
  serializeQuestionAnswer,
} from "@/services/quiz/renderer";
import { questionFixtures } from "@/tests/fixtures";

describe("Question answer serialization", () => {
  it("serializes checkbox and boolean answers with labels", () => {
    expect(
      serializeQuestionAnswer(questionFixtures[0], ["aposentadoria"]),
    ).toEqual({
      answerValue: '["aposentadoria"]',
      answerLabel: "Aposentadoria",
    });
    expect(
      serializeQuestionAnswer(
        { ...questionFixtures[0], type: "boolean" },
        true,
      ),
    ).toEqual({
      answerValue: "true",
      answerLabel: "Sim",
    });
  });

  it("serializes option, currency and empty answers", () => {
    const radio = {
      ...questionFixtures[0],
      type: "radio" as const,
    };
    const currency = {
      ...questionFixtures[1],
      type: "currency" as const,
    };

    expect(serializeQuestionAnswer(radio, "aposentadoria").answerLabel).toBe(
      "Aposentadoria",
    );
    expect(serializeQuestionAnswer(currency, "2500").answerLabel).toContain(
      "2.500",
    );
    expect(serializeQuestionAnswer(questionFixtures[2], null)).toEqual({
      answerValue: "",
      answerLabel: "",
    });
  });

  it("deserializes stored values by question type", () => {
    expect(
      deserializeQuestionAnswer(questionFixtures[0], '["aposentadoria"]'),
    ).toEqual(["aposentadoria"]);
    expect(deserializeQuestionAnswer(questionFixtures[0], "invalid")).toEqual(
      [],
    );
    expect(
      deserializeQuestionAnswer(
        { ...questionFixtures[0], type: "boolean" },
        "true",
      ),
    ).toBe(true);
    expect(deserializeQuestionAnswer(questionFixtures[1], "20")).toBe("20");
    expect(deserializeQuestionAnswer(questionFixtures[2], "texto")).toBe(
      "texto",
    );
  });

  it("creates stored answers from database rows", () => {
    expect(
      createStoredAnswer(
        questionFixtures[0],
        '["aposentadoria"]',
        "Aposentadoria",
        "aposentadoria",
        "2026-07-12T12:00:00Z",
      ),
    ).toMatchObject({
      questionId: "interest",
      answerValue: ["aposentadoria"],
      answerLabel: "Aposentadoria",
      benefitContext: "aposentadoria",
    });
  });
});
