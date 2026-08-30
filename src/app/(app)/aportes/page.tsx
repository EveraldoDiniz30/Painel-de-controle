import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter } from "@/components/ui/period-filter";
import { HandCoins, Paperclip } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPeriodFromSearchParams } from "@/lib/period";
import { NewContributionButton, ContributionRowActions } from "./contribution-modals";

export default async function AportesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [contributions, partners, paymentMethods] = await Promise.all([
    prisma.contribution.findMany({
      where: { date: { gte: from, lte: to } },
      include: { partner: true, destinationAccount: true, documents: true },
      orderBy: { date: "desc" },
    }),
    prisma.partner.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const total = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Aportes de sócios</h1>
          <p className="text-sm text-muted">
            Total no período: {formatCurrency(total)} · Aportes não são receita operacional.
          </p>
        </div>
        <NewContributionButton partners={partners} paymentMethods={paymentMethods} />
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      {contributions.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<HandCoins className="h-10 w-10" />}
            title="Nenhum aporte neste período"
            description="Registre quando um sócio colocar dinheiro no negócio."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Sócio</th>
                <th className="px-4 py-3 font-medium">Destino</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(c.date)}</td>
                  <td className="px-4 py-3 font-medium">{c.partner.name}</td>
                  <td className="px-4 py-3 text-muted">{c.destinationAccount?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    <div className="flex items-center gap-1.5">
                      {c.originDescription ?? "—"}
                      {c.documents.length > 0 && <Paperclip className="h-3.5 w-3.5" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="px-2 py-3">
                    <ContributionRowActions
                      contribution={c}
                      partners={partners}
                      paymentMethods={paymentMethods}
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
