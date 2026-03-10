import { getDb, type Db } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditExecutor = Pick<Db, "insert">;

export type AuditPayload = Record<string, unknown>;

export type WriteAuditLogInput = {
  actorUserId: number | null;
  action: string;
  entityType: string;
  entityId?: number | string | null;
  payload?: AuditPayload | null;
};

function normalizeAuditPayload(payload?: AuditPayload | null): AuditPayload | null {
  if (!payload) {
    return null;
  }

  const normalized = JSON.parse(JSON.stringify(payload)) as AuditPayload;

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export async function writeAuditLog(
  input: WriteAuditLogInput,
  executor: AuditExecutor = getDb()
): Promise<void> {
  await executor.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId:
      input.entityId === undefined || input.entityId === null ? null : String(input.entityId),
    payload: normalizeAuditPayload(input.payload),
  });
}

export async function writeAuditLogBestEffort(
  input: WriteAuditLogInput,
  executor?: AuditExecutor
): Promise<void> {
  try {
    await writeAuditLog(input, executor ?? getDb());
  } catch (error) {
    console.error("Audit log write failed.", error);
  }
}
