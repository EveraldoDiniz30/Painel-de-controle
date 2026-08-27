import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter } from "@/components/ui/period-filter";
import { ArrowUpCircle, Paperclip } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPeriodFromSearchParams } from "@/lib/period";
import { EXPENSE_STATUS_LABELS } from "@/lib/labels";
import { NewExpenseButton, ExpenseRowActions } from "./expense-modals";

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  PAGA: "success",
  PENDENTE: "warning",
  CANCELADA: "danger",
};

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { from, to } = getPeriodFromSearchParams(sp);

  const [expenses, partners, paymentMethods, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
      include: { paidBy: true, paymentMethod: true, category: true, documents: true },
      orderBy: { date: "desc" },
    }),
    prisma.partner.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { type: "DESPESA" }, orderBy: { name: "asc" } }),
  ]);

  const total = expenses
    .filter((e) => e.status !== "CANCELADA")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Despesas</h1>
          <p className="text-sm text-muted">Total no período: {formatCurrency(total)}</p>
        </div>
        <NewExpenseButton partners={partners} paymentMethods={paymentMethods} categories={categories} />
      </div>

      <Suspense>
        <PeriodFilter />
      </Suspense>

      {expenses.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<ArrowUpCircle className="h-10 w-10" />}
            title="Nenhuma despesa neste período"
            description="Registre uma despesa com o botão acima."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Pago por</th>
                <th className="px-4 py-3 font-medium">Meio</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {expense.description}
                      {expense.documents.length > 0 && (
                        <Paperclip className="h-3.5 w-3.5 text-muted" />
                      )}
                    </div>
                    {expense.projectName && (
                      <p className="text-xs text-muted">{expense.projectName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{expense.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{expense.paidBy.name}</td>
                  <td className="px-4 py-3 text-muted">{expense.paymentMethod?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[expense.status]}>
                      {EXPENSE_STATUS_LABELS[expense.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-2 py-3">
                    <ExpenseRowActions
                      expense={expense}
                      partners={partners}
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
