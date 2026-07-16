import { updateLeadFiltersAction } from "@/app/painel/leads/actions";
import { LeadSearch } from "./LeadSearch";
import {
  leadCommercialStatusLabels,
  leadCommercialStatuses,
} from "@/lib/office-dashboard";
import type { LeadListFilters } from "@/types/office-dashboard";

export function LeadFilters({ filters }: { filters: LeadListFilters }) {
  return (
    <form
      action={updateLeadFiltersAction}
      className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-4"
    >
      <LeadSearch defaultValue={filters.search} />
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="status">
          Status
        </label>
        <select
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.status ?? ""}
          id="status"
          name="status"
        >
          <option value="">Todos</option>
          {leadCommercialStatuses.map((status) => (
            <option key={status} value={status}>
              {leadCommercialStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="classification">
          Classificação
        </label>
        <select
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.classification ?? ""}
          id="classification"
          name="classification"
        >
          <option value="">Todas</option>
          <option value="alto_potencial">Alto potencial</option>
          <option value="medio_potencial">Médio potencial</option>
          <option value="baixo_potencial">Baixo potencial</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="templateType">
          Tipo de quiz
        </label>
        <select
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.templateType ?? ""}
          id="templateType"
          name="templateType"
        >
          <option value="">Todos</option>
          <option value="general">Geral</option>
          <option value="maternity">Salário-maternidade</option>
          <option value="fibromyalgia">Fibromialgia</option>
          <option value="depression">Depressão</option>
          <option value="autism">Autismo</option>
          <option value="custom">Customizado</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="dataCompleteness">
          Completude
        </label>
        <select
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.dataCompleteness ?? ""}
          id="dataCompleteness"
          name="dataCompleteness"
        >
          <option value="">Todas</option>
          <option value="complete">Completa</option>
          <option value="partial">Parcial</option>
          <option value="insufficient">Insuficiente</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="requiresHumanReview">
          Revisão humana
        </label>
        <select
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={
            typeof filters.requiresHumanReview === "boolean"
              ? String(filters.requiresHumanReview)
              : ""
          }
          id="requiresHumanReview"
          name="requiresHumanReview"
        >
          <option value="">Todas</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="utmSource">
          UTM source
        </label>
        <input
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.utmSource}
          id="utmSource"
          name="utmSource"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="utmCampaign">
          UTM campaign
        </label>
        <input
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.utmCampaign}
          id="utmCampaign"
          name="utmCampaign"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="dateFrom">
          De
        </label>
        <input
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.dateFrom}
          id="dateFrom"
          name="dateFrom"
          type="date"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="dateTo">
          Até
        </label>
        <input
          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={filters.dateTo}
          id="dateTo"
          name="dateTo"
          type="date"
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold"
          type="submit"
        >
          Filtrar
        </button>
        <button
          className="rounded-md border px-4 py-2 text-sm font-medium"
          formNoValidate
          name="intent"
          type="submit"
          value="clear"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
