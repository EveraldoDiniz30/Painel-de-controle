export const PAYMENT_METHOD_TYPE_LABELS: Record<string, string> = {
  PIX: "Pix",
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  CONTA_BANCARIA: "Conta bancária",
  CARTEIRA_DIGITAL: "Carteira digital",
  DINHEIRO: "Dinheiro",
  OUTRO: "Outro",
};

export const EXPENSE_STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  CANCELADA: "Cancelada",
};

export const REVENUE_STATUS_LABELS: Record<string, string> = {
  PREVISTA: "Prevista",
  RECEBIDA: "Recebida",
  CANCELADA: "Cancelada",
};

// Origens de clique sugeridas para os links de afiliado — o campo continua
// sendo texto livre no banco, então novas origens não exigem migração.
export const CLICK_SOURCE_PRESETS = [
  "Grupo de WhatsApp",
  "Meta Ads (Facebook/Instagram)",
  "Google Ads",
  "Orgânico (outro)",
];

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  ESGOTADO: "Esgotado",
};

export const AFFILIATE_LINK_STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  COMPROVANTE: "Comprovante",
  NOTA_FISCAL: "Nota fiscal",
  CARTAO: "Cartão",
  RELATORIO: "Relatório",
  MERCADO_LIVRE: "Mercado Livre",
  ANUNCIO: "Anúncio",
  CONTRATO: "Contrato",
  FINANCEIRO: "Financeiro",
  OUTRO: "Outro",
};
