"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/contexts/ToastContext";
import { post } from "@/lib/api/client";
import { applyApiErrorToForm } from "@/lib/api/formErrors";
import type { DocumentoResponse } from "@/lib/api/types";

const schema = z.object({
  nome: z
    .string()
    .min(1, "Informe o nome do documento")
    .max(150, "Máximo de 150 caracteres"),
});

type DocumentoFormValues = z.infer<typeof schema>;

export function DocumentoForm() {
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DocumentoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await post<DocumentoResponse>("/documentos", data);
      toast.success("Documento criado com sucesso.");
      router.push("/documentos");
    } catch (error) {
      const leftover = applyApiErrorToForm(error, (field, message) => {
        setError(field as "nome", { message });
      }, { NOME_DUPLICADO: "nome" });
      if (leftover) toast.error(leftover);
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h3-main text-black-100">Novo documento</h1>
        <p className="mt-1 text-body text-black60">
          Cadastre um tipo de documento que os cartórios podem emitir.
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

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variante="neutro"
              type="button"
              onClick={() => router.push("/documentos")}
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
