"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DocumentoIdentificacaoField } from "./DocumentoIdentificacaoField";
import { usePedido } from "@/contexts/PedidoContext";
import { useToast } from "@/contexts/ToastContext";
import { applyApiErrorToForm } from "@/lib/api/formErrors";
import type { TipoPessoa } from "@/lib/api/types";
import { formatCep } from "@/hooks/maskUtils";

type FormFields = {
  cartorioId: string;
  documentoId: string;
  tipoPessoa: TipoPessoa;
  nomeRazaoSocial: string;
  dataNascimento: string;
};

const empty: FormFields = {
  cartorioId: "",
  documentoId: "",
  tipoPessoa: "FISICA",
  nomeRazaoSocial: "",
  dataNascimento: "",
};

export function AgendamentoForm() {
  const {
    cartorios,
    documentosDoCartorio,
    loadingDocumentos,
    loadDocumentosDoCartorio,
    createAgendamento,
    saving,
  } = usePedido();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormFields>({ defaultValues: empty, mode: "onSubmit" });

  const cartorioId = watch("cartorioId");
  const tipoPessoa = watch("tipoPessoa");
  const isFisica = tipoPessoa === "FISICA";

  // Documento vem sempre do cartório. Trocar cartório invalida a escolha anterior —
  // manter a seleção antiga é o bug clássico: o combo parece certo e o backend
  // rejeita com 409.
  useEffect(() => {
    setValue("documentoId", "");
    void loadDocumentosDoCartorio(cartorioId ? Number(cartorioId) : null);
  }, [cartorioId, loadDocumentosDoCartorio, setValue]);

  const selectedCartorio = cartorios.find((o) => String(o.id) === cartorioId);

  // CPF/CNPJ fica fora do react-hook-form: a máscara controla o cursor e deve
  // ser dona do valor exibido.
  const [documentoIdentificacao, setDocumentoIdentificacao] = useState("");
  // Incrementa a cada envio bem-sucedido para remontar o campo de CPF/CNPJ.
  // Ele guarda o próprio valor mascarado, então `reset()` do react-hook-form
  // não o alcança — sem isto, o formulário volta vazio com o documento ainda
  // preenchido na tela, e o envio seguinte manda vazio sem o usuário perceber.
  const [envios, setEnvios] = useState(0);
  const [documentoIdentificacaoError, setDocumentoIdentificacaoError] = useState<
    string | undefined
  >();

  async function onSubmit(fields: FormFields) {
    setDocumentoIdentificacaoError(undefined);
    try {
      await createAgendamento({
        cartorioId: Number(fields.cartorioId),
        documentoId: Number(fields.documentoId),
        tipoPessoa: fields.tipoPessoa,
        nomeRazaoSocial: fields.nomeRazaoSocial,
        documentoIdentificacao,
        dataNascimento: isFisica && fields.dataNascimento ? fields.dataNascimento : null,
      });
      toast.success("Documento criado com sucesso");
      reset(empty);
      setDocumentoIdentificacao("");
      setEnvios((n) => n + 1);
    } catch (error) {
      const leftover = applyApiErrorToForm(
        error,
        (field, message) => {
          // CPF/CNPJ não é campo do react-hook-form; recebe erro separado.
          if (field === "documentoIdentificacao") setDocumentoIdentificacaoError(message);
          else setError(field as keyof FormFields, { message });
        },
        // Par inválido é culpa da combinação; documento é onde o usuário corrige
        // sem refazer o formulário inteiro.
        { PAR_CARTORIO_DOCUMENTO_INVALIDO: "documentoId" },
      );
      if (leftover) toast.error(leftover);
    }
  }

  return (
    <Card>
      <h2 className="text-subtitle text-black-100">Adicionar documentos ao pedido</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
        <Select
          label="Cartório"
          obrigatorio
          erro={errors.cartorioId?.message}
          {...register("cartorioId", { required: "Selecione o cartório" })}
        >
          <option value="">Selecione</option>
          {cartorios.map((cartorio) => (
            <option key={cartorio.id} value={cartorio.id}>
              {cartorio.nome} — {cartorio.cidade}/{cartorio.uf}
            </option>
          ))}
        </Select>

        <Select
          label="Nome do documento"
          obrigatorio
          erro={errors.documentoId?.message}
          disabled={!cartorioId || loadingDocumentos}
          hint={
            !cartorioId
              ? "Escolha um cartório para ver os documentos que ele emite."
              : loadingDocumentos
                ? "Carregando documentos…"
                : documentosDoCartorio.length === 0
                  ? "Este cartório não emite nenhum documento cadastrado."
                  : undefined
          }
          {...register("documentoId", { required: "Selecione o documento" })}
        >
          <option value="">Selecione</option>
          {documentosDoCartorio.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.nome}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo de pessoa"
          obrigatorio
          {...register("tipoPessoa")}
        >
          <option value="FISICA">Pessoa física</option>
          <option value="JURIDICA">Pessoa jurídica</option>
        </Select>

        {/* key força remount ao trocar tipo: máscara muda e input anterior não
            faz mais sentido. */}
        <DocumentoIdentificacaoField
          key={`${tipoPessoa}-${envios}`}
          tipoPessoa={tipoPessoa}
          error={documentoIdentificacaoError}
          onChange={(raw) => {
            setDocumentoIdentificacao(raw);
            setDocumentoIdentificacaoError(undefined);
          }}
        />

        <Input
          label={isFisica ? "Nome completo" : "Razão social"}
          obrigatorio
          erro={errors.nomeRazaoSocial?.message}
          {...register("nomeRazaoSocial", { required: "Informe o nome" })}
        />

        {isFisica ? (
          <Input
            label="Data de nascimento"
            type="date"
            erro={errors.dataNascimento?.message}
            {...register("dataNascimento")}
          />
        ) : null}

        <CartorioData cartorio={selectedCartorio} />

        <Button type="submit" carregando={saving} className="self-start">
          Criar documento
        </Button>
      </form>
    </Card>
  );
}

function CartorioData({
  cartorio,
}: {
  cartorio: ReturnType<typeof usePedido>["cartorios"][number] | undefined;
}) {
  return (
    <fieldset className="mt-2 rounded border border-black10 p-4">
      <legend className="px-1 text-body font-semibold text-black-100">
        Dados do cartório
      </legend>
      {cartorio ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          <DataField label="CEP" value={formatCep(cartorio.cep)} />
          <DataField label="Rua" value={cartorio.rua} />
          <DataField label="Número" value={cartorio.numero} />
          <DataField label="Cidade" value={cartorio.cidade} />
          <DataField label="UF" value={cartorio.uf} />
          {cartorio.bairro ? <DataField label="Bairro" value={cartorio.bairro} /> : null}
        </dl>
      ) : (
        <p className="text-body text-black60">
          Selecione um cartório para ver o endereço.
        </p>
      )}
    </fieldset>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-body">
      <dt className="font-semibold text-black-100">{label}:</dt>
      <dd className="text-black80">{value}</dd>
    </div>
  );
}
