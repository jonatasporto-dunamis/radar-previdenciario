import { Button } from "@react-email/components";
import { createElement } from "react";

type CTAProps = {
  href: string;
  label: string;
};

export function CTA({ href, label }: CTAProps) {
  return createElement(
    Button,
    {
      href,
      style: {
        backgroundColor: "#0f172a",
        borderRadius: "8px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: 700,
        padding: "12px 18px",
        textDecoration: "none",
      },
    },
    label,
  );
}
