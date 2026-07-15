import Link from "next/link";
import { LayoutDashboard, UserCircle, Users } from "lucide-react";

const links = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/leads", label: "Leads", icon: Users },
  { href: "/painel/conta", label: "Conta", icon: UserCircle },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t px-2 py-2 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-3 gap-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              className="text-muted-foreground hover:text-foreground flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium hover:bg-neutral-100"
              href={link.href}
              key={link.href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
