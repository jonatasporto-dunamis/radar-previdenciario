import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionTitle } from "@/components/common/section-title";

describe("SectionTitle", () => {
  it("renders accessible heading and stable content", () => {
    const { container } = render(
      <SectionTitle
        align="center"
        description="Descrição de teste"
        eyebrow="Radar"
        title="Título de teste"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Título de teste" }),
    ).toBeVisible();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="max-w-3xl mx-auto text-center"
      >
        <p
          class="text-muted-foreground mb-3 text-sm font-medium uppercase"
        >
          Radar
        </p>
        <h2
          class="text-foreground text-3xl leading-tight font-semibold sm:text-4xl"
        >
          Título de teste
        </h2>
        <p
          class="text-muted-foreground mt-4 text-base leading-7 sm:text-lg"
        >
          Descrição de teste
        </p>
      </div>
    `);
  });
});
