import { Heading, Text } from "@react-email/components";
import { createElement } from "react";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return createElement(
    "div",
    null,
    createElement(
      Text,
      {
        style: {
          color: "#475569",
          fontSize: "14px",
          margin: "0 0 8px",
        },
      },
      "Radar Previdenciario",
    ),
    createElement(
      Heading,
      {
        as: "h1",
        style: {
          color: "#0f172a",
          fontSize: "26px",
          lineHeight: "34px",
          margin: "0 0 10px",
        },
      },
      title,
    ),
    subtitle
      ? createElement(
          Text,
          {
            style: {
              color: "#334155",
              fontSize: "15px",
              lineHeight: "24px",
              margin: "0 0 24px",
            },
          },
          subtitle,
        )
      : null,
  );
}
