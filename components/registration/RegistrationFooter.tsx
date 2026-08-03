import Link from "next/link";
import { getAppConfig } from "@/services/configuration";

export async function RegistrationFooter() {
  const { brand } = await getAppConfig();

  return (
    <footer className="border-t py-6">
      <div className="px-page text-muted-foreground mx-auto flex w-full max-w-3xl flex-col gap-3 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} {brand.name}
        </p>
        <nav aria-label="Links legais" className="flex justify-center gap-4">
          <Link
            className="underline underline-offset-4"
            href="/privacidade"
            target="_blank"
          >
            Privacidade
          </Link>
          <Link
            className="underline underline-offset-4"
            href="/termos"
            target="_blank"
          >
            Termos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
