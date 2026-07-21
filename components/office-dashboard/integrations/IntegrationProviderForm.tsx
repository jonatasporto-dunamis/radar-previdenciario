import { ShieldCheck, TestTube2 } from "lucide-react";
import {
  saveIntegrationAction,
  testIntegrationAction,
} from "@/app/painel/integracoes/actions";
import {
  getIntegrationProviderSlug,
  integrationProviderDefinitions,
} from "@/services/office-dashboard/integrations";
import { IntegrationStatusBadge } from "./IntegrationStatusBadge";
import type { IntegrationDetail } from "@/services/office-dashboard/integrations";
import type { IntegrationProvider } from "@/types/integrations";

function readConfig(
  configuration: Record<string, unknown>,
  key: string,
): string {
  const value = configuration[key];

  if (typeof value === "boolean") {
    return value ? "true" : "";
  }

  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  disabled,
  help,
  secret,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  help?: string;
  secret?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <input
        autoComplete="off"
        className="bg-background focus:ring-primary/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        defaultValue={secret ? "" : defaultValue}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        type={secret ? "password" : "text"}
      />
      {help ? (
        <span className="text-muted-foreground block text-xs">{help}</span>
      ) : null}
    </label>
  );
}

function ToggleField({
  label,
  name,
  defaultChecked,
  disabled,
  help,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  disabled?: boolean;
  help?: string;
}) {
  return (
    <label className="flex gap-3 rounded-md border p-3 text-sm">
      <input
        className="mt-1 size-4"
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        type="checkbox"
      />
      <span>
        <span className="block font-medium">{label}</span>
        {help ? (
          <span className="text-muted-foreground mt-1 block text-xs">
            {help}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function ProviderSpecificFields({
  provider,
  configuration,
  hasSecrets,
  disabled,
}: {
  provider: IntegrationProvider;
  configuration: Record<string, unknown>;
  hasSecrets: boolean;
  disabled?: boolean;
}) {
  if (provider === "meta") {
    return (
      <>
        <TextField
          defaultValue={readConfig(configuration, "pixelId")}
          disabled={disabled}
          help="Formato esperado: ID numérico do Pixel ou Dataset."
          label="Pixel/Dataset ID"
          name="pixelId"
          placeholder="123456789012345"
        />
        <TextField
          defaultValue={readConfig(configuration, "apiVersion") || "v25.0"}
          disabled={disabled}
          label="Versão da API"
          name="apiVersion"
          placeholder="v25.0"
        />
        <TextField
          disabled={disabled}
          help={
            hasSecrets
              ? "Já existe credencial criptografada. Preencha para substituir."
              : undefined
          }
          label="Access token da Conversions API"
          name="accessToken"
          placeholder={
            hasSecrets
              ? "Credencial já configurada"
              : "Cole o token server-side"
          }
          secret
        />
        <TextField
          disabled={disabled}
          label="Código de teste"
          name="testEventCode"
          placeholder="Opcional"
          secret
        />
      </>
    );
  }

  if (provider === "ga4") {
    return (
      <>
        <TextField
          defaultValue={readConfig(configuration, "measurementId")}
          disabled={disabled}
          help="Formato esperado: G-XXXXXXXXXX."
          label="Measurement ID"
          name="measurementId"
          placeholder="G-XXXXXXXXXX"
        />
        <TextField
          disabled={disabled}
          help={
            hasSecrets
              ? "Já existe API Secret criptografado. Preencha para substituir."
              : undefined
          }
          label="API Secret"
          name="apiSecret"
          placeholder={
            hasSecrets ? "Credencial já configurada" : "Cole o API Secret"
          }
          secret
        />
        <ToggleField
          defaultChecked={readConfig(configuration, "debugMode") === "true"}
          disabled={disabled}
          label="Debug Mode"
          name="debugMode"
        />
      </>
    );
  }

  if (provider === "google_ads") {
    return (
      <>
        <TextField
          defaultValue={readConfig(configuration, "conversionId")}
          disabled={disabled}
          help="Formato esperado: AW-XXXXXXXXX."
          label="Conversion ID"
          name="conversionId"
          placeholder="AW-123456789"
        />
        <TextField
          defaultValue={readConfig(configuration, "defaultConversionLabel")}
          disabled={disabled}
          label="Label padrão de conversão"
          name="defaultConversionLabel"
          placeholder="Opcional"
        />
        <TextField
          defaultValue={readConfig(configuration, "customerId")}
          disabled={disabled}
          label="Customer ID"
          name="customerId"
          placeholder="Opcional"
        />
        <TextField
          disabled={disabled}
          help={
            hasSecrets
              ? "Credenciais OAuth já estão criptografadas. Preencha para substituir."
              : undefined
          }
          label="Developer token"
          name="developerToken"
          placeholder={
            hasSecrets ? "Credencial já configurada" : "Developer token"
          }
          secret
        />
        <TextField
          disabled={disabled}
          label="OAuth Client ID"
          name="oauthClientId"
          secret
        />
        <TextField
          disabled={disabled}
          label="OAuth Client Secret"
          name="oauthClientSecret"
          secret
        />
        <TextField
          disabled={disabled}
          label="Refresh token"
          name="refreshToken"
          secret
        />
        <TextField
          disabled={disabled}
          label="Login Customer ID"
          name="loginCustomerId"
          secret
        />
        <ToggleField
          defaultChecked
          disabled={disabled}
          help="Mantém validação sem conversão real."
          label="Validate only"
          name="validateOnly"
        />
      </>
    );
  }

  return (
    <>
      <TextField
        defaultValue={readConfig(configuration, "pixelId")}
        disabled={disabled}
        label="Pixel Code/ID"
        name="pixelId"
        placeholder="Pixel ID"
      />
      <TextField
        disabled={disabled}
        help={
          hasSecrets
            ? "Já existe access token criptografado. Preencha para substituir."
            : undefined
        }
        label="Access token da Events API"
        name="accessToken"
        placeholder={
          hasSecrets ? "Credencial já configurada" : "Cole o token server-side"
        }
        secret
      />
      <TextField
        disabled={disabled}
        label="Código de teste"
        name="testEventCode"
        placeholder="Opcional"
        secret
      />
      <ToggleField
        defaultChecked={readConfig(configuration, "debugMode") === "true"}
        disabled={disabled}
        label="Debug Mode"
        name="debugMode"
      />
    </>
  );
}

export function IntegrationProviderForm({
  detail,
  canManage,
  saved,
  tested,
  error,
}: {
  detail: IntegrationDetail;
  canManage: boolean;
  saved?: boolean;
  tested?: string;
  error?: string;
}) {
  const { integration } = detail;
  const providerSlug = getIntegrationProviderSlug(integration.provider);
  const definition = integrationProviderDefinitions[integration.provider];
  const disabled = !canManage;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        action={saveIntegrationAction}
        className="bg-card rounded-lg border p-5"
      >
        <input name="provider" type="hidden" value={providerSlug} />

        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Configuração</p>
            <h2 className="text-xl font-semibold">{definition.name}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
              Preencha os dados públicos e, quando necessário, substitua as
              credenciais server-side. Os segredos são criptografados e nunca
              retornam para esta página.
            </p>
          </div>
          <IntegrationStatusBadge status={integration.status} />
        </div>

        {saved ? (
          <p className="bg-success/10 text-success mt-5 rounded-md p-3 text-sm">
            Configuração salva. Se a integração ainda não foi testada, ela
            permanece pendente.
          </p>
        ) : null}

        {tested ? (
          <p className="bg-primary/10 text-primary mt-5 rounded-md p-3 text-sm">
            Teste registrado com status: {tested}.
          </p>
        ) : null}

        {error ? (
          <p className="bg-danger/10 text-danger mt-5 rounded-md p-3 text-sm">
            Não foi possível concluir a ação. Revise os campos e tente
            novamente.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ToggleField
            defaultChecked={integration.enabled}
            disabled={disabled}
            help="Só é ativado após teste bem-sucedido."
            label="Ativar integração"
            name="enabled"
          />
          <ToggleField
            defaultChecked={integration.testMode}
            disabled={disabled}
            help="Use enquanto valida eventos nos provedores."
            label="Modo teste"
            name="testMode"
          />
          <ToggleField
            defaultChecked={integration.browserTrackingEnabled}
            disabled={disabled}
            label="Tracking no navegador"
            name="browserTrackingEnabled"
          />
          <ToggleField
            defaultChecked={integration.serverTrackingEnabled}
            disabled={disabled}
            label="Tracking server-side"
            name="serverTrackingEnabled"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ProviderSpecificFields
            configuration={integration.configuration}
            disabled={disabled}
            hasSecrets={integration.hasSecrets}
            provider={integration.provider}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
          {canManage ? (
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold"
              type="submit"
            >
              Salvar configuração
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Seu perfil permite apenas visualização das integrações.
            </p>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <div className="bg-card rounded-lg border p-5">
          <ShieldCheck aria-hidden="true" className="text-primary size-5" />
          <h3 className="mt-3 font-semibold">Segurança</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Tokens ficam em tabela separada, criptografados e acessíveis apenas
            por módulos server-only. Logs mostram apenas resultados sanitizados.
          </p>
        </div>

        <form
          action={testIntegrationAction}
          className="bg-card rounded-lg border p-5"
        >
          <input name="provider" type="hidden" value={providerSlug} />
          <TestTube2 aria-hidden="true" className="text-primary size-5" />
          <h3 className="mt-3 font-semibold">Teste de conexão</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            O teste valida formato, presença de credenciais e modo de envio sem
            registrar conversão real.
          </p>
          {canManage ? (
            <button
              className="mt-4 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold"
              type="submit"
            >
              Testar conexão
            </button>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
