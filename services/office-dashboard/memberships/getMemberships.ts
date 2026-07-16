import "server-only";
import { listMembershipsByUserId } from "../repositories";

export async function getMemberships(userId: string) {
  return listMembershipsByUserId(userId);
}
