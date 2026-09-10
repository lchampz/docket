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
import type { CartorioResponse, PageResponse } from "@/lib/api/types";
import { formatCep } from "@/hooks/maskUtils";
import { CartorioEmptyIcon } from "./CartorioEmptyIcon";

const PAGE_SIZE = 10;

function formatAddress(cartorio: CartorioResponse): string {
  const cityState = `${cartorio.cidade}/${cartorio.uf}`;
  return `${cartorio.rua}, ${cartorio.numero}, ${cityState}`;
}

export function CartorioList() {
  const router = useRouter();
  const toast = useToast();
  const [cartorios, setCartorios] = useState<CartorioResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const response = await get<PageResponse<CartorioResponse>>(
        `/cartorios?page=${targetPage}&size=${PAGE_SIZE}`,
      );
      setCartorios(response.content);
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
      await del(`/cartorios/${confirmId}`);
      toast.success("Cartório excluído com sucesso.");
      setConfirmId(null);
      await load(page);
    } catch (error) {
      const leftover = applyApiErrorToForm(error, () => {}, {});
      if (leftover) toast.error(leftover);
    } finally {
      setDeletingId(null);
    }
  };

  const cartorioToConfirm = cartorios.find((o) => o.id === confirmId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h3-main text-black-100">Cartórios ({total})</h1>
        <Button variante="primario" onClick={() => router.push("/cartorios/novo")}>
          Novo cartório
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="min-h-[320px]">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spinner tamanho="lg" />
            </div>
          ) : cartorios.length === 0 ? (
            <EmptyState
              icone={<CartorioEmptyIcon />}
              mensagem="Nenhum cartório cadastrado"
            />
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black10 bg-cold-grey">
                      <th scope="col" className="px-4 py-3 text-body-bold text-black-100">
                        Nome
                      </th>
                      <th scope="col" className="px-4 py-3 text-body-bold text-black-100">
                        Endereço
                      </th>
                      <th scope="col" className="px-4 py-3 text-body-bold text-black-100">
                        CEP
                      </th>
                      <th scope="col" className="px-4 py-3 text-body-bold text-black-100">
                        Documentos
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-body-bold text-black-100">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartorios.map((cartorio) => (
                      <tr key={cartorio.id} className="border-b border-black10 last:border-0">
                        <td className="px-4 py-4 text-body text-black-100">{cartorio.nome}</td>
                        <td className="px-4 py-4 text-body text-black60">
                          {formatAddress(cartorio)}
                        </td>
                        <td className="px-4 py-4 text-body text-black-100">
                          {formatCep(cartorio.cep)}
                        </td>
                        <td className="px-4 py-4 text-body text-black-100">
                          {cartorio.totalDocumentos}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variante="neutro"
                              onClick={() => router.push(`/cartorios/${cartorio.id}/editar`)}
                            >
                              Editar
                            </Button>
                            <Button
                              variante="perigo"
                              carregando={deletingId === cartorio.id}
                              onClick={() => setConfirmId(cartorio.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-black10 md:hidden">
                {cartorios.map((cartorio) => (
                  <div key={cartorio.id} className="space-y-2 p-4">
                    <p className="text-body-bold text-black-100">{cartorio.nome}</p>
                    <p className="text-body text-black60">{formatAddress(cartorio)}</p>
                    <p className="text-body text-black-100">
                      CEP: {formatCep(cartorio.cep)}
                    </p>
                    <p className="text-body text-black-100">
                      Documentos emitidos: {cartorio.totalDocumentos}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variante="neutro"
                        className="flex-1"
                        onClick={() => router.push(`/cartorios/${cartorio.id}/editar`)}
                      >
                        Editar
                      </Button>
                      <Button
                        variante="perigo"
                        className="flex-1"
                        carregando={deletingId === cartorio.id}
                        onClick={() => setConfirmId(cartorio.id)}
                      >
                        Excluir
                      </Button>
                    </div>
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
        titulo="Excluir cartório"
        mensagem={
          cartorioToConfirm
            ? `Tem certeza que deseja excluir "${cartorioToConfirm.nome}"? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este cartório?"
        }
        onConfirmar={() => void confirmDelete()}
        onCancelar={() => setConfirmId(null)}
      />
    </div>
  );
}
