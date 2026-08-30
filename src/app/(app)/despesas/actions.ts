"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { expenseSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { attachDocumentIfPresent } from "@/lib/documents";
import { formatCurrency } from "@/lib/format";

export async function saveExpenseAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = expenseSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") || undefined,
    paidById: formData.get("paidById"),
    paymentMethodId: formData.get("paymentMethodId") || undefined,
    status: formData.get("status"),
    recurring: formData.get("recurring") === "on",
    projectName: formData.get("projectName") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const payload = {
    date: data.date,
    description: data.description,
    amount: data.amount,
    categoryId: data.categoryId || null,
    paidById: data.paidById,
    paymentMethodId: data.paymentMethodId || null,
    status: data.status,
    recurring: data.recurring,
    projectName: data.projectName || null,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.expense.update({ where: { id }, data: payload })
    : await prisma.expense.create({ data: payload });

  const file = formData.get("document") as File | null;
  await attachDocumentIfPresent({
    file,
    uploadedById: user.id,
    category: "COMPROVANTE",
    relation: { expenseId: record.id },
  });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Expense",
    entityId: record.id,
    summary: `${user.name} ${id ? "atualizou" : "criou"} despesa "${data.description}" de ${formatCurrency(data.amount)}`,
  });

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  revalidatePath("/acerto");
  return { success: true };
}

export async function deleteExpenseAction(id: string) {
  const user = await requireUser();
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return;

  await prisma.expense.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Expense",
    entityId: id,
    summary: `${user.name} excluiu a despesa "${expense.description}"`,
  });

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  revalidatePath("/acerto");
}
