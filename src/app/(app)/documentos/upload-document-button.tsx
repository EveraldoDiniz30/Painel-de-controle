"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/labels";
import { uploadDocumentAction } from "./actions";

function UploadForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="file">Arquivo</Label>
        <Input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls,.doc,.docx"
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select id="category" name="category" required defaultValue="OUTRO">
          {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
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
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </form>
  );
}

export function UploadDocumentButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Enviar documento
      </Button>
      <Modal title="Enviar documento" open={open} onOpenChange={setOpen}>
        <UploadForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
