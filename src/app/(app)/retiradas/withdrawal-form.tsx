"use client";

import { useActionState, useEffect } from "react";
import { saveWithdrawalAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Withdrawal, Partner, PaymentMethod } from "@prisma/client";

function toDateInputValue(date?: Date | string) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function WithdrawalForm({
  partners,
  paymentMethods,
  withdrawal,
  onDone,
}: {
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  withdrawal?: Withdrawal;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveWithdrawalAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {withdrawal && <input type="hidden" name="id" value={withdrawal.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="partnerId">Sócio</Label>
          <Select id="partnerId" name="partnerId" required defaultValue={withdrawal?.partnerId}>
            <option value="">Selecione</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={withdrawal?.amount}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required defaultValue={toDateInputValue(withdrawal?.date)} />
        </div>
        <div>
          <Label htmlFor="accountId">Conta</Label>
          <Select id="accountId" name="accountId" defaultValue={withdrawal?.accountId ?? ""}>
            <option value="">Não informado</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Motivo</Label>
        <Input id="reason" name="reason" defaultValue={withdrawal?.reason ?? ""} placeholder="Ex: Pró-labore" />
      </div>

      <div>
        <Label htmlFor="document">Comprovante</Label>
        <Input id="document" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" />
      </div>

      <div>
        <Label htmlFor="notes">Observação</Label>
        <Textarea id="notes" name="notes" defaultValue={withdrawal?.notes ?? ""} />
      </div>

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
