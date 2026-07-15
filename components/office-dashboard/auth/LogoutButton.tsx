"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/painel/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
        type="submit"
      >
        <LogOut aria-hidden="true" className="size-4" />
        Sair
      </button>
    </form>
  );
}
