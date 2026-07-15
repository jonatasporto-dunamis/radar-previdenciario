import Link from "next/link";
import { LoginForm } from "@/components/office-dashboard/auth/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export const dynamic = "force-dynamic";

export default async function OfficeLoginPage({
  searchParams,
}: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <main className="grid min-h-svh place-items-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <section
        className="bg-background w-full max-w-md rounded-xl border p-8 shadow-sm"
        aria-labelledby="login-title"
      >
        <p className="text-muted-foreground text-sm font-semibold uppercase">
          Área restrita
        </p>
        <h1 className="mt-2 text-2xl font-semibold" id="login-title">
          Entrar no painel
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Acesso exclusivo para usuários autorizados do escritório.
        </p>
        <div className="mt-6">
          <LoginForm next={resolvedSearchParams.next} />
        </div>
        <Link
          className="text-primary mt-5 inline-flex text-sm font-medium"
          href="/painel/recuperar-senha"
        >
          Esqueci minha senha
        </Link>
      </section>
    </main>
  );
}
