"use client";

import { useActionState, useEffect } from "react";
import { updatePartnerAction } from "./actions";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Partner } from "@prisma/client";

export function PartnerForm({ partner, onDone }: { partner: Partner; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updatePartnerAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={partner.id} />

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={partner.name} required />
      </div>

      <div>
        <Label htmlFor="sharePercentage">Participação societária (%)</Label>
        <Input
          id="sharePercentage"
          name="sharePercentage"
          type="number"
          min={0}
          max={100}
          step={0.01}
          defaultValue={partner.sharePercentage}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={partner.notes ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="active" defaultChecked={partner.active} className="rounded" />
        Sócio ativo
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
