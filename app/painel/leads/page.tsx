import { cookies } from "next/headers";
import { DashboardShell } from "@/components/office-dashboard/DashboardShell";
import { LeadEmptyState } from "@/components/office-dashboard/leads/LeadEmptyState";
import { LeadFilters } from "@/components/office-dashboard/leads/LeadFilters";
import { LeadPagination } from "@/components/office-dashboard/leads/LeadPagination";
import { LeadTable } from "@/components/office-dashboard/leads/LeadTable";
import {
  OFFICE_LEAD_SEARCH_COOKIE,
  parseLeadListFilters,
} from "@/lib/office-dashboard";
import { requireTenantRole } from "@/services/office-dashboard/auth";
import { listOfficeLeads } from "@/services/office-dashboard/leads";

type SearchParams = Record<string, string | string[] | undefined>;

type LeadsPageProps = {
  searchParams?: Promise<SearchParams>;
};

function toURLSearchParams(
  searchParams: SearchParams | undefined,
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (key !== "search" && typeof value === "string") {
      params.set(key, value);
    }
  });

  return params;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficeLeadsPage({
  searchParams,
}: LeadsPageProps) {
  const context = await requireTenantRole("viewLead");
  const cookieStore = await cookies();
  const urlSearchParams = toURLSearchParams(
    searchParams ? await searchParams : undefined,
  );
  const filters = parseLeadListFilters(
    urlSearchParams,
    cookieStore.get(OFFICE_LEAD_SEARCH_COOKIE)?.value,
  );
  const result = await listOfficeLeads({ context, filters });

  return (
    <DashboardShell context={context}>
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground text-sm">Leads</p>
          <h2 className="text-2xl font-semibold">Acompanhamento comercial</h2>
        </div>
        <LeadFilters filters={filters} />
        {result.items.length ? (
          <>
            <LeadTable leads={result.items} />
            <LeadPagination
              page={result.page}
              pageCount={result.pageCount}
              searchParams={urlSearchParams}
            />
          </>
        ) : (
          <LeadEmptyState />
        )}
      </div>
    </DashboardShell>
  );
}
