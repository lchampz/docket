"use client";

import { Card } from "@/components/ui/Card";
import { usePedido } from "@/contexts/PedidoContext";
import { formatLongDate } from "@/lib/formatDate";
import type { StatusPedido } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const STATUS_LABELS: Record<StatusPedido, string> = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function StatusBadge({ status }: { status: StatusPedido }) {
  const emAndamento = status === "EM_ANDAMENTO";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-small font-semibold",
        emAndamento ? "bg-green-light text-green-dark" : "bg-black10 text-black60",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          emAndamento ? "bg-green-dark" : "bg-black60",
        )}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PedidoHeader() {
  const { pedido } = usePedido();

  if (!pedido) return null;

  return (
    <header className="space-y-4">
      <h1 className="text-h4-title text-black-100">Pedido #{pedido.numero}</h1>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-body-bold text-black-100">
            Lead: {pedido.lead}
          </p>
          <StatusBadge status={pedido.status} />
        </div>

        {pedido.observacao ? (
          <p className="text-body text-black80">
            Observação: {pedido.observacao}
          </p>
        ) : null}

        <hr className="border-black10" />

        <div className="flex flex-wrap gap-x-8 gap-y-1 text-small text-black60">
          <p>
            <span className="font-semibold text-black-100">Criado por:</span>{" "}
            {pedido.criadoPor}
          </p>
          <p>
            <span className="font-semibold text-black-100">Data de criação:</span>{" "}
            {formatLongDate(pedido.createdAt)}
          </p>
        </div>
      </Card>
    </header>
  );
}
