import Link from "next/link";

export default function LeadNotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <section className="bg-background max-w-lg rounded-xl border p-8 text-center">
        <h1 className="text-2xl font-semibold">Lead não encontrado</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          O lead solicitado não existe neste tenant ou você não possui acesso.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          href="/painel/leads"
        >
          Voltar para leads
        </Link>
      </section>
    </main>
  );
}
