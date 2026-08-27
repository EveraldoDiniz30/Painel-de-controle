"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Expense, Partner, PaymentMethod, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { ExpenseForm } from "./expense-form";
import { deleteExpenseAction } from "./actions";

type Props = {
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  categories: Category[];
};

export function NewExpenseButton({ partners, paymentMethods, categories }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova despesa
      </Button>
      <Modal title="Nova despesa" open={open} onOpenChange={setOpen}>
        <ExpenseForm
          partners={partners}
          paymentMethods={paymentMethods}
          categories={categories}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

export function ExpenseRowActions({
  expense,
  partners,
  paymentMethods,
  categories,
}: Props & { expense: Expense }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteExpenseAction(expense.id)}
        confirmMessage={`Excluir a despesa "${expense.description}"?`}
      />
      <Modal title="Editar despesa" open={open} onOpenChange={setOpen}>
        <ExpenseForm
          partners={partners}
          paymentMethods={paymentMethods}
          categories={categories}
          expense={expense}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
