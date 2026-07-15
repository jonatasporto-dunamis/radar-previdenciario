import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentOfficeUser,
  hasOfficeAuthSession,
} from "./getCurrentOfficeUser";
import type { OfficeUserContext } from "@/types/office-dashboard";

export async function requireOfficeUser(): Promise<OfficeUserContext> {
  const context = await getCurrentOfficeUser();

  if (context) {
    return context;
  }

  if (await hasOfficeAuthSession()) {
    redirect("/painel/acesso-negado");
  }

  redirect("/painel/login");
}
