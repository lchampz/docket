import { NavLinks } from "./NavLinks";

/**
 * Header do layout: barra escura de 56px com faixas diagonais roxas à esquerda.
 *
 * No XD isso é um bitmap de 1366x56 — as faixas são largas e diagonais, não
 * hachura fina. Reproduzido em CSS para não carregar imagem; os roxos são
 * aproximados da arte (ver docs Contexto/Layout.md).
 */
export function Header() {
  return (
    <header className="relative h-14 overflow-hidden bg-black-100">
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            108deg,
            transparent 0 6%,
            var(--purple-dark) 6% 13%,
            transparent 13% 17%,
            var(--purple) 17% 30%,
            var(--purple-light) 30% 34%,
            var(--purple) 34% 47%,
            transparent 47% 52%,
            var(--purple-dark) 52% 58%,
            transparent 58% 100%
          )`,
        }}
      />
      {/* Esfumaça a borda direita das faixas contra o fundo escuro. */}
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent 0 55%, var(--black-100) 100%)",
        }}
      />
      <div className="relative z-10 flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <span className="shrink-0 text-h4-title font-bold tracking-wide text-white">
          Docket
        </span>
        <NavLinks />
      </div>
    </header>
  );
}
