import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PRODUCT_STATUS_LABELS } from "@/lib/labels";
import { NewProductButton, ProductRowActions } from "./product-modals";

const STATUS_TONE: Record<string, "success" | "neutral" | "danger"> = {
  ATIVO: "success",
  INATIVO: "neutral",
  ESGOTADO: "danger",
};

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    include: { _count: { select: { affiliateLinks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Produtos</h1>
          <p className="text-sm text-muted">
            Cadastre os produtos divulgados para gerar links próprios com rastreio de cliques.
          </p>
        </div>
        <NewProductButton />
      </div>

      {products.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Package className="h-10 w-10" />}
            title="Nenhum produto cadastrado"
            description="Cadastre um produto para depois gerar links de divulgação com rastreio de origem."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Preço</th>
                <th className="px-4 py-3 text-right font-medium">Links</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.category ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{product.platform ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[product.status]}>
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {product.price != null ? formatCurrency(product.price) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{product._count.affiliateLinks}</td>
                  <td className="px-2 py-3">
                    <ProductRowActions product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
