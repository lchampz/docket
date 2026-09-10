"use client";

import { useToast, useToasts } from "@/contexts/ToastContext";
import { cn } from "@/lib/cn";

function SuccessIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 10l3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Toaster() {
  const toasts = useToasts();
  const { close } = useToast();

  // Live region is ALWAYS in the DOM, even when empty. Screen readers only
  // announce content inserted into an existing live region — if the container
  // appears together with the message, the announcement is lost.
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 empty:hidden"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-center gap-3 rounded px-4 py-3 shadow-md",
              isSuccess
                ? "bg-green-light text-green-dark"
                : "bg-red-medium text-white",
            )}
          >
            {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
            <p className="flex-1 text-body">{toast.message}</p>
            <button
              type="button"
              onClick={() => close(toast.id)}
              className={cn(
                "rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                isSuccess
                  ? "hover:bg-green-dark/10 focus-visible:ring-green-dark"
                  : "hover:bg-white/20 focus-visible:ring-white",
              )}
              aria-label="Fechar notificação"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
