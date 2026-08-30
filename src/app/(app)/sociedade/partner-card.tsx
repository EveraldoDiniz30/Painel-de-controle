"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Partner } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PartnerForm } from "./partner-form";
import { formatPercent } from "@/lib/format";

export function PartnerCard({ partner }: { partner: Partner }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-base font-semibold text-brand">
              {partner.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{partner.name}</p>
              <Badge tone={partner.active ? "success" : "neutral"}>
                {partner.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5">
          <p className="text-xs text-muted">Participação societária</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatPercent(partner.sharePercentage)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.min(partner.sharePercentage, 100)}%` }}
            />
          </div>
        </div>

        {partner.notes && <p className="mt-4 text-sm text-muted">{partner.notes}</p>}
      </CardContent>

      <Modal title={`Editar ${partner.name}`} open={open} onOpenChange={setOpen}>
        <PartnerForm partner={partner} onDone={() => setOpen(false)} />
      </Modal>
    </Card>
  );
}
