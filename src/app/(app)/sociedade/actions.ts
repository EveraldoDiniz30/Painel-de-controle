"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { partnerSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";

export async function updatePartnerAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = partnerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    sharePercentage: formData.get("sharePercentage"),
    active: formData.get("active") === "on",
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;

  await prisma.partner.update({
    where: { id },
    data: {
      name: data.name,
      sharePercentage: data.sharePercentage,
      active: data.active,
      notes: data.notes || null,
    },
  });

  await logAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Partner",
    entityId: id,
    summary: `${user.name} atualizou a participação de ${data.name} para ${data.sharePercentage}%`,
  });

  revalidatePath("/sociedade");
  revalidatePath("/dashboard");
  revalidatePath("/acerto");
  return { success: true };
}
