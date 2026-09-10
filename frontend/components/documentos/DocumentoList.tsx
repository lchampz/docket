"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/contexts/ToastContext";
import { del, get } from "@/lib/api/client";
import { applyApiErrorToForm } from "@/lib/api/formErrors";
import type { DocumentoResponse, PageResponse } from "@/lib/api/types";
import { DocumentoEmptyIcon } from "./DocumentoEmptyIcon";

const PAGE_SIZE = 10;

export function DocumentoList() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<DocumentoResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const response = await get<PageResponse<DocumentoResponse>>(
        `/documentos?page=${targetPage}&size=${PAGE_SIZE}`,
      );
      setItems(response.content);
      setTotal(response.totalElements);
      setTotalPages(response.totalPages);
      const correctedPage =
        response.totalPages > 0 && targetPage >= response.totalPages
          ? response.totalPages - 1
          : targetPage;
      setPage(correctedPage);
      if (correctedPage !== targetPage) {
        await load(correctedPage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const goToPage = (target: number) => {
    void load(target);
  };

  const confirmDelete = async () => {
    if (confirmId === null) return;
    setDeletingId(confirmId);
    try {
      await del(`/documentos/${confirmId}`);
      toast.success("Documento excluído com sucesso.");
      setConfirmId(null);
      await load(page);
    } catch (error) {
      const leftover = applyApiErrorToForm(error, () => {}, {});
      if (leftover) toast.error(leftover);
    } finally {
      setDeletingId(null);
    }
  };

  const itemToConfirm = items.find((d) => d.id === confirmId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h3-main text-black-100">Documentos ({total})</h1>
        <Button variante="primario" onClick={() => router.push("/documentos/novo")}>
          Novo documento
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="min-h-[280px]">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Spinner tamanho="lg" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icone={<DocumentoEmptyIcon />}
              mensagem="Nenhum documento criado"
            />
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black10 bg-cold-grey">
                      <th scope="col" className="px-6 py-3 text-body-bold text-black-100">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-body-bold text-black-100">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-black10 last:border-0">
                        <td className="px-6 py-4 text-body text-black-100">{item.nome}</td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variante="perigo"
                            carregando={deletingId === item.id}
                            onClick={() => setConfirmId(item.id)}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-black10 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3 p-4">
                    <p className="text-body-bold text-black-100">{item.nome}</p>
                    <Button
                      variante="perigo"
                      className="w-full"
                      carregando={deletingId === item.id}
                      onClick={() => setConfirmId(item.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <Pagination
        pagina={page}
        totalPaginas={totalPages}
        onPagina={goToPage}
      />

      <ConfirmDialog
        aberto={confirmId !== null}
        titulo="Excluir documento"
        mensagem={
          itemToConfirm
            ? `Tem certeza que deseja excluir "${itemToConfirm.nome}"? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este documento?"
        }
        onConfirmar={() => void confirmDelete()}
        onCancelar={() => setConfirmId(null)}
      />
    </div>
  );
}
