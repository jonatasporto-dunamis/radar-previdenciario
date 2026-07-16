import { Hr, Text } from "@react-email/components";
import { createElement } from "react";

export function Footer() {
  return createElement(
    "div",
    null,
    createElement(Hr, {
      style: { borderColor: "#e2e8f0", margin: "28px 0 16px" },
    }),
    createElement(
      Text,
      {
        style: {
          color: "#64748b",
          fontSize: "12px",
          lineHeight: "18px",
          margin: 0,
        },
      },
      "Esta mensagem foi gerada automaticamente pelo Radar Previdenciario. A triagem possui carater exclusivamente informativo, nao constitui parecer juridico, nao confirma direito a beneficio e nao substitui avaliacao individual com documentos.",
    ),
  );
}
