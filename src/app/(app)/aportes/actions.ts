"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contributionSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { attachDocumentIfPresent } from "@/lib/documents";
import { formatCurrency } from "@/lib/format";

export async function saveContributionAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = contributionSchema.safeParse({
    id: formData.get("id") || undefined,
    partnerId: formData.get("partnerId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    originDescription: formData.get("originDescription") || undefined,
    destinationAccountId: formData.get("destinationAccountId") || undefined,
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
    originDescription: data.originDescription || null,
    destinationAccountId: data.destinationAccountId || null,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.contribution.update({ where: { id }, data: payload })
    : await prisma.contribution.create({ data: payload });

  const file = formData.get("document") as File | null;
  await attachDocumentIfPresent({
    file,
    uploadedById: user.id,
    category: "COMPROVANTE",
    relation: { contributionId: record.id },
  });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Contribution",
    entityId: record.id,
    summary: `${user.name} registrou aporte de ${formatCurrency(data.amount)} de ${partner.name}`,
  });

  revalidatePath("/aportes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteContributionAction(id: string) {
  const user = await requireUser();
  const contribution = await prisma.contribution.findUnique({ where: { id } });
  if (!contribution) return;

  await prisma.contribution.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Contribution",
    entityId: id,
    summary: `${user.name} excluiu um aporte de ${formatCurrency(contribution.amount)}`,
  });

  revalidatePath("/aportes");
  revalidatePath("/dashboard");
}
