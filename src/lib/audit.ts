import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  userId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  summary: string;
  changes?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      summary: params.summary,
      changes: params.changes ? JSON.stringify(params.changes) : null,
    },
  });
}
