"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

type ConfirmDialogProps = {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Excluir",
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (aberto) {
      triggerRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) dialog.showModal();
      const primeiro = caixaRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      primeiro?.focus();
    } else if (dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [aberto]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === "Tab" && caixaRef.current) {
        const focusables = Array.from(
          caixaRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (focusables.length === 0) return;

        const primeiro = focusables[0];
        const ultimo = focusables[focusables.length - 1];
        const ativo = document.activeElement as HTMLElement;

        if (e.shiftKey && ativo === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && ativo === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    },
    [],
  );

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancelar();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 bg-transparent p-0",
        "backdrop:bg-black-100/50",
      )}
      aria-labelledby="confirm-dialog-titulo"
      aria-describedby="confirm-dialog-mensagem"
    >
      <div className="flex size-full items-center justify-center p-4">
        <div
          ref={caixaRef}
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        >
          <h2
            id="confirm-dialog-titulo"
            className="text-h4-title text-black-100"
          >
            {titulo}
          </h2>
          <p
            id="confirm-dialog-mensagem"
            className="mt-2 text-body text-black60"
          >
            {mensagem}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="neutro" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button variante="perigo" onClick={onConfirmar}>
              {textoConfirmar}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
