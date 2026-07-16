import Link from "next/link";

function pageHref(page: number, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `/painel/leads?${params.toString()}`;
}

export function LeadPagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: URLSearchParams;
}) {
  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-muted-foreground text-sm">
        Página {page} de {pageCount}
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          className="rounded-md border px-3 py-2 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50"
          href={pageHref(Math.max(1, page - 1), searchParams)}
        >
          Anterior
        </Link>
        <Link
          aria-disabled={page >= pageCount}
          className="rounded-md border px-3 py-2 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50"
          href={pageHref(Math.min(pageCount, page + 1), searchParams)}
        >
          Próxima
        </Link>
      </div>
    </nav>
  );
}
