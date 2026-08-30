"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Partner } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PaymentMethodForm } from "./payment-method-form";

export function NewPaymentMethodButton({ partners }: { partners: Partner[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo meio de pagamento
      </Button>
      <Modal title="Novo meio de pagamento" open={open} onOpenChange={setOpen}>
        <PaymentMethodForm partners={partners} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
