import Link from "next/link";
import {
  ClipboardList,
  Globe2,
  LayoutDashboard,
  PlugZap,
  UserCircle,
  Users,
} from "lucide-react";

const links = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/leads", label: "Leads", icon: Users },
  { href: "/painel/quizzes", label: "Quizzes", icon: ClipboardList },
  { href: "/painel/integracoes", label: "Integrações", icon: PlugZap },
  { href: "/painel/configuracoes/dominio", label: "Domínios", icon: Globe2 },
  { href: "/painel/conta", label: "Minha conta", icon: UserCircle },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-neutral-50/80 p-6 lg:block dark:bg-neutral-950/60">
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Radar Previdenciário
          </p>
          <p className="mt-2 text-lg font-semibold">Painel interno</p>
        </div>
        <nav aria-label="Navegação principal" className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                className="hover:bg-background flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition dark:text-neutral-200"
                href={link.href}
                key={link.href}
              >
                <Icon aria-hidden="true" className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
