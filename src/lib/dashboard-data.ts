import { prisma } from "@/lib/prisma";
import { differenceInCalendarDays, format } from "date-fns";

export async function getDashboardKpis(from: Date, to: Date) {
  const [
    revenues,
    expenses,
    contributions,
    withdrawals,
    commissions,
    groupsCount,
    groupsAggregate,
    productsCount,
    clicksCount,
  ] = await Promise.all([
    prisma.revenue.findMany({ where: { date: { gte: from, lte: to } } }),
    prisma.expense.findMany({ where: { date: { gte: from, lte: to } } }),
    prisma.contribution.aggregate({
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
    prisma.withdrawal.aggregate({
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
    prisma.commission.findMany({ where: { date: { gte: from, lte: to } } }),
    prisma.group.count({ where: { status: "ATIVO" } }),
    prisma.group.aggregate({ _sum: { currentParticipants: true } }),
    prisma.product.count({ where: { status: "ATIVO" } }),
    prisma.click.count({ where: { createdAt: { gte: from, lte: to } } }),
  ]);

  const totalRevenue = revenues
    .filter((r) => r.status !== "CANCELADA")
    .reduce((sum, r) => sum + r.netAmount, 0);
  const totalExpense = expenses
    .filter((e) => e.status !== "CANCELADA")
    .reduce((sum, e) => sum + e.amount, 0);
  const netResult = totalRevenue - totalExpense;
  const margin = totalRevenue > 0 ? (netResult / totalRevenue) * 100 : 0;

  const commissionsPending = commissions
    .filter((c) => c.status === "PENDENTE" || c.status === "PREVISTA" || c.status === "APROVADA")
    .reduce((sum, c) => sum + c.commissionValue, 0);
  const commissionsReceived = commissions
    .filter((c) => c.status === "RECEBIDA")
    .reduce((sum, c) => sum + c.commissionValue, 0);

  return {
    totalRevenue,
    totalExpense,
    netResult,
    margin,
    contributions: contributions._sum.amount ?? 0,
    withdrawals: withdrawals._sum.amount ?? 0,
    commissionsPending,
    commissionsReceived,
    groupsCount,
    participantsCount: groupsAggregate._sum.currentParticipants ?? 0,
    productsCount,
    clicksCount,
    salesCount: commissions.length,
  };
}

export async function getFinancialTrend(from: Date, to: Date) {
  const [revenues, expenses] = await Promise.all([
    prisma.revenue.findMany({
      where: { date: { gte: from, lte: to }, status: { not: "CANCELADA" } },
      select: { date: true, netAmount: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: from, lte: to }, status: { not: "CANCELADA" } },
      select: { date: true, amount: true },
    }),
  ]);

  const daySpan = differenceInCalendarDays(to, from);
  const groupByMonth = daySpan > 62;
  const keyFor = (d: Date) => format(d, groupByMonth ? "yyyy-MM" : "yyyy-MM-dd");
  const labelFor = (key: string) =>
    groupByMonth
      ? format(new Date(`${key}-01T00:00:00`), "MMM/yy")
      : format(new Date(`${key}T00:00:00`), "dd/MM");

  const buckets = new Map<string, { receita: number; despesa: number }>();
  for (const r of revenues) {
    const key = keyFor(r.date);
    const b = buckets.get(key) ?? { receita: 0, despesa: 0 };
    b.receita += r.netAmount;
    buckets.set(key, b);
  }
  for (const e of expenses) {
    const key = keyFor(e.date);
    const b = buckets.get(key) ?? { receita: 0, despesa: 0 };
    b.despesa += e.amount;
    buckets.set(key, b);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      label: labelFor(key),
      receita: Math.round(value.receita * 100) / 100,
      despesa: Math.round(value.despesa * 100) / 100,
      resultado: Math.round((value.receita - value.despesa) * 100) / 100,
    }));
}

export async function getExpensesByCategory(from: Date, to: Date) {
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: from, lte: to }, status: { not: "CANCELADA" } },
    include: { category: true },
  });

  const map = new Map<string, number>();
  for (const e of expenses) {
    const label = e.category?.name ?? "Sem categoria";
    map.set(label, (map.get(label) ?? 0) + e.amount);
  }

  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

export async function getExpensesByPartner(from: Date, to: Date) {
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: from, lte: to }, status: { not: "CANCELADA" } },
    include: { paidBy: true },
  });

  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.paidBy.name, (map.get(e.paidBy.name) ?? 0) + e.amount);
  }

  return Array.from(map.entries()).map(([label, value]) => ({
    label,
    value: Math.round(value * 100) / 100,
  }));
}

export async function getExpensesByPaymentMethod(from: Date, to: Date) {
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: from, lte: to }, status: { not: "CANCELADA" } },
    include: { paymentMethod: { include: { owner: true } } },
  });

  const map = new Map<string, number>();
  for (const e of expenses) {
    const label = e.paymentMethod
      ? `${e.paymentMethod.name} — ${e.paymentMethod.owner.name}`
      : "Não informado";
    map.set(label, (map.get(label) ?? 0) + e.amount);
  }

  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}
