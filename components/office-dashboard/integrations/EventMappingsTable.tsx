import { updateEventMappingAction } from "@/app/painel/integracoes/actions";
import {
  getIntegrationProviderSlug,
  integrationEventLabels,
  integrationProviderDefinitions,
} from "@/services/office-dashboard/integrations";
import type { TenantEventMapping } from "@/types/integrations";

const valueSourceLabels: Record<TenantEventMapping["valueSource"], string> = {
  none: "Sem valor",
  fixed: "Valor fixo",
  lead_value: "Valor do lead",
  conversion_value: "Valor de conversão",
};

export function EventMappingsTable({
  mappings,
  canManage,
}: {
  mappings: TenantEventMapping[];
  canManage: boolean;
}) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y text-sm">
        <caption className="sr-only">
          Mapeamentos de eventos internos para provedores externos
        </caption>
        <thead className="text-muted-foreground bg-neutral-50 text-left text-xs uppercase dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3" scope="col">
              Provedor
            </th>
            <th className="px-4 py-3" scope="col">
              Evento interno
            </th>
            <th className="px-4 py-3" scope="col">
              Evento externo
            </th>
            <th className="px-4 py-3" scope="col">
              Valor
            </th>
            <th className="px-4 py-3" scope="col">
              Moeda
            </th>
            <th className="px-4 py-3" scope="col">
              Ativo
            </th>
            <th className="px-4 py-3" scope="col">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {mappings.map((mapping) => (
            <tr key={mapping.id}>
              <td className="px-4 py-4">
                {integrationProviderDefinitions[mapping.provider].shortName}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium">
                  {integrationEventLabels[mapping.internalEvent] ??
                    mapping.internalEvent}
                </p>
                <p className="text-muted-foreground">{mapping.internalEvent}</p>
              </td>
              <td className="px-4 py-4">
                <form
                  action={updateEventMappingAction}
                  className="flex min-w-96 flex-wrap items-center gap-2"
                >
                  <input name="mappingId" type="hidden" value={mapping.id} />
                  <input
                    name="provider"
                    type="hidden"
                    value={getIntegrationProviderSlug(mapping.provider)}
                  />
                  <input
                    name="internalEvent"
                    type="hidden"
                    value={mapping.internalEvent}
                  />
                  <input
                    aria-label={`Evento externo para ${mapping.internalEvent}`}
                    className="bg-background min-w-44 rounded-md border px-3 py-2"
                    defaultValue={mapping.externalEvent}
                    disabled={!canManage}
                    name="externalEvent"
                  />
                  <select
                    aria-label={`Origem do valor para ${mapping.internalEvent}`}
                    className="bg-background rounded-md border px-3 py-2"
                    defaultValue={mapping.valueSource}
                    disabled={!canManage}
                    name="valueSource"
                  >
                    {Object.entries(valueSourceLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Moeda para ${mapping.internalEvent}`}
                    className="bg-background w-20 rounded-md border px-3 py-2 uppercase"
                    defaultValue={mapping.currency}
                    disabled={!canManage}
                    maxLength={3}
                    name="currency"
                  />
                  <label className="inline-flex items-center gap-2">
                    <input
                      defaultChecked={mapping.enabled}
                      disabled={!canManage}
                      name="enabled"
                      type="checkbox"
                    />
                    <span className="sr-only">Ativar mapeamento</span>
                  </label>
                  {canManage ? (
                    <button
                      className="rounded-md border px-3 py-2 font-semibold"
                      type="submit"
                    >
                      Salvar
                    </button>
                  ) : null}
                </form>
              </td>
              <td className="px-4 py-4">
                {valueSourceLabels[mapping.valueSource]}
              </td>
              <td className="px-4 py-4">{mapping.currency}</td>
              <td className="px-4 py-4">{mapping.enabled ? "Sim" : "Não"}</td>
              <td className="px-4 py-4">
                {canManage ? "Editável" : "Somente leitura"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
