"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { useCpfCnpjMask } from "@/hooks/useCpfCnpjMask";
import type { TipoPessoa } from "@/lib/api/types";

/**
 * Campo CPF/CNPJ.
 *
 * Label, máscara e tamanho seguem o tipo de pessoa. O componente remonta quando
 * o tipo muda (via `key` no pai), então nenhum valor de um formato vaza pro outro.
 */
export function DocumentoIdentificacaoField({
  tipoPessoa,
  error,
  onChange,
}: {
  tipoPessoa: TipoPessoa;
  error?: string;
  onChange: (raw: string) => void;
}) {
  const isFisica = tipoPessoa === "FISICA";
  const { value, raw, onChange: onInput, inputRef } = useCpfCnpjMask(tipoPessoa);

  useEffect(() => {
    onChange(raw);
    // Parent `onChange` changes every render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  return (
    <Input
      ref={inputRef}
      label={isFisica ? "CPF" : "CNPJ"}
      obrigatorio
      erro={error}
      value={value}
      onChange={onInput}
      inputMode={isFisica ? "numeric" : "text"}
      autoComplete="off"
      placeholder={isFisica ? "000.000.000-00" : "00.AAA.000/0000-00"}
      hint={
        isFisica
          ? undefined
          : "O CNPJ passou a aceitar letras nos 12 primeiros caracteres."
      }
    />
  );
}
