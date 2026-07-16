import { beforeAll, describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "@/services/office-dashboard/repositories";
import { getDashboardMetrics } from "@/services/office-dashboard/dashboard";
import {
  getOfficeLead,
  listOfficeLeads,
  updateLeadCommercialStatus,
} from "@/services/office-dashboard/leads";
import {
  createLeadNote,
  deleteLeadNote,
  listLeadNotes,
  updateLeadNote,
} from "@/services/office-dashboard/notes";
import { getActiveMembershipContext } from "@/services/office-dashboard/repositories";
import type { OfficeUserContext } from "@/types/office-dashboard";

const tenantA = "00000000-0000-4000-8000-000000000001";
const tenantB = "00000000-0000-4000-8000-000000000002";
const leadA = "00000000-0000-4000-8000-000000001001";
const leadB = "00000000-0000-4000-8000-000000002001";
const suspendedUser = "00000000-0000-4000-8000-000000000905";
const inactiveTenantUser = "00000000-0000-4000-8000-000000000907";
const noMembershipUser = "00000000-0000-4000-8000-000000000999";

const adminContext: OfficeUserContext = {
  userId: "00000000-0000-4000-8000-000000000901",
  email: "admin@example.com",
  tenantId: tenantA,
  tenantSlug: "resende-advogados",
  tenantName: "Resende Advogados Associados",
  tenantStatus: "active",
  membershipId: "00000000-0000-4000-8000-000000000911",
  role: "admin",
  displayName: "Admin E2E",
};

const viewerContext: OfficeUserContext = {
  ...adminContext,
  userId: "00000000-0000-4000-8000-000000000904",
  email: "viewer@example.com",
  role: "viewer",
};

const tenantBContext: OfficeUserContext = {
  ...adminContext,
  userId: "00000000-0000-4000-8000-000000000906",
  email: "admin-b@example.com",
  tenantId: tenantB,
  tenantSlug: "tenant-b",
  tenantName: "Tenant B",
  role: "admin",
};

describe("office dashboard services", () => {
  beforeAll(() => {
    process.env.E2E_MOCK_SUPABASE = "true";
  });

  it("keeps lead detail isolated by tenant", async () => {
    await expect(
      getOfficeLead({ context: adminContext, leadId: leadB }),
    ).resolves.toBeNull();
    await expect(
      getOfficeLead({ context: tenantBContext, leadId: leadA }),
    ).resolves.toBeNull();
    await expect(
      getOfficeLead({ context: adminContext, leadId: leadA }),
    ).resolves.toMatchObject({
      id: leadA,
      tenantId: tenantA,
    });
  });

  it("blocks users without an active membership and inactive tenants", async () => {
    await expect(
      getActiveMembershipContext({ userId: noMembershipUser }),
    ).resolves.toBeNull();
    await expect(
      getActiveMembershipContext({ userId: suspendedUser }),
    ).resolves.toBeNull();
    await expect(
      getActiveMembershipContext({ userId: inactiveTenantUser }),
    ).resolves.toBeNull();
  });

  it("lists leads only from the authenticated tenant", async () => {
    const result = await listOfficeLeads({
      context: adminContext,
      filters: { page: 1, pageSize: 20 },
    });

    expect(result.items.some((item) => item.id === leadA)).toBe(true);
    expect(result.items.some((item) => item.id === leadB)).toBe(false);
  });

  it("blocks read-only users from changing status", async () => {
    await expect(
      updateLeadCommercialStatus({
        context: viewerContext,
        leadId: leadA,
        status: "contacted",
      }),
    ).rejects.toThrow(/cannot change/i);
  });

  it("updates status with history and audit for authorized users", async () => {
    await updateLeadCommercialStatus({
      context: adminContext,
      leadId: leadA,
      status: "contacted",
      reason: "Contato inicial.",
    });

    await expect(
      getOfficeLead({ context: adminContext, leadId: leadA }),
    ).resolves.toMatchObject({
      commercialStatus: "contacted",
    });
  });

  it("creates, updates, and deletes internal notes with tenant scope", async () => {
    const note = await createLeadNote({
      context: adminContext,
      leadId: leadA,
      body: "Nota operacional.",
    });

    await updateLeadNote({
      context: adminContext,
      leadId: leadA,
      noteId: note.id,
      body: "Nota operacional atualizada.",
    });

    const notes = await listLeadNotes({ context: adminContext, leadId: leadA });
    expect(notes.some((item) => item.id === note.id)).toBe(true);

    await deleteLeadNote({
      context: adminContext,
      leadId: leadA,
      noteId: note.id,
    });

    const updatedNotes = await listLeadNotes({
      context: adminContext,
      leadId: leadA,
    });
    expect(updatedNotes.some((item) => item.id === note.id)).toBe(false);
  });

  it("sanitizes sensitive audit metadata", () => {
    expect(
      sanitizeAuditMetadata({
        email: "lead@example.com",
        toStatus: "contacted",
        payload: { answer: "sensitive" },
      }),
    ).toEqual({
      email: "[redacted]",
      toStatus: "contacted",
      payload: "[redacted]",
    });
  });

  it("returns dashboard metrics without exposing lead payloads", async () => {
    await expect(getDashboardMetrics(adminContext)).resolves.toMatchObject({
      failedNotifications: expect.any(Number),
      newLeads: expect.any(Number),
      leadsLast30Days: expect.any(Number),
    });
  });
});
