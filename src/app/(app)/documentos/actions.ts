"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";
import type { DocumentCategory } from "@prisma/client";
import type { ActionState } from "@/lib/validations";

const DOCUMENT_CATEGORIES = new Set<DocumentCategory>([
  "COMPROVANTE",
  "NOTA_FISCAL",
  "CARTAO",
  "RELATORIO",
  "MERCADO_LIVRE",
  "ANUNCIO",
  "CONTRATO",
  "FINANCEIRO",
  "OUTRO",
]);

export async function uploadDocumentAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string | null;

  if (!file || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }
  if (!category || !DOCUMENT_CATEGORIES.has(category as DocumentCategory)) {
    return { error: "Selecione uma categoria válida." };
  }

  let saved;
  try {
    saved = await saveUploadedFile(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao salvar o arquivo." };
  }

  const document = await prisma.document.create({
    data: {
      fileName: saved.fileName,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      size: saved.size,
      path: saved.path,
      category: category as DocumentCategory,
      uploadedById: user.id,
    },
  });

  await logAudit({
    userId: user.id,
    action: "CREATE",
    entity: "Document",
    entityId: document.id,
    summary: `${user.name} enviou o documento "${saved.originalName}"`,
  });

  revalidatePath("/documentos");
  return { success: true };
}

export async function deleteDocumentAction(id: string) {
  const user = await requireUser();
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return;

  await prisma.document.delete({ where: { id } });
  await deleteUploadedFile(document.path);

  await logAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Document",
    entityId: id,
    summary: `${user.name} excluiu o documento "${document.originalName}"`,
  });

  revalidatePath("/documentos");
}
