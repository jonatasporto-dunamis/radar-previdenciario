import { LogoutButton } from "./auth/LogoutButton";
import type { OfficeUserContext } from "@/types/office-dashboard";

export function DashboardHeader({ context }: { context: OfficeUserContext }) {
  const isProduction = process.env.VERCEL_ENV === "production";

  return (
    <header className="bg-background flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <p className="text-muted-foreground text-sm">{context.tenantName}</p>
        <h1 className="text-xl font-semibold">Painel do escritório</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!isProduction ? (
          <span className="bg-warning/15 text-warning rounded-full px-3 py-1 text-xs font-semibold">
            {process.env.VERCEL_ENV ?? "local"}
          </span>
        ) : null}
        <div className="text-right text-sm">
          <p className="font-medium">
            {context.displayName ?? context.email ?? "Usuário"}
          </p>
          <p className="text-muted-foreground">{context.role}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
