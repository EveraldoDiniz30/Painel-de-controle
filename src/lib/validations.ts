import { z } from "zod";

export const partnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Informe o nome"),
  sharePercentage: z.coerce.number().min(0).max(100),
  active: z.coerce.boolean(),
  notes: z.string().trim().optional(),
});

export const paymentMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Informe o nome"),
  ownerId: z.string().min(1, "Selecione o proprietário"),
  type: z.enum([
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "CONTA_BANCARIA",
    "CARTEIRA_DIGITAL",
    "DINHEIRO",
    "OUTRO",
  ]),
  institution: z.string().trim().optional(),
  lastFourDigits: z
    .string()
    .trim()
    .max(4)
    .regex(/^\d*$/, "Apenas números")
    .optional(),
  creditLimit: z.coerce.number().nonnegative().optional().or(z.literal("").transform(() => undefined)),
  active: z.coerce.boolean(),
  notes: z.string().trim().optional(),
});

export const expenseSchema = z.object({
  id: z.string().optional(),
  date: z.coerce.date(),
  description: z.string().trim().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  categoryId: z.string().trim().optional(),
  paidById: z.string().min(1, "Selecione quem pagou"),
  paymentMethodId: z.string().trim().optional(),
  status: z.enum(["PENDENTE", "PAGA", "CANCELADA"]),
  recurring: z.coerce.boolean(),
  projectName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const revenueSchema = z.object({
  id: z.string().optional(),
  date: z.coerce.date(),
  description: z.string().trim().min(1, "Informe a descrição"),
  platform: z.string().trim().optional(),
  source: z.string().trim().optional(),
  grossAmount: z.coerce.number().positive("Informe um valor maior que zero"),
  fees: z.coerce.number().nonnegative().default(0),
  categoryId: z.string().trim().optional(),
  status: z.enum(["PREVISTA", "RECEBIDA", "CANCELADA"]),
  destinationAccountId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const contributionSchema = z.object({
  id: z.string().optional(),
  partnerId: z.string().min(1, "Selecione o sócio"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  date: z.coerce.date(),
  originDescription: z.string().trim().optional(),
  destinationAccountId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const withdrawalSchema = z.object({
  id: z.string().optional(),
  partnerId: z.string().min(1, "Selecione o sócio"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  date: z.coerce.date(),
  reason: z.string().trim().optional(),
  accountId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type ActionState = { error?: string; success?: boolean };
