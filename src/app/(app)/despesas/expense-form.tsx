"use client";

import { useActionState, useEffect, useState } from "react";
import { saveExpenseAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EXPENSE_STATUS_LABELS } from "@/lib/labels";
import type { Expense, Partner, PaymentMethod, Category } from "@prisma/client";

function toDateInputValue(date?: Date | string) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function ExpenseForm({
  partners,
  paymentMethods,
  categories,
  expense,
  onDone,
}: {
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  categories: Category[];
  expense?: Expense;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveExpenseAction, undefined);
  const [paidById, setPaidById] = useState(expense?.paidById ?? "");

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  const availableMethods = paymentMethods.filter(
    (pm) => pm.ownerId === paidById && pm.active
  );

  return (
    <form action={formAction} className="space-y-4">
      {expense && <input type="hidden" name="id" value={expense.id} />}

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          defaultValue={expense?.description}
          placeholder="Ex: Meta Ads"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={expense?.amount}
          />
        </div>
        <div>
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={toDateInputValue(expense?.date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="paidById">Quem pagou</Label>
          <Select
            id="paidById"
            name="paidById"
            required
            value={paidById}
            onChange={(e) => setPaidById(e.target.value)}
          >
            <option value="">Selecione</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentMethodId">Meio de pagamento</Label>
          <Select
            id="paymentMethodId"
            name="paymentMethodId"
            defaultValue={expense?.paymentMethodId ?? ""}
            disabled={!paidById}
          >
            <option value="">
              {paidById ? "Selecione" : "Selecione quem pagou primeiro"}
            </option>
            {availableMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
                {pm.lastFourDigits ? ` •••• ${pm.lastFourDigits}` : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select id="categoryId" name="categoryId" defaultValue={expense?.categoryId ?? ""}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={expense?.status ?? "PAGA"}>
            {Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="projectName">Projeto relacionado</Label>
        <Input
          id="projectName"
          name="projectName"
          defaultValue={expense?.projectName ?? ""}
          placeholder="Ex: MJ Ofertas"
        />
      </div>

      <div>
        <Label htmlFor="document">Comprovante (PDF ou imagem)</Label>
        <Input id="document" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" />
      </div>

      <div>
        <Label htmlFor="notes">Observação</Label>
        <Textarea id="notes" name="notes" defaultValue={expense?.notes ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="recurring"
          defaultChecked={expense?.recurring}
          className="rounded"
        />
        Despesa recorrente
      </label>

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
