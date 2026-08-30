import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter } from "@/components/ui/period-filter";
import { Link2, MousePointerClick } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getPeriodFromSearchParams } from "@/lib/period";
import { getClicksBySource } from "@/lib/dashboard-data";
import { MagnitudeBarChart } from "@/components/charts/magnitude-bar-chart";
import { NewLinkButton, LinkRowActions } from "./link-modals";
import { CopyLinkButton } from "./copy-link-button";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [links, products, clicksBySource] = await Promise.all([
    prisma.affiliateLink.findMany({
      include: {
        product: true,
        _count: { select: { clicks: true } },
        clicks: { where: { createdAt: { gte: from, lte: to } }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({ where: { status: "ATIVO" }, orderBy: { name: "asc" } }),
    getClicksBySource(from, to),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Links de divulgação</h1>
          <p className="text-sm text-muted">
            Cada link tem uma origem própria — compartilhe versões diferentes por canal
            (grupo, anúncio) para ver de onde vêm os cliques de verdade.
          </p>
        </div>
        <NewLinkButton products={products} />
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Cliques por origem no período</CardTitle>
        </CardHeader>
        <CardContent>
          <MagnitudeBarChart
            data={clicksBySource}
            categorical
            valueType="count"
            emptyLabel="Nenhum clique registrado no período"
          />
        </CardContent>
      </Card>

      {links.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Link2 className="h-10 w-10" />}
            title="Nenhum link criado"
            description="Crie um link para um produto e escolha a origem (WhatsApp, Meta Ads, etc)."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 text-right font-medium">Cliques (período)</th>
                <th className="px-4 py-3 text-right font-medium">Cliques (total)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <CopyLinkButton slug={link.slug} />
                  </td>
                  <td className="px-4 py-3 font-medium">{link.product.name}</td>
                  <td className="px-4 py-3 text-muted">{link.source}</td>
                  <td className="px-4 py-3">
                    <Badge tone={link.status === "ATIVO" ? "success" : "neutral"}>
                      {link.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(link.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3.5 w-3.5 text-muted" />
                      {link.clicks.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{link._count.clicks}</td>
                  <td className="px-2 py-3">
                    <LinkRowActions link={link} products={products} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
