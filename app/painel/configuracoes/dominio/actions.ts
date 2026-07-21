"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  disableTenantDomain,
  makeTenantDomainPrimary,
  removeTenantDomain,
  requestTenantDomain,
  verifyTenantDomain,
} from "@/services/office-dashboard/domains";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readDomainId(formData: FormData): string {
  const domainId = readString(formData, "domainId");

  if (!domainId) {
    throw new Error("Domain id is required.");
  }

  return domainId;
}

export async function requestTenantDomainAction(formData: FormData) {
  const context = await requireTenantRole("manageDomains");
  let domainId: string;

  try {
    const domain = await requestTenantDomain({
      context,
      domainType:
        readString(formData, "domainType") === "platform_subdomain"
          ? "platform_subdomain"
          : "custom_domain",
      subdomainSlug: readString(formData, "subdomainSlug"),
      customHostname: readString(formData, "customHostname"),
    });
    domainId = domain.id;
  } catch {
    redirect("/painel/configuracoes/dominio/novo?error=invalid_domain");
  }

  revalidatePath("/painel/configuracoes/dominio");
  redirect(`/painel/configuracoes/dominio/${domainId}?created=1`);
}

export async function verifyTenantDomainAction(formData: FormData) {
  const context = await requireTenantRole("manageDomains");
  const domainId = readDomainId(formData);

  try {
    await verifyTenantDomain({ context, domainId });
  } catch {
    redirect(`/painel/configuracoes/dominio/${domainId}?error=verify_failed`);
  }

  revalidatePath("/painel/configuracoes/dominio");
  revalidatePath(`/painel/configuracoes/dominio/${domainId}`);
  redirect(`/painel/configuracoes/dominio/${domainId}?verified=1`);
}

export async function makeTenantDomainPrimaryAction(formData: FormData) {
  const context = await requireTenantRole("manageDomains");
  const domainId = readDomainId(formData);

  try {
    await makeTenantDomainPrimary({ context, domainId });
  } catch {
    redirect(`/painel/configuracoes/dominio/${domainId}?error=primary_failed`);
  }

  revalidatePath("/");
  revalidatePath("/painel/configuracoes/dominio");
  revalidatePath(`/painel/configuracoes/dominio/${domainId}`);
  redirect(`/painel/configuracoes/dominio/${domainId}?primary=1`);
}

export async function disableTenantDomainAction(formData: FormData) {
  const context = await requireTenantRole("manageDomains");
  const domainId = readDomainId(formData);

  try {
    await disableTenantDomain({ context, domainId });
  } catch {
    redirect(`/painel/configuracoes/dominio/${domainId}?error=disable_failed`);
  }

  revalidatePath("/painel/configuracoes/dominio");
  revalidatePath(`/painel/configuracoes/dominio/${domainId}`);
  redirect(`/painel/configuracoes/dominio/${domainId}?disabled=1`);
}

export async function removeTenantDomainAction(formData: FormData) {
  const context = await requireTenantRole("manageDomains");
  const domainId = readDomainId(formData);

  try {
    await removeTenantDomain({ context, domainId });
  } catch {
    redirect(`/painel/configuracoes/dominio/${domainId}?error=remove_failed`);
  }

  revalidatePath("/painel/configuracoes/dominio");
  redirect("/painel/configuracoes/dominio?removed=1");
}
