import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icone: ReactNode;
  mensagem: string;
  className?: string;
};

export function EmptyState({ icone, mensagem, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      <div className="text-grey-40" aria-hidden="true">{icone}</div>
      <p className="text-body text-black60">{mensagem}</p>
    </div>
  );
}
