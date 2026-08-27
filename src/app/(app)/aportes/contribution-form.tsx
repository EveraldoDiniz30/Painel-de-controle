"use client";

import { useActionState, useEffect } from "react";
import { saveContributionAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Contribution, Partner, PaymentMethod } from "@prisma/client";

function toDateInputValue(date?: Date | string) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function ContributionForm({
  partners,
  paymentMethods,
  contribution,
  onDone,
}: {
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  contribution?: Contribution;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveContributionAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {contribution && <input type="hidden" name="id" value={contribution.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="partnerId">Sócio</Label>
          <Select id="partnerId" name="partnerId" required defaultValue={contribution?.partnerId}>
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
            defaultValue={contribution?.amount}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required defaultValue={toDateInputValue(contribution?.date)} />
        </div>
        <div>
          <Label htmlFor="destinationAccountId">Conta de destino</Label>
          <Select
            id="destinationAccountId"
            name="destinationAccountId"
            defaultValue={contribution?.destinationAccountId ?? ""}
          >
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
        <Label htmlFor="originDescription">Origem do dinheiro</Label>
        <Input
          id="originDescription"
          name="originDescription"
          defaultValue={contribution?.originDescription ?? ""}
          placeholder="Ex: Conta pessoal do sócio"
        />
      </div>

      <div>
        <Label htmlFor="document">Comprovante</Label>
        <Input id="document" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" />
      </div>

      <div>
        <Label htmlFor="notes">Observação</Label>
        <Textarea id="notes" name="notes" defaultValue={contribution?.notes ?? ""} />
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
