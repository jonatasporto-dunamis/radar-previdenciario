import "server-only";
import { insertAuditLog } from "../repositories";

export const createAuditLog = insertAuditLog;
