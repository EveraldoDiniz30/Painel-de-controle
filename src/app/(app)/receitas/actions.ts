"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revenueSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { attachDocumentIfPresent } from "@/lib/documents";
import { formatCurrency } from "@/lib/format";

export async function saveRevenueAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = revenueSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    description: formData.get("description"),
    platform: formData.get("platform") || undefined,
    source: formData.get("source") || undefined,
    grossAmount: formData.get("grossAmount"),
    fees: formData.get("fees") || 0,
    categoryId: formData.get("categoryId") || undefined,
    status: formData.get("status"),
    destinationAccountId: formData.get("destinationAccountId") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const netAmount = data.grossAmount - data.fees;
  if (netAmount < 0) {
    return { error: "As taxas não podem ser maiores que o valor bruto." };
  }

  const payload = {
    date: data.date,
    description: data.description,
    platform: data.platform || null,
    source: data.source || null,
    grossAmount: data.grossAmount,
    fees: data.fees,
    netAmount,
    categoryId: data.categoryId || null,
    status: data.status,
    destinationAccountId: data.destinationAccountId || null,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.revenue.update({ where: { id }, data: payload })
    : await prisma.revenue.create({ data: payload });

  const file = formData.get("document") as File | null;
  await attachDocumentIfPresent({
    file,
    uploadedById: user.id,
    category: "COMPROVANTE",
    relation: { revenueId: record.id },
  });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Revenue",
    entityId: record.id,
    summary: `${user.name} ${id ? "atualizou" : "criou"} receita "${data.description}" de ${formatCurrency(data.grossAmount)}`,
  });

  revalidatePath("/receitas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRevenueAction(id: string) {
  const user = await requireUser();
  const revenue = await prisma.revenue.findUnique({ where: { id } });
  if (!revenue) return;

  await prisma.revenue.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Revenue",
    entityId: id,
    summary: `${user.name} excluiu a receita "${revenue.description}"`,
  });

  revalidatePath("/receitas");
  revalidatePath("/dashboard");
}
