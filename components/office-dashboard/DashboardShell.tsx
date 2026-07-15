import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileNavigation } from "./MobileNavigation";
import type { OfficeUserContext } from "@/types/office-dashboard";

export function DashboardShell({
  context,
  children,
}: {
  context: OfficeUserContext;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="flex min-h-svh">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <DashboardHeader context={context} />
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
