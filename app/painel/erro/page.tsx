import Link from "next/link";

export default function OfficeErrorPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <section
        className="bg-background w-full max-w-lg rounded-xl border p-8 text-center shadow-sm"
        aria-labelledby="error-title"
      >
        <h1 className="text-2xl font-semibold" id="error-title">
          Não foi possível carregar o painel
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Tente novamente. Se o problema persistir, acione o responsável
          técnico.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          href="/painel"
        >
          Voltar para visão geral
        </Link>
      </section>
    </main>
  );
}
