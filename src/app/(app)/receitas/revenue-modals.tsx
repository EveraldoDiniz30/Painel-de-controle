"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Revenue, PaymentMethod, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { RevenueForm } from "./revenue-form";
import { deleteRevenueAction } from "./actions";

type Props = { paymentMethods: PaymentMethod[]; categories: Category[] };

export function NewRevenueButton({ paymentMethods, categories }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova receita
      </Button>
      <Modal title="Nova receita" open={open} onOpenChange={setOpen}>
        <RevenueForm paymentMethods={paymentMethods} categories={categories} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function RevenueRowActions({
  revenue,
  paymentMethods,
  categories,
}: Props & { revenue: Revenue }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteRevenueAction(revenue.id)}
        confirmMessage={`Excluir a receita "${revenue.description}"?`}
      />
      <Modal title="Editar receita" open={open} onOpenChange={setOpen}>
        <RevenueForm
          paymentMethods={paymentMethods}
          categories={categories}
          revenue={revenue}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
