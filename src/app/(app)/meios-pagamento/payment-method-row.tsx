"use client";

import { useState } from "react";
import { Pencil, CreditCard, Wallet, Landmark, Smartphone, Banknote, MoreHorizontal } from "lucide-react";
import type { PaymentMethod, Partner } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PaymentMethodForm } from "./payment-method-form";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/lib/labels";

const ICONS: Record<string, typeof CreditCard> = {
  PIX: Smartphone,
  CARTAO_CREDITO: CreditCard,
  CARTAO_DEBITO: CreditCard,
  CONTA_BANCARIA: Landmark,
  CARTEIRA_DIGITAL: Wallet,
  DINHEIRO: Banknote,
  OUTRO: MoreHorizontal,
};

export function PaymentMethodRow({
  paymentMethod,
  partners,
}: {
  paymentMethod: PaymentMethod;
  partners: Partner[];
}) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[paymentMethod.type] ?? MoreHorizontal;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {paymentMethod.name}
            {paymentMethod.lastFourDigits && (
              <span className="text-muted"> •••• {paymentMethod.lastFourDigits}</span>
            )}
          </p>
          <p className="text-xs text-muted">
            {PAYMENT_METHOD_TYPE_LABELS[paymentMethod.type]}
            {paymentMethod.institution ? ` · ${paymentMethod.institution}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={paymentMethod.active ? "success" : "neutral"}>
          {paymentMethod.active ? "Ativo" : "Inativo"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <Modal title="Editar meio de pagamento" open={open} onOpenChange={setOpen}>
        <PaymentMethodForm
          partners={partners}
          paymentMethod={paymentMethod}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
