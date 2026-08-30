"use client";

import { useActionState, useEffect } from "react";
import { saveProductAction } from "./actions";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_STATUS_LABELS } from "@/lib/labels";
import type { Product } from "@prisma/client";

export function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(saveProductAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={product?.name} placeholder="Ex: Fone de ouvido Bluetooth" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" name="category" defaultValue={product?.category ?? ""} placeholder="Ex: Eletrônicos" />
        </div>
        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Input id="platform" name="platform" defaultValue={product?.platform ?? ""} placeholder="Ex: Mercado Livre" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Preço</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? ""} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={product?.status ?? "ATIVO"}>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="originalUrl">Link original do produto</Label>
        <Input
          id="originalUrl"
          name="originalUrl"
          type="url"
          defaultValue={product?.originalUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={product?.notes ?? ""} />
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
