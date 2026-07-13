import { Section as EmailSection, Text } from "@react-email/components";
import { createElement } from "react";
import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  children?: ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return createElement(
    EmailSection,
    { style: { margin: "24px 0" } },
    createElement(
      Text,
      {
        style: {
          color: "#0f172a",
          fontSize: "16px",
          fontWeight: 700,
          margin: "0 0 12px",
        },
      },
      title,
    ),
    children,
  );
}
