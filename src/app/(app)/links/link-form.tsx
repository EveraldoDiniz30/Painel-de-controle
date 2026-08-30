"use client";

import { useActionState, useEffect, useState } from "react";
import { saveAffiliateLinkAction } from "./actions";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLICK_SOURCE_PRESETS, AFFILIATE_LINK_STATUS_LABELS } from "@/lib/labels";
import type { AffiliateLink, Product } from "@prisma/client";

export function LinkForm({
  products,
  link,
  onDone,
}: {
  products: Product[];
  link?: AffiliateLink;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveAffiliateLinkAction, undefined);
  const [productId, setProductId] = useState(link?.productId ?? "");
  const [url, setUrl] = useState(link?.url ?? "");

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  function handleProductChange(id: string) {
    setProductId(id);
    if (!link) {
      const product = products.find((p) => p.id === id);
      if (product?.originalUrl) setUrl(product.originalUrl);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {link && <input type="hidden" name="id" value={link.id} />}

      <div>
        <Label htmlFor="productId">Produto</Label>
        <Select
          id="productId"
          name="productId"
          required
          value={productId}
          onChange={(e) => handleProductChange(e.target.value)}
          disabled={!!link}
        >
          <option value="">Selecione</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        {products.length === 0 && (
          <p className="mt-1 text-xs text-muted">Cadastre um produto primeiro.</p>
        )}
      </div>

      <div>
        <Label htmlFor="source">Origem deste link</Label>
        <Input
          id="source"
          name="source"
          list="click-source-presets"
          required
          defaultValue={link?.source ?? ""}
          placeholder="Ex: Grupo de WhatsApp"
        />
        <datalist id="click-source-presets">
          {CLICK_SOURCE_PRESETS.map((preset) => (
            <option key={preset} value={preset} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-muted">
          Escolha uma sugestão ou digite outra (ex: nome do grupo específico).
        </p>
      </div>

      <div>
        <Label htmlFor="url">Link de destino</Label>
        <Input
          id="url"
          name="url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={link?.status ?? "ATIVO"}>
          {Object.entries(AFFILIATE_LINK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending || products.length === 0}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
