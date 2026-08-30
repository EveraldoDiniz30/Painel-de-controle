import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerCard } from "./partner-card";
import { AlertTriangle } from "lucide-react";

export default async function SociedadePage() {
  const partners = await prisma.partner.findMany({ orderBy: { createdAt: "asc" } });
  const totalShare = partners
    .filter((p) => p.active)
    .reduce((sum, p) => sum + p.sharePercentage, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Sociedade</h1>
        <p className="text-sm text-muted">
          MJ Ofertas é administrado por Júnior e Maike. Configure aqui a participação
          societária de cada um — usada no cálculo de acerto de despesas.
        </p>
      </div>

      {Math.abs(totalShare - 100) > 0.01 && (
        <Card className="border-warning/30 bg-warning-soft">
          <CardContent className="flex items-center gap-3 pt-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm text-warning">
              A soma das participações dos sócios ativos é {totalShare.toFixed(1)}%, e não 100%.
              Ajuste os percentuais para que o cálculo de acerto fique correto.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
