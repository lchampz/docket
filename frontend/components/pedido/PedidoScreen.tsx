"use client";

import { useState } from "react";
import { PedidoHeader } from "./PedidoHeader";
import { AgendamentoCard } from "./AgendamentoCard";
import { AgendamentoForm } from "./AgendamentoForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { DocumentoEmptyIcon } from "@/components/documentos/DocumentoEmptyIcon";
import { usePedido } from "@/contexts/PedidoContext";
import { useToast } from "@/contexts/ToastContext";
import { applyApiErrorToForm } from "@/lib/api/formErrors";

function countTitle(total: number): string {
  if (total === 1) return "1 documento solicitado";
  return `${total} documentos solicitados`;
}

export function PedidoScreen() {
  const {
    agendamentos,
    total,
    page,
    totalPages,
    loadingList,
    goToPage,
    deleteAgendamento,
  } = usePedido();
  const toast = useToast();

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function confirmDelete() {
    if (confirmId === null) return;
    setDeletingId(confirmId);
    try {
      await deleteAgendamento(confirmId);
      toast.success("Documento excluído com sucesso");
      setConfirmId(null);
    } catch (error) {
      const leftover = applyApiErrorToForm(error, () => {}, {});
      if (leftover) toast.error(leftover);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <PedidoHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AgendamentoForm />

        <section className="min-w-0 space-y-4">
          {/* Sem título quando vazio: no XD o empty state ocupa a coluna sozinho,
              e "0 documentos solicitados" ao lado de "Nenhum documento criado"
              repetiria a mesma informação. */}
          {total > 0 ? (
            <h2 className="text-h4-title text-black-100">{countTitle(total)}</h2>
          ) : null}

          <div className="min-h-[280px]">
            {loadingList ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Spinner tamanho="lg" />
              </div>
            ) : agendamentos.length === 0 ? (
              <EmptyState
                icone={<DocumentoEmptyIcon />}
                mensagem="Nenhum documento criado"
              />
            ) : (
              <ul className="space-y-4">
                {agendamentos.map((agendamento) => (
                  <li key={agendamento.id}>
                    <AgendamentoCard
                      agendamento={agendamento}
                      onDelete={() => setConfirmId(agendamento.id)}
                      deleting={deletingId === agendamento.id}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Pagination
            pagina={page}
            totalPaginas={totalPages}
            onPagina={goToPage}
          />
        </section>
      </div>

      <ConfirmDialog
        aberto={confirmId !== null}
        titulo="Confirmar exclusão"
        mensagem="Tem certeza que deseja excluir este documento?"
        onConfirmar={() => void confirmDelete()}
        onCancelar={() => setConfirmId(null)}
      />
    </div>
  );
}
