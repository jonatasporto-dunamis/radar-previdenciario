import { describe, expect, it } from "vitest";
import {
  canChangeLeadStatus,
  canCreateLeadNote,
  canDeleteLeadNote,
  canEditLeadNote,
  canManageDomains,
  canViewLead,
  canViewDomains,
  canViewMetrics,
  canTransitionLeadStatus,
} from "@/lib/office-dashboard";

describe("office dashboard permissions", () => {
  it("allows every active role to view leads and metrics", () => {
    expect(canViewLead("admin")).toBe(true);
    expect(canViewLead("manager")).toBe(true);
    expect(canViewLead("agent")).toBe(true);
    expect(canViewLead("viewer")).toBe(true);
    expect(canViewMetrics("viewer")).toBe(true);
  });

  it("keeps viewer roles read-only", () => {
    expect(canChangeLeadStatus("viewer")).toBe(false);
    expect(canCreateLeadNote("viewer")).toBe(false);
  });

  it("limits domain management to admins", () => {
    expect(canViewDomains("admin")).toBe(true);
    expect(canViewDomains("manager")).toBe(true);
    expect(canViewDomains("viewer")).toBe(false);
    expect(canManageDomains("admin")).toBe(true);
    expect(canManageDomains("manager")).toBe(false);
  });

  it("allows note edits only for owners or admins", () => {
    expect(
      canEditLeadNote({
        role: "agent",
        userId: "user-1",
        note: { authorUserId: "user-1" },
      }),
    ).toBe(true);
    expect(
      canDeleteLeadNote({
        role: "agent",
        userId: "user-1",
        note: { authorUserId: "user-2" },
      }),
    ).toBe(false);
    expect(
      canDeleteLeadNote({
        role: "admin",
        userId: "user-1",
        note: { authorUserId: "user-2" },
      }),
    ).toBe(true);
  });

  it("validates commercial status transitions", () => {
    expect(canTransitionLeadStatus("new", "contacted")).toBe(true);
    expect(canTransitionLeadStatus("new", "converted")).toBe(false);
    expect(canTransitionLeadStatus("converted", "archived")).toBe(true);
  });
});
