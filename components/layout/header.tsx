import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "Início" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/quiz", label: "Quiz" },
  { href: "/resultado", label: "Resultado" },
];

export function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
      <div className="px-page mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 py-3">
        <Link
          aria-label="Radar Previdenciário - página inicial"
          className="text-foreground flex min-w-0 items-center gap-2 text-base font-semibold"
          href="/"
        >
          <span className="bg-primary text-primary-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md">
            <Scale aria-hidden="true" className="size-5" />
          </span>
          <span className="truncate">Radar Previdenciário</span>
        </Link>

        <nav aria-label="Menu principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Button asChild className="shrink-0">
          <Link href="/quiz">
            Iniciar análise
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
