import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  tenantBrandingFormSchema,
  readTenantBrandingSettings,
} from "@/lib/branding";
import { validateBrandingAsset } from "@/lib/branding/assets";
import { createAuditLog } from "@/services/office-dashboard/audit";
import type { Json } from "@/types/supabase";
import type { OfficeUserContext } from "@/types/office-dashboard";
import type {
  TenantBrandingAssetType,
  TenantBrandingSettings,
} from "@/types/branding";

function assertManager(context: OfficeUserContext) {
  if (!["admin", "manager"].includes(context.role))
    throw new Error("Sem permissão para alterar a identidade visual.");
}

function storagePathFromPublicUrl(url: string, tenantId: string) {
  const marker = "/storage/v1/object/public/tenant-branding/";
  const path = url.includes(marker)
    ? decodeURIComponent(url.split(marker)[1] ?? "")
    : "";

  return path.startsWith(`${tenantId}/`) ? path : "";
}

export async function getTenantBranding(context: OfficeUserContext) {
  const { data, error } = await createSupabaseAdminClient()
    .from("tenants")
    .select("id, name, legal_name, metadata")
    .eq("id", context.tenantId)
    .single();
  if (error || !data)
    throw new Error("Não foi possível carregar a identidade visual.");
  const metadata = (
    data.metadata &&
    typeof data.metadata === "object" &&
    !Array.isArray(data.metadata)
      ? data.metadata
      : {}
  ) as Record<string, unknown>;
  return {
    displayName: data.name,
    legalName: data.legal_name,
    settings: readTenantBrandingSettings(metadata),
    metadata,
  };
}

export async function saveTenantBranding(
  context: OfficeUserContext,
  raw: Record<string, unknown>,
) {
  assertManager(context);
  const parsed = tenantBrandingFormSchema.parse(raw);
  const current = await getTenantBranding(context);
  const settings: TenantBrandingSettings = {
    ...current.settings,
    ...parsed,
    publishedAt: new Date().toISOString(),
  };
  const metadata = { ...current.metadata, branding: settings } as Json;
  const { error } = await createSupabaseAdminClient()
    .from("tenants")
    .update({
      name: parsed.displayName,
      legal_name: parsed.legalName,
      metadata,
    })
    .eq("id", context.tenantId);
  if (error) throw new Error("Não foi possível salvar a identidade visual.");

  const existed = Boolean(
    (current.metadata as Record<string, unknown>).branding,
  );
  await createAuditLog({
    tenantId: context.tenantId,
    actorUserId: context.userId,
    action: existed ? "branding_updated" : "branding_created",
    entityType: "tenant_branding",
    entityId: context.tenantId,
    metadata: { version: 1 },
  });
  if (
    [
      "primaryColor",
      "secondaryColor",
      "accentColor",
      "backgroundColor",
      "textColor",
      "buttonColor",
      "buttonTextColor",
      "whatsappColor",
    ].some(
      (key) =>
        raw[key] !== current.settings[key as keyof TenantBrandingSettings],
    )
  ) {
    await createAuditLog({
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: "colors_updated",
      entityType: "tenant_branding",
      entityId: context.tenantId,
    });
  }
  if (parsed.whatsappNumber !== current.settings.whatsappNumber) {
    await createAuditLog({
      tenantId: context.tenantId,
      actorUserId: context.userId,
      action: "whatsapp_updated",
      entityType: "tenant_branding",
      entityId: context.tenantId,
    });
  }
}

export async function uploadTenantBrandingAsset(
  context: OfficeUserContext,
  assetType: TenantBrandingAssetType,
  file: File,
) {
  assertManager(context);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const asset = validateBrandingAsset(bytes);
  const current = await getTenantBranding(context);
  const path = `${context.tenantId}/${assetType}-${Date.now()}.${asset.extension}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from("tenant-branding")
    .upload(path, bytes, { contentType: asset.mimeType, upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  const { data } = supabase.storage.from("tenant-branding").getPublicUrl(path);
  const field = (
    {
      logo: "logoUrl",
      icon: "iconUrl",
      favicon: "faviconUrl",
      social: "socialImageUrl",
    } as const
  )[assetType];
  const settings = {
    ...current.settings,
    [field]: data.publicUrl,
    publishedAt: new Date().toISOString(),
  };
  const { error: updateError } = await supabase
    .from("tenants")
    .update({ metadata: { ...current.metadata, branding: settings } as Json })
    .eq("id", context.tenantId);
  if (updateError) {
    await supabase.storage.from("tenant-branding").remove([path]);
    throw new Error("Não foi possível publicar a imagem.");
  }
  const oldPath = storagePathFromPublicUrl(
    current.settings[field],
    context.tenantId,
  );
  if (oldPath) {
    await supabase.storage.from("tenant-branding").remove([oldPath]);
  }
  await createAuditLog({
    tenantId: context.tenantId,
    actorUserId: context.userId,
    action: assetType === "logo" ? "logo_uploaded" : "branding_updated",
    entityType: "tenant_branding",
    entityId: context.tenantId,
    metadata: { assetType, width: asset.width, height: asset.height },
  });
}

export async function removeTenantBrandingAsset(
  context: OfficeUserContext,
  assetType: TenantBrandingAssetType,
) {
  assertManager(context);
  const current = await getTenantBranding(context);
  const field = (
    {
      logo: "logoUrl",
      icon: "iconUrl",
      favicon: "faviconUrl",
      social: "socialImageUrl",
    } as const
  )[assetType];
  const settings = {
    ...current.settings,
    [field]: "",
    publishedAt: new Date().toISOString(),
  };
  const { error } = await createSupabaseAdminClient()
    .from("tenants")
    .update({ metadata: { ...current.metadata, branding: settings } as Json })
    .eq("id", context.tenantId);
  if (error) throw new Error("Não foi possível remover a imagem.");
  const oldPath = storagePathFromPublicUrl(
    current.settings[field],
    context.tenantId,
  );
  if (oldPath) {
    await createSupabaseAdminClient()
      .storage.from("tenant-branding")
      .remove([oldPath]);
  }
  await createAuditLog({
    tenantId: context.tenantId,
    actorUserId: context.userId,
    action: assetType === "logo" ? "logo_removed" : "branding_updated",
    entityType: "tenant_branding",
    entityId: context.tenantId,
    metadata: { assetType },
  });
}
