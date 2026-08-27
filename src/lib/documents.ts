import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import type { DocumentCategory } from "@prisma/client";

type DocumentRelation = {
  expenseId?: string;
  revenueId?: string;
  contributionId?: string;
  withdrawalId?: string;
  campaignId?: string;
  productId?: string;
  groupId?: string;
};

export async function attachDocumentIfPresent(params: {
  file: File | null | undefined;
  uploadedById: string;
  category?: DocumentCategory;
  relation: DocumentRelation;
}) {
  const { file, uploadedById, category, relation } = params;
  if (!file || file.size === 0) return null;

  const saved = await saveUploadedFile(file);

  return prisma.document.create({
    data: {
      fileName: saved.fileName,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      size: saved.size,
      path: saved.path,
      category: category ?? "COMPROVANTE",
      uploadedById,
      ...relation,
    },
  });
}
