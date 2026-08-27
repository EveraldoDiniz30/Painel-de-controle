import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { NewPaymentMethodButton } from "./new-payment-method-button";
import { PaymentMethodRow } from "./payment-method-row";

export default async function MeiosPagamentoPage() {
  const [partners, paymentMethods] = await Promise.all([
    prisma.partner.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Meios de pagamento</h1>
          <p className="text-sm text-muted">
            Cadastre livremente os cartões, contas e chaves Pix de cada sócio.
          </p>
        </div>
        <NewPaymentMethodButton partners={partners} />
      </div>

      {paymentMethods.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Wallet className="h-10 w-10" />}
            title="Nenhum meio de pagamento cadastrado"
            description="Cadastre cartões, contas e chaves Pix para usar nas despesas e receitas."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {partners.map((partner) => {
            const methods = paymentMethods.filter((pm) => pm.ownerId === partner.id);
            if (methods.length === 0) return null;
            return (
              <Card key={partner.id}>
                <CardHeader>
                  <CardTitle>{partner.name}</CardTitle>
                </CardHeader>
                <div>
                  {methods.map((pm) => (
                    <PaymentMethodRow key={pm.id} paymentMethod={pm} partners={partners} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
