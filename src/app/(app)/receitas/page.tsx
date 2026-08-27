import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter } from "@/components/ui/period-filter";
import { ArrowDownCircle, Paperclip } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPeriodFromSearchParams } from "@/lib/period";
import { REVENUE_STATUS_LABELS } from "@/lib/labels";
import { NewRevenueButton, RevenueRowActions } from "./revenue-modals";

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  RECEBIDA: "success",
  PREVISTA: "warning",
  CANCELADA: "danger",
};

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [revenues, paymentMethods, categories] = await Promise.all([
    prisma.revenue.findMany({
      where: { date: { gte: from, lte: to } },
      include: { category: true, destinationAccount: true, documents: true },
      orderBy: { date: "desc" },
    }),
    prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { type: "RECEITA" }, orderBy: { name: "asc" } }),
  ]);

  const totalNet = revenues
    .filter((r) => r.status !== "CANCELADA")
    .reduce((sum, r) => sum + r.netAmount, 0);
  const totalReceived = revenues
    .filter((r) => r.status === "RECEBIDA")
    .reduce((sum, r) => sum + r.netAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Receitas</h1>
          <p className="text-sm text-muted">
            Total líquido no período: {formatCurrency(totalNet)} · Recebido: {formatCurrency(totalReceived)}
          </p>
        </div>
        <NewRevenueButton paymentMethods={paymentMethods} categories={categories} />
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      {revenues.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<ArrowDownCircle className="h-10 w-10" />}
            title="Nenhuma receita neste período"
            description="Registre uma receita com o botão acima."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Bruto</th>
                <th className="px-4 py-3 text-right font-medium">Líquido</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {revenues.map((revenue) => (
                <tr key={revenue.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(revenue.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {revenue.description}
                      {revenue.documents.length > 0 && (
                        <Paperclip className="h-3.5 w-3.5 text-muted" />
                      )}
                    </div>
                    {revenue.category && <p className="text-xs text-muted">{revenue.category.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted">{revenue.platform ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[revenue.status]}>
                      {REVENUE_STATUS_LABELS[revenue.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-muted">
                    {formatCurrency(revenue.grossAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(revenue.netAmount)}
                  </td>
                  <td className="px-2 py-3">
                    <RevenueRowActions
                      revenue={revenue}
                      paymentMethods={paymentMethods}
                      categories={categories}
                    />
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
