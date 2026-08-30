import type { Prisma } from "@prisma/client";

export type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    expense: true;
    revenue: true;
    contribution: { include: { partner: true } };
    withdrawal: { include: { partner: true } };
    campaign: true;
    product: true;
    group: true;
    uploadedBy: true;
  };
}>;

export function getDocumentRelationLabel(doc: DocumentWithRelations): string {
  if (doc.expense) return `Despesa · ${doc.expense.description}`;
  if (doc.revenue) return `Receita · ${doc.revenue.description}`;
  if (doc.contribution) return `Aporte · ${doc.contribution.partner.name}`;
  if (doc.withdrawal) return `Retirada · ${doc.withdrawal.partner.name}`;
  if (doc.campaign) return `Campanha · ${doc.campaign.name}`;
  if (doc.product) return `Produto · ${doc.product.name}`;
  if (doc.group) return `Grupo · ${doc.group.name}`;
  return "Avulso";
}
