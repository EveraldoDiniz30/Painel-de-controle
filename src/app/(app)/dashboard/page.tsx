import { Suspense } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Percent,
  HandCoins,
  Wallet,
  Percent as CommissionIcon,
  CheckCircle2,
  MessagesSquare,
  Users,
  Package,
  MousePointerClick,
  Receipt,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PeriodFilter } from "@/components/ui/period-filter";
import { StatCard } from "@/components/ui/stat-card";
import { FinancialTrendChart } from "@/components/charts/financial-trend-chart";
import { MagnitudeBarChart } from "@/components/charts/magnitude-bar-chart";
import { getPeriodFromSearchParams } from "@/lib/period";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  getDashboardKpis,
  getFinancialTrend,
  getExpensesByCategory,
  getExpensesByPartner,
  getExpensesByPaymentMethod,
} from "@/lib/dashboard-data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [kpis, trend, byCategory, byPartner, byPaymentMethod] = await Promise.all([
    getDashboardKpis(from, to),
    getFinancialTrend(from, to),
    getExpensesByCategory(from, to),
    getExpensesByPartner(from, to),
    getExpensesByPaymentMethod(from, to),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Visão geral do MJ Ofertas no período selecionado.</p>
        </div>
        <Suspense>
          <PeriodFilter />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Receita total" value={formatCurrency(kpis.totalRevenue)} icon={ArrowDownCircle} tone="success" />
        <StatCard label="Despesas" value={formatCurrency(kpis.totalExpense)} icon={ArrowUpCircle} tone="danger" />
        <StatCard
          label="Resultado líquido"
          value={formatCurrency(kpis.netResult)}
          icon={TrendingUp}
          tone={kpis.netResult >= 0 ? "success" : "danger"}
        />
        <StatCard label="Margem" value={formatPercent(kpis.margin)} icon={Percent} tone="brand" />
        <StatCard label="Aportes de sócios" value={formatCurrency(kpis.contributions)} icon={HandCoins} tone="brand" />
        <StatCard label="Retiradas de sócios" value={formatCurrency(kpis.withdrawals)} icon={Wallet} tone="neutral" />
        <StatCard
          label="Comissões pendentes"
          value={formatCurrency(kpis.commissionsPending)}
          icon={CommissionIcon}
          tone="neutral"
        />
        <StatCard
          label="Comissões recebidas"
          value={formatCurrency(kpis.commissionsReceived)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Grupos ativos" value={String(kpis.groupsCount)} icon={MessagesSquare} tone="neutral" />
        <StatCard label="Participantes" value={String(kpis.participantsCount)} icon={Users} tone="neutral" />
        <StatCard label="Produtos divulgados" value={String(kpis.productsCount)} icon={Package} tone="neutral" />
        <StatCard label="Cliques" value={String(kpis.clicksCount)} icon={MousePointerClick} tone="neutral" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita, despesa e resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialTrendChart data={trend} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <MagnitudeBarChart data={byCategory} emptyLabel="Nenhuma despesa categorizada" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos por sócio</CardTitle>
          </CardHeader>
          <CardContent>
            <MagnitudeBarChart data={byPartner} categorical emptyLabel="Nenhuma despesa no período" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas por meio de pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <MagnitudeBarChart data={byPaymentMethod} emptyLabel="Nenhuma despesa no período" />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 pt-5 text-sm text-muted">
          <Receipt className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Vendas registradas (via comissões) no período:{" "}
            <strong className="text-foreground">{kpis.salesCount}</strong>. Grupos, produtos e
            comissões ainda não têm cadastro próprio — os números acima refletem o banco de dados
            real e ficarão completos nas próximas fases (ver roadmap).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
