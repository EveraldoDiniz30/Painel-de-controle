import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  try {
    const buffer = await readFile(resolveUploadPath(document.path));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `inline; filename="${document.originalName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
