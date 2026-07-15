import Link from "next/link";
import { LeadSearch } from "./LeadSearch";
import {
  leadCommercialStatusLabels,
  leadCommercialStatuses,
} from "@/lib/office-dashboard";
import type { LeadListFilters } from "@/types/office-dashboard";

export function LeadFilters({ filters }: { filters: LeadListFilters }) {
  return (
    <form
      className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-4"
      method="get"
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
        <Link
          className="rounded-md border px-4 py-2 text-sm font-medium"
          href="/painel/leads"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}
