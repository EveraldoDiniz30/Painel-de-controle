"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { AffiliateLink, Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { LinkForm } from "./link-form";
import { deleteAffiliateLinkAction } from "./actions";

export function NewLinkButton({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo link
      </Button>
      <Modal title="Novo link de divulgação" open={open} onOpenChange={setOpen}>
        <LinkForm products={products} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function LinkRowActions({ link, products }: { link: AffiliateLink; products: Product[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteAffiliateLinkAction(link.id)}
        confirmMessage="Excluir este link? O histórico de cliques dele também será perdido."
      />
      <Modal title="Editar link" open={open} onOpenChange={setOpen}>
        <LinkForm products={products} link={link} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
