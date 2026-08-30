"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { ProductForm } from "./product-form";
import { deleteProductAction } from "./actions";

export function NewProductButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo produto
      </Button>
      <Modal title="Novo produto" open={open} onOpenChange={setOpen}>
        <ProductForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function ProductRowActions({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DeleteButton
        action={() => deleteProductAction(product.id)}
        confirmMessage={`Excluir o produto "${product.name}"? Os links de afiliado associados também serão excluídos.`}
      />
      <Modal title="Editar produto" open={open} onOpenChange={setOpen}>
        <ProductForm product={product} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
