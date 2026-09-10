"use client";

import { Card } from "@/components/ui/Card";
import { formatLongDate } from "@/lib/formatDate";
import type { AgendamentoResponse } from "@/lib/api/types";
import { formatCep, formatCnpj, formatCpf, extractCnpjRaw } from "@/hooks/maskUtils";
import { cn } from "@/lib/cn";

type AgendamentoCardProps = {
  agendamento: AgendamentoResponse;
  onDelete: () => void;
  deleting?: boolean;
};

function formatDocumentoIdentificacao(agendamento: AgendamentoResponse): string {
  if (agendamento.tipoPessoa === "FISICA") {
    return formatCpf(agendamento.documentoIdentificacao);
  }
  return formatCnpj(extractCnpjRaw(agendamento.documentoIdentificacao));
}

function TrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0v9.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 6 15.5V6h8ZM8 9v5M12 9v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-body text-black80">
      <span className="font-semibold text-black-100">{label}:</span> {value}
    </p>
  );
}

export function AgendamentoCard({
  agendamento,
  onDelete,
  deleting = false,
}: AgendamentoCardProps) {
  const isFisica = agendamento.tipoPessoa === "FISICA";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-subtitle text-black-100">{agendamento.documentoNome}</h3>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-label={`Excluir ${agendamento.documentoNome}`}
          className={cn(
            "shrink-0 rounded p-1 text-black60 transition-colors",
            "hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-body-bold text-black-100">
            {isFisica ? "Pessoa física" : "Pessoa jurídica"}
          </p>
          <DataRow
            label={isFisica ? "Nome" : "Razão social"}
            value={agendamento.nomeRazaoSocial}
          />
          <DataRow
            label={isFisica ? "CPF" : "CNPJ"}
            value={formatDocumentoIdentificacao(agendamento)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-body-bold text-black-100">Dados do cartório</p>
          <DataRow label="CEP" value={formatCep(agendamento.cep)} />
          <DataRow label="Rua" value={agendamento.rua} />
          <DataRow label="Nº" value={agendamento.numero} />
          <DataRow label="Cidade" value={agendamento.cidade} />
          <DataRow label="UF" value={agendamento.uf} />
        </div>
      </div>

      <hr className="border-black10" />

      <p className="text-small text-black60">
        <span className="font-semibold text-black-100">Data de criação:</span>{" "}
        {formatLongDate(agendamento.createdAt)}
      </p>
    </Card>
  );
}
