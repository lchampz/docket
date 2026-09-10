"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastType = "success" | "error";
export type Toast = { id: number; type: ToastType; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  close: (id: number) => void;
};

/**
 * Context kept separate from the order context on purpose.
 *
 * Toasts change several times per interaction. If they lived in the same provider
 * as the request list, every toast would re-render the entire list — and Context
 * is already the weak performance point of this app.
 */
const ToastsContext = createContext<Toast[]>([]);
const ToastApiContext = createContext<ToastApi | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const close = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => close(id), 5000);
    },
    [close],
  );

  // API is stable across renders: callers that only fire toasts never re-render
  // because of someone else's toast.
  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => add("success", m),
      error: (m) => add("error", m),
      close,
    }),
    [add, close],
  );

  return (
    <ToastApiContext.Provider value={api}>
      <ToastsContext.Provider value={toasts}>{children}</ToastsContext.Provider>
    </ToastApiContext.Provider>
  );
}

export function useToast() {
  const api = useContext(ToastApiContext);
  if (!api) throw new Error("useToast must be used within <ToastProvider>");
  return api;
}

export const useToasts = () => useContext(ToastsContext);
