import { PrismaClient, PaymentMethodType, CategoryType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertPartnerWithUser(params: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      name: params.name,
      email: params.email,
      passwordHash,
      role: "ADMINISTRADOR",
    },
  });

  const partner = await prisma.partner.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      name: params.name,
      userId: user.id,
      sharePercentage: 50,
    },
  });

  return { user, partner };
}

async function main() {
  const { partner: junior } = await upsertPartnerWithUser({
    name: "Júnior",
    email: "junior@mjofertas.com",
    password: "mudar123",
  });

  const { partner: maike } = await upsertPartnerWithUser({
    name: "Maike",
    email: "maike@mjofertas.com",
    password: "mudar123",
  });

  const paymentMethodsSeed = [
    { name: "Cartão Mercado Pago", owner: junior, type: PaymentMethodType.CARTAO_CREDITO, institution: "Mercado Pago" },
    { name: "Cartão Nubank", owner: junior, type: PaymentMethodType.CARTAO_CREDITO, institution: "Nubank" },
    { name: "Pix", owner: junior, type: PaymentMethodType.PIX, institution: null },
    { name: "Conta Mercado Pago", owner: junior, type: PaymentMethodType.CONTA_BANCARIA, institution: "Mercado Pago" },
    { name: "Cartão Mercado Pago", owner: maike, type: PaymentMethodType.CARTAO_CREDITO, institution: "Mercado Pago" },
    { name: "Cartão Nubank", owner: maike, type: PaymentMethodType.CARTAO_CREDITO, institution: "Nubank" },
    { name: "Pix", owner: maike, type: PaymentMethodType.PIX, institution: null },
    { name: "Conta Mercado Pago", owner: maike, type: PaymentMethodType.CONTA_BANCARIA, institution: "Mercado Pago" },
  ];

  for (const pm of paymentMethodsSeed) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: pm.name, ownerId: pm.owner.id, type: pm.type },
    });
    if (!existing) {
      await prisma.paymentMethod.create({
        data: {
          name: pm.name,
          ownerId: pm.owner.id,
          type: pm.type,
          institution: pm.institution ?? undefined,
        },
      });
    }
  }

  const expenseCategories = [
    "Marketing",
    "Ferramentas",
    "Hospedagem",
    "Domínio",
    "Automação",
    "Design",
    "Serviços",
    "Outros",
  ];
  for (const name of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { name, type: CategoryType.DESPESA, parentId: null },
    });
    if (!existing) {
      await prisma.category.create({ data: { name, type: CategoryType.DESPESA } });
    }
  }

  const revenueCategories = ["Comissão de Afiliados", "Publicidade em Grupo", "Outros"];
  for (const name of revenueCategories) {
    const existing = await prisma.category.findFirst({
      where: { name, type: CategoryType.RECEITA, parentId: null },
    });
    if (!existing) {
      await prisma.category.create({ data: { name, type: CategoryType.RECEITA } });
    }
  }

  console.log("Seed concluído.");
  console.log("Login Júnior: junior@mjofertas.com / mudar123");
  console.log("Login Maike:  maike@mjofertas.com / mudar123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
