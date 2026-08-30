"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";

export async function saveProductAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    platform: formData.get("platform") || undefined,
    price: formData.get("price") || undefined,
    originalUrl: formData.get("originalUrl") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const payload = {
    name: data.name,
    category: data.category || null,
    platform: data.platform || null,
    price: data.price ?? null,
    originalUrl: data.originalUrl || null,
    status: data.status,
    notes: data.notes || null,
  };

  const record = id
    ? await prisma.product.update({ where: { id }, data: payload })
    : await prisma.product.create({ data: payload });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Product",
    entityId: record.id,
    summary: `${user.name} ${id ? "atualizou" : "cadastrou"} o produto "${data.name}"`,
  });

  revalidatePath("/produtos");
  revalidatePath("/links");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const user = await requireUser();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Product",
    entityId: id,
    summary: `${user.name} excluiu o produto "${product.name}"`,
  });

  revalidatePath("/produtos");
}
