"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { affiliateLinkSchema, type ActionState } from "@/lib/validations";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { generateSlug } from "@/lib/slug";

async function uniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const existing = await prisma.affiliateLink.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error("Não foi possível gerar um link único. Tente novamente.");
}

export async function saveAffiliateLinkAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = affiliateLinkSchema.safeParse({
    id: formData.get("id") || undefined,
    productId: formData.get("productId"),
    url: formData.get("url"),
    source: formData.get("source"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { id, ...data } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return { error: "Produto não encontrado" };

  const record = id
    ? await prisma.affiliateLink.update({
        where: { id },
        data: { url: data.url, source: data.source, status: data.status },
      })
    : await prisma.affiliateLink.create({
        data: {
          slug: await uniqueSlug(),
          productId: data.productId,
          url: data.url,
          source: data.source,
          status: data.status,
        },
      });

  await logAudit({
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "AffiliateLink",
    entityId: record.id,
    summary: `${user.name} ${id ? "atualizou" : "criou"} um link de "${product.name}" para a origem "${data.source}"`,
  });

  revalidatePath("/links");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAffiliateLinkAction(id: string) {
  const user = await requireUser();
  const link = await prisma.affiliateLink.findUnique({ where: { id }, include: { product: true } });
  if (!link) return;

  await prisma.affiliateLink.delete({ where: { id } });

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "AffiliateLink",
    entityId: id,
    summary: `${user.name} excluiu o link de "${link.product.name}" (origem: ${link.source})`,
  });

  revalidatePath("/links");
  revalidatePath("/dashboard");
}
