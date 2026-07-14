export class TenantAccessError extends Error {
  constructor(message = "Tenant access denied.") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export function assertTenantAccess(input: {
  expectedTenantId: string;
  actualTenantId?: string | null;
  resource?: string;
}): void {
  if (input.actualTenantId !== input.expectedTenantId) {
    throw new TenantAccessError(
      `Tenant access denied${input.resource ? ` for ${input.resource}` : ""}.`,
    );
  }
}
