"use client";

import { Button } from "./Button";
import { cn } from "@/lib/cn";

type PaginationProps = {
  pagina: number;
  totalPaginas: number;
  onPagina: (pagina: number) => void;
  className?: string;
};

export function Pagination({
  pagina,
  totalPaginas,
  onPagina,
  className,
}: PaginationProps) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="Paginação"
    >
      <Button
        variante="neutro"
        disabled={pagina === 0}
        onClick={() => onPagina(pagina - 1)}
        aria-label="Página anterior"
      >
        Anterior
      </Button>

      {paginas.map((numero) => (
        <Button
          key={numero}
          variante={numero === pagina ? "primario" : "neutro"}
          onClick={() => onPagina(numero)}
          aria-label={`Página ${numero + 1}`}
          aria-current={numero === pagina ? "page" : undefined}
          className="min-w-10 px-3"
        >
          {numero + 1}
        </Button>
      ))}

      <Button
        variante="neutro"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onPagina(pagina + 1)}
        aria-label="Próxima página"
      >
        Próxima
      </Button>
    </nav>
  );
}
