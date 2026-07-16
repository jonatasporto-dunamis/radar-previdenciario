import Link from "next/link";
import { ForgotPasswordForm } from "@/components/office-dashboard/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <section
        className="bg-background w-full max-w-md rounded-xl border p-8 shadow-sm"
        aria-labelledby="forgot-title"
      >
        <h1 className="text-2xl font-semibold" id="forgot-title">
          Recuperar senha
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Informe seu e-mail institucional para receber instruções, caso a conta
          esteja habilitada.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
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
