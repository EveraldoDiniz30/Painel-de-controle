import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-excel",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function saveUploadedFile(file: File): Promise<{
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type || "desconhecido"}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Arquivo excede o tamanho máximo de 15MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = path.extname(file.name).slice(0, 10);
  const fileName = `${randomUUID()}${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    fileName,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    path: fileName,
  };
}

export function resolveUploadPath(fileName: string): string {
  return path.join(UPLOAD_DIR, path.basename(fileName));
}
