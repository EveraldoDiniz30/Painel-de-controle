import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/ui/period-filter";
import { calculateSettlement } from "@/lib/settlement";
import { getPeriodFromSearchParams } from "@/lib/period";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Scale, TrendingUp, TrendingDown } from "lucide-react";

export default async function AcertoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);
  const { totalExpenses, partners } = await calculateSettlement(from, to);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Acerto entre sócios</h1>
        <p className="text-sm text-muted">
          Compara quanto cada sócio deveria ter pago nas despesas da sociedade, de acordo com a
          participação configurada, com quanto de fato pagou. O sistema apenas calcula e
          apresenta — nenhuma transferência é feita automaticamente.
        </p>
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Despesas da sociedade no período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((p) => {
          const isCredit = p.difference > 0.005;
          const isDebit = p.difference < -0.005;
          return (
            <Card key={p.partnerId}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{p.partnerName}</p>
                  <span className="text-xs text-muted">{formatPercent(p.sharePercentage)} da sociedade</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Deveria ter pago</p>
                    <p className="font-medium text-foreground">{formatCurrency(p.shouldHavePaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Pagou de fato</p>
                    <p className="font-medium text-foreground">{formatCurrency(p.actuallyPaid)}</p>
                  </div>
                </div>

                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isCredit
                      ? "bg-success-soft text-success"
                      : isDebit
                        ? "bg-danger-soft text-danger"
                        : "bg-gray-100 text-muted"
                  }`}
                >
                  {isCredit && <TrendingUp className="h-4 w-4 shrink-0" />}
                  {isDebit && <TrendingDown className="h-4 w-4 shrink-0" />}
                  {!isCredit && !isDebit && <Scale className="h-4 w-4 shrink-0" />}
                  <span>
                    {isCredit &&
                      `${p.partnerName} pagou ${formatCurrency(p.difference)} acima da sua parte — tem a receber da sociedade.`}
                    {isDebit &&
                      `${p.partnerName} pagou ${formatCurrency(Math.abs(p.difference))} abaixo da sua parte — deve à sociedade.`}
                    {!isCredit && !isDebit && "Contas em dia com a sociedade."}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
