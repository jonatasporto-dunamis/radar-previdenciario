import { Copy } from "lucide-react";
import type { TenantDnsInstructions } from "@/types/tenants";

export function DomainDnsInstructions({
  instructions,
}: {
  instructions: TenantDnsInstructions;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-neutral-950">
      <div>
        <h3 className="text-lg font-semibold">Instruções de DNS</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Use apenas os registros oficiais exibidos aqui. Tokens e credenciais
          da plataforma não são apresentados no painel.
        </p>
      </div>

      {instructions.records.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="py-2 pr-4 font-semibold">Tipo</th>
                <th className="py-2 pr-4 font-semibold">Nome</th>
                <th className="py-2 pr-4 font-semibold">Valor</th>
                <th className="py-2 pr-4 font-semibold">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {instructions.records.map((record) => (
                <tr key={`${record.type}-${record.name}-${record.value}`}>
                  <td className="py-3 pr-4 font-medium">{record.type}</td>
                  <td className="py-3 pr-4">{record.name}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <code className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                        {record.value}
                      </code>
                      <Copy aria-hidden="true" className="size-3" />
                    </span>
                  </td>
                  <td className="py-3 pr-4">{record.ttl ?? "Auto"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {instructions.notes.length ? (
        <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
          {instructions.notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
