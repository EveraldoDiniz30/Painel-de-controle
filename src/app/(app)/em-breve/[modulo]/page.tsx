import { Construction } from "lucide-react";
import { NAV_SECTIONS } from "@/components/layout/nav-items";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export default async function EmBrevePage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const item = NAV_SECTIONS.flatMap((s) => s.items).find((i) =>
    i.href.endsWith(`/${modulo}`)
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-5">
        <EmptyState
          icon={<Construction className="h-10 w-10" />}
          title={`${item?.label ?? "Este módulo"} ainda não foi implementado`}
          description={`Está planejado para ${item?.phase ?? "uma próxima fase"} do roadmap do MJ Ofertas, conforme a ordem de implementação definida (ver README). A fundação do sistema — banco de dados, autenticação, sociedade e financeiro — foi priorizada primeiro.`}
        />
      </Card>
    </div>
  );
}
