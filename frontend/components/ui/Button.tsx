"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variante = "primario" | "neutro" | "perigo";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  carregando?: boolean;
  children: ReactNode;
};

const variantes: Record<Variante, string> = {
  // Roxo, não verde: no XD o botão primário é da mesma família do rodapé e das
  // faixas do header. Verde no arquivo é sucesso (toast) e o badge "Em andamento".
  primario:
    "bg-purple text-white hover:bg-purple-dark focus-visible:ring-purple",
  neutro:
    "border border-black20 bg-white text-black-100 hover:bg-black10 focus-visible:ring-black60",
  perigo: "bg-red text-white hover:bg-red-medium focus-visible:ring-red",
};

export function Button({
  variante = "primario",
  carregando = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || carregando}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-body font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantes[variante],
        className,
      )}
      {...props}
    >
      {carregando ? <Spinner tamanho="sm" /> : null}
      {children}
    </button>
  );
}
