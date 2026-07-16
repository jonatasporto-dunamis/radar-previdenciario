import "server-only";
import { getActiveMembershipContext } from "../repositories";

export async function getActiveMembership(input: {
  userId: string;
  email?: string;
}) {
  return getActiveMembershipContext(input);
}
