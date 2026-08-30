"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { saveRevenueAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REVENUE_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import type { Revenue, PaymentMethod, Category } from "@prisma/client";

function toDateInputValue(date?: Date | string) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function RevenueForm({
  paymentMethods,
  categories,
  revenue,
  onDone,
}: {
  paymentMethods: PaymentMethod[];
  categories: Category[];
  revenue?: Revenue;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveRevenueAction, undefined);
  const [gross, setGross] = useState(revenue?.grossAmount ?? 0);
  const [fees, setFees] = useState(revenue?.fees ?? 0);

  const net = useMemo(() => Math.max(gross - fees, 0), [gross, fees]);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {revenue && <input type="hidden" name="id" value={revenue.id} />}

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          defaultValue={revenue?.description}
          placeholder="Ex: Comissão Mercado Livre"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Input id="platform" name="platform" defaultValue={revenue?.platform ?? ""} placeholder="Ex: Mercado Livre" />
        </div>
        <div>
          <Label htmlFor="source">Origem</Label>
          <Input id="source" name="source" defaultValue={revenue?.source ?? ""} placeholder="Ex: Grupo Ofertas SP" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="grossAmount">Valor bruto</Label>
          <Input
            id="grossAmount"
            name="grossAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={revenue?.grossAmount}
            onChange={(e) => setGross(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="fees">Taxas</Label>
          <Input
            id="fees"
            name="fees"
            type="number"
            step="0.01"
            min="0"
            defaultValue={revenue?.fees ?? 0}
            onChange={(e) => setFees(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <p className="text-sm text-muted">
        Valor líquido: <span className="font-medium text-foreground">{formatCurrency(net)}</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required defaultValue={toDateInputValue(revenue?.date)} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={revenue?.status ?? "PREVISTA"}>
            {Object.entries(REVENUE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select id="categoryId" name="categoryId" defaultValue={revenue?.categoryId ?? ""}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="destinationAccountId">Conta de destino</Label>
          <Select
            id="destinationAccountId"
            name="destinationAccountId"
            defaultValue={revenue?.destinationAccountId ?? ""}
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
        <Label htmlFor="document">Comprovante</Label>
        <Input id="document" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" />
      </div>

      <div>
        <Label htmlFor="notes">Observação</Label>
        <Textarea id="notes" name="notes" defaultValue={revenue?.notes ?? ""} />
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
