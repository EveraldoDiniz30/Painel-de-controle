"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Contribution, Partner, PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { ContributionForm } from "./contribution-form";
import { deleteContributionAction } from "./actions";

type Props = { partners: Partner[]; paymentMethods: PaymentMethod[] };

export function NewContributionButton({ partners, paymentMethods }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo aporte
      </Button>
      <Modal title="Novo aporte de sócio" open={open} onOpenChange={setOpen}>
        <ContributionForm partners={partners} paymentMethods={paymentMethods} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function ContributionRowActions({
  contribution,
  partners,
  paymentMethods,
}: Props & { contribution: Contribution }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteContributionAction(contribution.id)}
        confirmMessage="Excluir este aporte?"
      />
      <Modal title="Editar aporte" open={open} onOpenChange={setOpen}>
        <ContributionForm
          partners={partners}
          paymentMethods={paymentMethods}
          contribution={contribution}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
