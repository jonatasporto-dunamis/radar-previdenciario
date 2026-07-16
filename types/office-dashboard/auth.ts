export type OfficeRole = "admin" | "manager" | "agent" | "viewer";

export type OfficeMembershipStatus =
  "active" | "inactive" | "suspended" | "invited";

export type OfficeUserContext = {
  userId: string;
  email?: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantStatus: string;
  membershipId: string;
  role: OfficeRole;
  displayName?: string;
  jobTitle?: string;
  lastAccessAt?: string | null;
};

export type OfficeAuthActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
