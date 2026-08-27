"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withdrawalSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { attachDocumentIfPresent } from "@/lib/documents";
import { formatCurrency } from "@/lib/format";

export async function saveWithdrawalAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = withdrawalSchema.safeParse({
    id: formData.get("id") || undefined,
    partnerId: formData.get("partnerId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    reason: formData.get("reason") || undefined,
    accountId: formData.get("accountId") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const partner = await prisma.partner.findUnique({ where: { id: data.partnerId } });
  if (!partner) return { error: "Sócio não encontrado" };

  const payload = {
    partnerId: data.partnerId,
    amount: data.amount,
    date: data.date,
    reason: data.reason || null,
    accountId: data.accountId || null,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.withdrawal.update({ where: { id }, data: payload })
    : await prisma.withdrawal.create({ data: payload });

  const file = formData.get("document") as File | null;
  await attachDocumentIfPresent({
    file,
    uploadedById: user.id,
    category: "COMPROVANTE",
    relation: { withdrawalId: record.id },
  });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Withdrawal",
    entityId: record.id,
    summary: `${user.name} registrou retirada de ${formatCurrency(data.amount)} para ${partner.name}`,
  });

  revalidatePath("/retiradas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteWithdrawalAction(id: string) {
  const user = await requireUser();
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) return;

  await prisma.withdrawal.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Withdrawal",
    entityId: id,
    summary: `${user.name} excluiu uma retirada de ${formatCurrency(withdrawal.amount)}`,
  });

  revalidatePath("/retiradas");
  revalidatePath("/dashboard");
}
