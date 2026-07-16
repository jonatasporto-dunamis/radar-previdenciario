import Link from "next/link";
import { ResetPasswordForm } from "@/components/office-dashboard/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <section
        className="bg-background w-full max-w-md rounded-xl border p-8 shadow-sm"
        aria-labelledby="reset-title"
      >
        <h1 className="text-2xl font-semibold" id="reset-title">
          Redefinir senha
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Defina uma nova senha para continuar usando o painel interno.
        </p>
        <div className="mt-6">
          <ResetPasswordForm />
        </div>
        <Link
          className="text-primary mt-5 inline-flex text-sm font-medium"
          href="/painel/login"
        >
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
