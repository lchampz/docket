"use client";

import { type SelectHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label?: string;
  obrigatorio?: boolean;
  erro?: string;
  hint?: string;
  id?: string;
  children: React.ReactNode;
};

export function Select({
  label,
  obrigatorio = false,
  erro,
  hint,
  className,
  id: idProp,
  children,
  ...props
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const erroId = `${id}-erro`;
  const hintId = `${id}-hint`;
  const temErro = Boolean(erro);

  const describedBy = [temErro ? erroId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={id} className="text-body font-semibold text-black-100">
          {label}
          {obrigatorio ? (
            <span className="text-red" aria-hidden="true"> *</span>
          ) : null}
        </label>
      ) : null}

      <select
        id={id}
        aria-invalid={temErro || undefined}
        aria-describedby={describedBy}
        className={cn(
          "rounded border bg-white px-3 py-2 text-body text-black-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-1",
          temErro ? "border-red" : "border-black20",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      {hint && !temErro ? (
        <p id={hintId} className="text-small text-black60">
          {hint}
        </p>
      ) : null}

      {temErro ? (
        <p id={erroId} role="alert" className="text-small text-red">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
