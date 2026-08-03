import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { BrandingSettingsForm } from "@/components/office-dashboard/branding/BrandingSettingsForm";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { getTenantBranding } from "@/services/office-dashboard/branding";
import {
  removeBrandingAssetAction,
  uploadBrandingAssetAction,
} from "./actions";
import type { TenantBrandingAssetType } from "@/types/branding";

export const dynamic = "force-dynamic";
const assets: { type: TenantBrandingAssetType; label: string; help: string }[] =
  [
    { type: "logo", label: "Logo", help: "Cabeçalho e páginas públicas" },
    { type: "icon", label: "Símbolo", help: "Versão compacta da marca" },
    { type: "favicon", label: "Favicon", help: "Ícone da aba do navegador" },
    {
      type: "social",
      label: "Imagem social",
      help: "Compartilhamento em redes sociais",
    },
  ];

export default async function BrandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requireTenantRole("viewBranding");
  const branding = await getTenantBranding(context);
  const params = await searchParams;
  const urls = {
    logo: branding.settings.logoUrl,
    icon: branding.settings.iconUrl,
    favicon: branding.settings.faviconUrl,
    social: branding.settings.socialImageUrl,
  };
  return (
    <DashboardShell context={context}>
      <div className="space-y-7">
        <div>
          <p className="text-muted-foreground text-sm">Configurações</p>
          <h2 className="text-2xl font-semibold">
            Identidade visual do escritório
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            Personalize a marca e o cadastro sem novo deployment. Somente este
            escritório é alterado.
          </p>
        </div>
        {params.saved ? (
          <p
            className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900"
            role="status"
          >
            Identidade publicada com sucesso.
          </p>
        ) : null}
        {params.uploaded || params.removed ? (
          <p
            className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900"
            role="status"
          >
            Imagem atualizada com sucesso.
          </p>
        ) : null}
        {params.error ? (
          <p
            className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
            role="alert"
          >
            Não foi possível salvar. Revise cores, textos ou formato da imagem.
          </p>
        ) : null}
        <section>
          <h3 className="font-semibold">Arquivos da marca</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            PNG, JPEG ou WEBP, 32–4096 px e até 2 MB. SVG é recusado por
            segurança.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {assets.map((asset) => (
              <div
                className="bg-background rounded-lg border p-4"
                key={asset.type}
              >
                <div className="flex items-center gap-3">
                  {urls[asset.type] ? (
                    <Image
                      alt=""
                      className="size-14 rounded-md border object-contain"
                      height={56}
                      src={urls[asset.type]}
                      unoptimized
                      width={56}
                    />
                  ) : (
                    <span className="bg-muted flex size-14 items-center justify-center rounded-md">
                      <ImageIcon className="size-5" />
                    </span>
                  )}
                  <div>
                    <h4 className="font-medium">{asset.label}</h4>
                    <p className="text-muted-foreground text-xs">
                      {asset.help}
                    </p>
                  </div>
                </div>
                <form
                  action={uploadBrandingAssetAction}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <input name="assetType" type="hidden" value={asset.type} />
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="min-w-0 flex-1 text-sm"
                    name="file"
                    required
                    type="file"
                  />
                  <button
                    className="rounded-md border px-3 py-2 text-sm font-semibold"
                    type="submit"
                  >
                    Enviar
                  </button>
                </form>
                {urls[asset.type] ? (
                  <form action={removeBrandingAssetAction} className="mt-2">
                    <input name="assetType" type="hidden" value={asset.type} />
                    <button
                      className="text-sm text-red-700 underline"
                      type="submit"
                    >
                      Remover
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </section>
        <BrandingSettingsForm
          displayName={branding.displayName}
          legalName={branding.legalName}
          settings={branding.settings}
        />
      </div>
    </DashboardShell>
  );
}
