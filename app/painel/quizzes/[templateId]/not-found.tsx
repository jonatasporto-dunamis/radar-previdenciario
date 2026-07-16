import Link from "next/link";

export default function OfficeQuizTemplateNotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-md rounded-lg border p-6 text-center">
        <h1 className="text-xl font-semibold">Template não encontrado</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          O template solicitado não existe ou não pertence ao tenant ativo.
        </p>
        <Link
          className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          href="/painel/quizzes"
        >
          Voltar para quizzes
        </Link>
      </div>
    </main>
  );
}
