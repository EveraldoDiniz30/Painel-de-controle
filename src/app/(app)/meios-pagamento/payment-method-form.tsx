"use client";

import { useActionState, useEffect } from "react";
import { savePaymentMethodAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/lib/labels";
import type { PaymentMethod, Partner } from "@prisma/client";

export function PaymentMethodForm({
  partners,
  paymentMethod,
  onDone,
}: {
  partners: Partner[];
  paymentMethod?: PaymentMethod;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(savePaymentMethodAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {paymentMethod && <input type="hidden" name="id" value={paymentMethod.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={paymentMethod?.name}
            placeholder="Ex: Cartão Nubank"
          />
        </div>
        <div>
          <Label htmlFor="ownerId">Proprietário</Label>
          <Select id="ownerId" name="ownerId" required defaultValue={paymentMethod?.ownerId}>
            <option value="">Selecione</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" name="type" required defaultValue={paymentMethod?.type ?? "PIX"}>
            {Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="institution">Instituição</Label>
          <Input
            id="institution"
            name="institution"
            defaultValue={paymentMethod?.institution ?? ""}
            placeholder="Ex: Mercado Pago"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
          <Input
            id="lastFourDigits"
            name="lastFourDigits"
            maxLength={4}
            defaultValue={paymentMethod?.lastFourDigits ?? ""}
            placeholder="0000"
          />
        </div>
        <div>
          <Label htmlFor="creditLimit">Limite (se aplicável)</Label>
          <Input
            id="creditLimit"
            name="creditLimit"
            type="number"
            step="0.01"
            defaultValue={paymentMethod?.creditLimit ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={paymentMethod?.notes ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked={paymentMethod?.active ?? true}
          className="rounded"
        />
        Ativo
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
