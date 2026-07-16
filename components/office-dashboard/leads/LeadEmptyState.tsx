import Link from "next/link";

export function LeadEmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <h2 className="text-lg font-semibold">Nenhum lead encontrado</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Ajuste os filtros ou aguarde novos cadastros pelo formulário público.
      </p>
      <Link
        className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
        href="/painel/leads"
      >
        Limpar filtros
      </Link>
    </div>
  );
}
