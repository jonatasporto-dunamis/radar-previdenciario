import Link from "next/link";

const footerLinks = [
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: "mailto:contato@radarprevidenciario.com.br", label: "Contato" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="px-page text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {year} Radar Previdenciário. Todos os direitos reservados.</p>
        <nav aria-label="Links do rodapé">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="hover:text-foreground transition"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
