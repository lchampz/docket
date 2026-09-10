import { cn } from "@/lib/cn";

type SpinnerProps = {
  tamanho?: "sm" | "md" | "lg";
  className?: string;
};

const tamanhos = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({ tamanho = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        tamanhos[tamanho],
        className,
      )}
    />
  );
}
