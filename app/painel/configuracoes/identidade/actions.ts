"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import {
  removeTenantBrandingAsset,
  saveTenantBranding,
  uploadTenantBrandingAsset,
} from "@/services/office-dashboard/branding";
import type { TenantBrandingAssetType } from "@/types/branding";

const assetTypes = new Set<TenantBrandingAssetType>([
  "logo",
  "icon",
  "favicon",
  "social",
]);

function refreshBranding() {
  revalidatePath("/");
  revalidatePath("/cadastro");
  revalidatePath("/painel/configuracoes/identidade");
}

export async function saveBrandingAction(formData: FormData) {
  const context = await requireTenantRole("manageBranding");
  try {
    await saveTenantBranding(context, {
      ...Object.fromEntries(formData.entries()),
      version: 1,
    });
    refreshBranding();
  } catch {
    redirect("/painel/configuracoes/identidade?error=invalid_settings");
  }
  redirect("/painel/configuracoes/identidade?saved=1");
}

export async function uploadBrandingAssetAction(formData: FormData) {
  const context = await requireTenantRole("manageBranding");
  const assetType = String(
    formData.get("assetType"),
  ) as TenantBrandingAssetType;
  const file = formData.get("file");
  if (!assetTypes.has(assetType) || !(file instanceof File) || !file.size)
    redirect("/painel/configuracoes/identidade?error=invalid_asset");
  try {
    await uploadTenantBrandingAsset(context, assetType, file);
    refreshBranding();
  } catch {
    redirect("/painel/configuracoes/identidade?error=invalid_asset");
  }
  redirect("/painel/configuracoes/identidade?uploaded=1");
}

export async function removeBrandingAssetAction(formData: FormData) {
  const context = await requireTenantRole("manageBranding");
  const assetType = String(
    formData.get("assetType"),
  ) as TenantBrandingAssetType;
  if (!assetTypes.has(assetType))
    redirect("/painel/configuracoes/identidade?error=invalid_asset");
  await removeTenantBrandingAsset(context, assetType);
  refreshBranding();
  redirect("/painel/configuracoes/identidade?removed=1");
}
