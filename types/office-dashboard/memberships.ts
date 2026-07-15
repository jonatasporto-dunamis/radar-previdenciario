import type { OfficeMembershipStatus, OfficeRole } from "./auth";

export type OfficeMembership = {
  id: string;
  tenantId: string;
  userId: string;
  role: OfficeRole;
  status: OfficeMembershipStatus;
  displayName?: string;
  jobTitle?: string;
  isDefault: boolean;
  lastAccessAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
