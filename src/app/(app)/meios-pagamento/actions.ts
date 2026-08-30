"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";

export async function savePaymentMethodAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = paymentMethodSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    ownerId: formData.get("ownerId"),
    type: formData.get("type"),
    institution: formData.get("institution") ?? undefined,
    lastFourDigits: formData.get("lastFourDigits") ?? undefined,
    creditLimit: formData.get("creditLimit") ?? undefined,
    active: formData.get("active") === "on",
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const payload = {
    name: data.name,
    ownerId: data.ownerId,
    type: data.type,
    institution: data.institution || null,
    lastFourDigits: data.lastFourDigits || null,
    creditLimit: data.creditLimit ?? null,
    active: data.active,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.paymentMethod.update({ where: { id }, data: payload })
    : await prisma.paymentMethod.create({ data: payload });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "PaymentMethod",
    entityId: record.id,
    summary: `${user.name} ${id ? "atualizou" : "cadastrou"} o meio de pagamento "${data.name}"`,
  });

  revalidatePath("/meios-pagamento");
  return { success: true };
}
