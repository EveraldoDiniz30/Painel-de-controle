import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter } from "@/components/ui/period-filter";
import { Wallet, Paperclip } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPeriodFromSearchParams } from "@/lib/period";
import { NewWithdrawalButton, WithdrawalRowActions } from "./withdrawal-modals";

export default async function RetiradasPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [withdrawals, partners, paymentMethods] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { date: { gte: from, lte: to } },
      include: { partner: true, account: true, documents: true },
      orderBy: { date: "desc" },
    }),
    prisma.partner.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const total = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Retiradas de sócios</h1>
          <p className="text-sm text-muted">
            Total no período: {formatCurrency(total)} · Retiradas não são despesa operacional.
          </p>
        </div>
        <NewWithdrawalButton partners={partners} paymentMethods={paymentMethods} />
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      {withdrawals.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Wallet className="h-10 w-10" />}
            title="Nenhuma retirada neste período"
            description="Registre quando um sócio retirar dinheiro da sociedade."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Sócio</th>
                <th className="px-4 py-3 font-medium">Conta</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(w.date)}</td>
                  <td className="px-4 py-3 font-medium">{w.partner.name}</td>
                  <td className="px-4 py-3 text-muted">{w.account?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    <div className="flex items-center gap-1.5">
                      {w.reason ?? "—"}
                      {w.documents.length > 0 && <Paperclip className="h-3.5 w-3.5" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(w.amount)}
                  </td>
                  <td className="px-2 py-3">
                    <WithdrawalRowActions withdrawal={w} partners={partners} paymentMethods={paymentMethods} />
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
