"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/contexts/ToastContext";
import { useCepMask } from "@/hooks/useCepMask";
import { useCpfCnpjMask } from "@/hooks/useCpfCnpjMask";
import type { TipoPessoa } from "@/lib/api/types";

function DocumentoIdentificacaoField({ tipoPessoa }: { tipoPessoa: TipoPessoa }) {
  const documentoIdentificacao = useCpfCnpjMask(tipoPessoa);

  return (
    <Input
      label={tipoPessoa === "FISICA" ? "CPF" : "CNPJ"}
      value={documentoIdentificacao.value}
      onChange={documentoIdentificacao.onChange}
      ref={documentoIdentificacao.inputRef}
      placeholder={
        tipoPessoa === "FISICA" ? "000.000.000-00" : "00.AAA.000/0000-00"
      }
      hint={`Cru: ${documentoIdentificacao.raw}`}
    />
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SandboxPage() {
  const { success, error } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("FISICA");
  const cep = useCepMask();

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-8">
      <div>
        <h1 className="text-h1-jumbo text-black-100">Sandbox</h1>
        <p className="mt-2 text-body text-black60">
          Comparação visual com o XD — não é rota de produto.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Tipografia</h2>
        <Card className="space-y-3">
          <p className="text-h1-jumbo">h1-jumbo</p>
          <p className="text-h2-mega">h2-mega</p>
          <p className="text-h3-main">h3-main</p>
          <p className="text-h4-title">h4-title</p>
          <p className="text-subtitle">subtitle</p>
          <p className="text-body">body</p>
          <p className="text-body-bold">body-bold</p>
          <p className="text-small">small</p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Botões</h2>
        <Card className="flex flex-wrap gap-3">
          <Button variante="primario">Primário</Button>
          <Button variante="neutro">Neutro</Button>
          <Button variante="perigo">Perigo</Button>
          <Button variante="primario" carregando>Carregando</Button>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Input e Select</h2>
        <Card className="grid gap-6 sm:grid-cols-2">
          <Input label="Campo normal" placeholder="Digite algo" hint="Texto de ajuda" />
          <Input
            label="Campo com erro"
            obrigatorio
            erro="Este campo é obrigatório"
            defaultValue="valor inválido"
          />
          <Select label="Select normal" hint="Escolha uma opção">
            <option value="">Selecione</option>
            <option value="a">Opção A</option>
            <option value="b">Opção B</option>
          </Select>
          <Select label="Select com erro" obrigatorio erro="Seleção obrigatória">
            <option value="">Selecione</option>
            <option value="a">Opção A</option>
          </Select>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Card, Spinner e EmptyState</h2>
        <Card>
          <div className="flex items-center gap-4">
            <Spinner tamanho="sm" />
            <Spinner tamanho="md" />
            <Spinner tamanho="lg" />
          </div>
          <EmptyState icone={<EmptyIcon />} mensagem="Nenhum item encontrado" />
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Toasts</h2>
        <Card className="flex flex-wrap gap-3">
          <Button variante="primario" onClick={() => success("Operação realizada com sucesso!")}>
            Toast sucesso
          </Button>
          <Button variante="perigo" onClick={() => error("Ocorreu um erro ao processar.")}>
            Toast erro
          </Button>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">ConfirmDialog</h2>
        <Card>
          <Button variante="perigo" onClick={() => setModalOpen(true)}>
            Abrir modal
          </Button>
          <ConfirmDialog
            aberto={modalOpen}
            titulo="Excluir item"
            mensagem="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
            onConfirmar={() => setModalOpen(false)}
            onCancelar={() => setModalOpen(false)}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3-main text-black-100">Máscaras</h2>
        <Card className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Input
              label="CEP"
              value={cep.value}
              onChange={cep.onChange}
              ref={cep.inputRef}
              placeholder="00000-000"
              hint={`Cru: ${cep.raw}`}
            />
          </div>
          <div className="space-y-3">
            <Select
              label="Tipo de pessoa"
              value={tipoPessoa}
              onChange={(e) => setTipoPessoa(e.target.value as TipoPessoa)}
            >
              <option value="FISICA">Física (CPF)</option>
              <option value="JURIDICA">Jurídica (CNPJ)</option>
            </Select>
            <DocumentoIdentificacaoField key={tipoPessoa} tipoPessoa={tipoPessoa} />
          </div>
        </Card>
      </section>
    </div>
  );
}
