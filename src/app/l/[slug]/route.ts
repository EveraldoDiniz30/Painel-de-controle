import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const link = await prisma.affiliateLink.findUnique({ where: { slug } });

  if (!link || link.status !== "ATIVO") {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  await prisma.click.create({ data: { affiliateLinkId: link.id } });

  return NextResponse.redirect(link.url, { status: 302 });
}
