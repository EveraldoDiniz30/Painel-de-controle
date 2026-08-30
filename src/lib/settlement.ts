import { prisma } from "@/lib/prisma";

export type PartnerSettlement = {
  partnerId: string;
  partnerName: string;
  sharePercentage: number;
  shouldHavePaid: number;
  actuallyPaid: number;
  difference: number; // positivo = pagou a mais (tem a receber); negativo = pagou a menos (deve)
};

export type SettlementResult = {
  totalExpenses: number;
  partners: PartnerSettlement[];
};

/**
 * Calcula o acerto de despesas societárias entre os sócios no período informado.
 * Não movimenta dinheiro — apenas apresenta quem pagou a mais ou a menos
 * em relação à participação societária configurada.
 */
export async function calculateSettlement(from: Date, to: Date): Promise<SettlementResult> {
  const partners = await prisma.partner.findMany({ where: { active: true } });

  const expenses = await prisma.expense.findMany({
    where: {
      date: { gte: from, lte: to },
      status: { not: "CANCELADA" },
    },
    select: { amount: true, paidById: true },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const paidByPartner = new Map<string, number>();
  for (const expense of expenses) {
    paidByPartner.set(
      expense.paidById,
      (paidByPartner.get(expense.paidById) ?? 0) + expense.amount
    );
  }

  const result: PartnerSettlement[] = partners.map((partner) => {
    const shouldHavePaid = (totalExpenses * partner.sharePercentage) / 100;
    const actuallyPaid = paidByPartner.get(partner.id) ?? 0;
    return {
      partnerId: partner.id,
      partnerName: partner.name,
      sharePercentage: partner.sharePercentage,
      shouldHavePaid,
      actuallyPaid,
      difference: actuallyPaid - shouldHavePaid,
    };
  });

  return { totalExpenses, partners: result };
}
