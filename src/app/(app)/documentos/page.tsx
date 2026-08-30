import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Paperclip } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/format";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/labels";
import { getDocumentRelationLabel } from "@/lib/document-relation";
import { UploadDocumentButton } from "./upload-document-button";
import { DocumentRowActions } from "./document-row-actions";

export default async function DocumentosPage() {
  const documents = await prisma.document.findMany({
    include: {
      expense: true,
      revenue: true,
      contribution: { include: { partner: true } },
      withdrawal: { include: { partner: true } },
      campaign: true,
      product: true,
      group: true,
      uploadedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Documentos</h1>
          <p className="text-sm text-muted">
            Todos os comprovantes anexados nos lançamentos financeiros, além de
            documentos avulsos (notas fiscais, contratos, relatórios).
          </p>
        </div>
        <UploadDocumentButton />
      </div>

      {documents.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="Nenhum documento enviado"
            description="Anexe comprovantes nas despesas/receitas ou envie um documento avulso aqui."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Relacionado a</th>
                <th className="px-4 py-3 font-medium">Enviado por</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Tamanho</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted" />
                      {doc.originalName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{DOCUMENT_CATEGORY_LABELS[doc.category]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{getDocumentRelationLabel(doc)}</td>
                  <td className="px-4 py-3 text-muted">{doc.uploadedBy.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(doc.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatFileSize(doc.size)}</td>
                  <td className="px-2 py-3">
                    <DocumentRowActions id={doc.id} name={doc.originalName} />
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
