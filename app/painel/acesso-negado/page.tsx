import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <section
        className="bg-background w-full max-w-lg rounded-xl border p-8 text-center shadow-sm"
        aria-labelledby="denied-title"
      >
        <h1 className="text-2xl font-semibold" id="denied-title">
          Acesso não autorizado
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Sua conta não possui uma membership ativa para acessar este painel.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          href="/painel/login"
        >
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
