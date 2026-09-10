"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/contexts/ToastContext";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useCepMask } from "@/hooks/useCepMask";
import { onlyDigits } from "@/hooks/maskUtils";
import { get, post, put } from "@/lib/api/client";
import { applyApiErrorToForm } from "@/lib/api/formErrors";
import { STATES } from "@/lib/constants/states";
import type { CartorioResponse, DocumentoResponse, PageResponse } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const schema = z.object({
  nome: z
    .string()
    .min(1, "Informe o nome do cartório")
    .max(150, "Máximo de 150 caracteres"),
  cep: z
    .string()
    .min(8, "CEP deve ter 8 dígitos")
    .max(8, "CEP deve ter 8 dígitos")
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  rua: z
    .string()
    .min(1, "Informe a rua")
    .max(150, "Máximo de 150 caracteres"),
  numero: z
    .string()
    .min(1, "Informe o número")
    .max(20, "Máximo de 20 caracteres"),
  complemento: z.string().max(100, "Máximo de 100 caracteres").optional(),
  bairro: z.string().max(100, "Máximo de 100 caracteres").optional(),
  cidade: z
    .string()
    .min(1, "Informe a cidade")
    .max(100, "Máximo de 100 caracteres"),
  uf: z
    .string()
    .min(1, "Selecione a UF")
    .regex(/^[A-Z]{2}$/, "UF deve ter duas letras maiúsculas"),
  documentoIds: z
    .array(z.number())
    .min(1, "Selecione ao menos um documento emitido"),
});

type CartorioFormValues = z.infer<typeof schema>;

type CartorioFormProps = {
  cartorioId?: number;
};

export function CartorioForm({ cartorioId }: CartorioFormProps) {
  const router = useRouter();
  const toast = useToast();
  const documentosGroupId = useId();
  const documentosErrorId = `${documentosGroupId}-erro`;
  const [availableDocumentos, setAvailableDocumentos] = useState<DocumentoResponse[]>([]);
  const [loadingData, setLoadingData] = useState(Boolean(cartorioId));

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CartorioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      documentoIds: [],
    },
  });

  const documentoIds = watch("documentoIds");

  const cepMask = useCepMask();
  const { setRaw } = cepMask;

  const { lookup, loading: lookingUp, message } = useCepLookup((address) => {
    setValue("rua", address.rua, { shouldValidate: true });
    setValue("bairro", address.bairro);
    setValue("cidade", address.cidade, { shouldValidate: true });
    setValue("uf", address.uf, { shouldValidate: true });
  });

  useEffect(() => {
    void get<PageResponse<DocumentoResponse>>("/documentos?size=100").then((page) => {
      setAvailableDocumentos(page.content);
    });
  }, []);

  useEffect(() => {
    if (!cartorioId) return;

    void (async () => {
      setLoadingData(true);
      try {
        const cartorio = await get<CartorioResponse>(`/cartorios/${cartorioId}`);
        setRaw(cartorio.cep);
        reset({
          nome: cartorio.nome,
          cep: cartorio.cep,
          rua: cartorio.rua,
          numero: cartorio.numero,
          complemento: cartorio.complemento ?? "",
          bairro: cartorio.bairro ?? "",
          cidade: cartorio.cidade,
          uf: cartorio.uf,
          documentoIds: cartorio.documentos.map((d) => d.id),
        });
      } finally {
        setLoadingData(false);
      }
    })();
  }, [cartorioId, reset, setRaw]);

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    cepMask.onChange(e);
    const raw = onlyDigits(e.target.value).slice(0, 8);
    setValue("cep", raw, { shouldValidate: raw.length === 8 });
    void lookup(raw);
  };

  const toggleDocumento = (id: number) => {
    const current = documentoIds ?? [];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    setValue("documentoIds", next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    const body = {
      nome: data.nome,
      cep: data.cep,
      rua: data.rua,
      numero: data.numero,
      complemento: data.complemento?.trim() ? data.complemento.trim() : null,
      bairro: data.bairro?.trim() ? data.bairro.trim() : null,
      cidade: data.cidade,
      uf: data.uf,
      documentoIds: data.documentoIds,
    };

    try {
      if (cartorioId) {
        await put<CartorioResponse>(`/cartorios/${cartorioId}`, body);
        toast.success("Cartório atualizado com sucesso.");
      } else {
        await post<CartorioResponse>("/cartorios", body);
        toast.success("Cartório criado com sucesso.");
      }
      router.push("/cartorios");
    } catch (error) {
      const leftover = applyApiErrorToForm(error, (field, msg) => {
        setError(field as keyof CartorioFormValues, { message: msg });
      });
      if (leftover) toast.error(leftover);
    }
  });

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Spinner tamanho="lg" />
      </div>
    );
  }

  const title = cartorioId ? "Editar cartório" : "Novo cartório";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h3-main text-black-100">{title}</h1>
        <p className="mt-1 text-body text-black60">
          Informe os dados do cartório e os documentos que ele emite.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <Input
            label="Nome"
            obrigatorio
            erro={errors.nome?.message}
            {...register("nome")}
          />

          <div className="relative">
            <Input
              label="CEP"
              obrigatorio
              value={cepMask.value}
              onChange={handleCepChange}
              ref={cepMask.inputRef}
              placeholder="00000-000"
              erro={errors.cep?.message}
              hint={message ?? undefined}
            />
            {lookingUp ? (
              <div className="absolute right-3 top-[38px]" aria-hidden="true">
                <Spinner tamanho="sm" className="text-black60" />
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Rua"
              obrigatorio
              erro={errors.rua?.message}
              {...register("rua")}
            />
            <Input
              label="Número"
              obrigatorio
              erro={errors.numero?.message}
              {...register("numero")}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Complemento"
              erro={errors.complemento?.message}
              {...register("complemento")}
            />
            <Input
              label="Bairro"
              erro={errors.bairro?.message}
              {...register("bairro")}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Cidade"
              obrigatorio
              erro={errors.cidade?.message}
              {...register("cidade")}
            />
            <Select
              label="UF"
              obrigatorio
              erro={errors.uf?.message}
              {...register("uf")}
            >
              <option value="">Selecione</option>
              {STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </Select>
          </div>

          <fieldset
            className="space-y-3"
            aria-invalid={errors.documentoIds ? true : undefined}
            aria-describedby={errors.documentoIds ? documentosErrorId : undefined}
          >
            <legend className="text-body font-semibold text-black-100">
              Documentos emitidos
              <span className="text-red" aria-hidden="true"> *</span>
            </legend>

            {availableDocumentos.length === 0 ? (
              <p className="text-body text-black60">
                Nenhum documento cadastrado.{" "}
                <Link href="/documentos/novo" className="text-blue underline">
                  Cadastre um documento
                </Link>
                {" "}antes de continuar.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {availableDocumentos.map((doc) => {
                  const checked = documentoIds?.includes(doc.id) ?? false;
                  const checkboxId = `${documentosGroupId}-${doc.id}`;
                  return (
                    <label
                      key={doc.id}
                      htmlFor={checkboxId}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded border px-3 py-2",
                        "focus-within:ring-2 focus-within:ring-blue focus-within:ring-offset-1",
                        checked ? "border-purple bg-purple/5" : "border-black20",
                        errors.documentoIds ? "border-red" : "",
                      )}
                    >
                      <input
                        type="checkbox"
                        id={checkboxId}
                        checked={checked}
                        onChange={() => toggleDocumento(doc.id)}
                        className="size-4 accent-purple"
                      />
                      <span className="text-body text-black-100">{doc.nome}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {errors.documentoIds ? (
              <p id={documentosErrorId} role="alert" className="text-small text-red">
                {errors.documentoIds.message}
              </p>
            ) : null}
          </fieldset>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variante="neutro"
              type="button"
              onClick={() => router.push("/cartorios")}
            >
              Cancelar
            </Button>
            <Button type="submit" carregando={isSubmitting} disabled={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
