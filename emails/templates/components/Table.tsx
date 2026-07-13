import { createElement } from "react";

type TableItem = {
  label: string;
  value: string | number | null | undefined;
};

type TableProps = {
  items: TableItem[];
};

export function Table({ items }: TableProps) {
  return createElement(
    "table",
    {
      style: {
        borderCollapse: "collapse",
        width: "100%",
      },
    },
    createElement(
      "tbody",
      null,
      items.map((item) =>
        createElement(
          "tr",
          { key: item.label },
          createElement(
            "th",
            {
              style: {
                borderBottom: "1px solid #e2e8f0",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px 12px 10px 0",
                textAlign: "left",
                verticalAlign: "top",
                width: "34%",
              },
            },
            item.label,
          ),
          createElement(
            "td",
            {
              style: {
                borderBottom: "1px solid #e2e8f0",
                color: "#0f172a",
                fontSize: "13px",
                lineHeight: "20px",
                padding: "10px 0",
              },
            },
            item.value || "-",
          ),
        ),
      ),
    ),
  );
}
