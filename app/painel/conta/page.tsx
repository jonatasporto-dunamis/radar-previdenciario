import Link from "next/link";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { LogoutButton } from "@/components/office-dashboard/auth/LogoutButton";
import { formatDateTime } from "@/lib/office-dashboard";
import { requireOfficeUser } from "@/services/office-dashboard/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeAccountPage() {
  const context = await requireOfficeUser();

  return (
    <DashboardShell context={context}>
      <section
        className="bg-card max-w-3xl rounded-lg border p-6"
        aria-labelledby="account-title"
      >
        <h2 className="text-2xl font-semibold" id="account-title">
          Minha conta
        </h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome</dt>
            <dd>{context.displayName ?? "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{context.email ?? "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{context.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tenant</dt>
            <dd>{context.tenantName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Último acesso</dt>
            <dd>{formatDateTime(context.lastAccessAt)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <LogoutButton />
          <Link
            className="rounded-md border px-4 py-2 text-sm font-medium"
            href="/painel/recuperar-senha"
          >
            Solicitar redefinição de senha
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
