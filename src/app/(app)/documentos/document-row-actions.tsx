"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteDocumentAction } from "./actions";

export function DocumentRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <a href={`/api/documents/${id}`} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" type="button" aria-label="Ver documento">
          <Eye className="h-4 w-4" />
        </Button>
      </a>
      <DeleteButton action={() => deleteDocumentAction(id)} confirmMessage={`Excluir o documento "${name}"?`} />
    </div>
  );
}
