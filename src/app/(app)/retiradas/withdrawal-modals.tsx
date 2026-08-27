"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Withdrawal, Partner, PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { WithdrawalForm } from "./withdrawal-form";
import { deleteWithdrawalAction } from "./actions";

type Props = { partners: Partner[]; paymentMethods: PaymentMethod[] };

export function NewWithdrawalButton({ partners, paymentMethods }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova retirada
      </Button>
      <Modal title="Nova retirada de sócio" open={open} onOpenChange={setOpen}>
        <WithdrawalForm partners={partners} paymentMethods={paymentMethods} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function WithdrawalRowActions({
  withdrawal,
  partners,
  paymentMethods,
}: Props & { withdrawal: Withdrawal }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteWithdrawalAction(withdrawal.id)}
        confirmMessage="Excluir esta retirada?"
      />
      <Modal title="Editar retirada" open={open} onOpenChange={setOpen}>
        <WithdrawalForm
          partners={partners}
          paymentMethods={paymentMethods}
          withdrawal={withdrawal}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
