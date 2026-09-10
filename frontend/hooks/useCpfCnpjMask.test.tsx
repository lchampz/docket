import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import type { TipoPessoa } from "@/lib/api/types";
import { useCpfCnpjMask } from "./useCpfCnpjMask";

function CpfInput({ initial = "" }: { initial?: string }) {
  const { value, onChange, inputRef } = useCpfCnpjMask("FISICA", initial);
  return <input ref={inputRef} value={value} onChange={onChange} data-testid="cpf" />;
}

function MaskHarness({ tipo }: { tipo: TipoPessoa }) {
  const { value, raw } = useCpfCnpjMask(tipo, tipo === "FISICA" ? "11144477735" : "");
  return (
    <div>
      <span data-testid="value">{value}</span>
      <span data-testid="raw">{raw}</span>
    </div>
  );
}

describe("useCpfCnpjMask", () => {
  it("formata CPF", () => {
    const { result } = renderHook(() => useCpfCnpjMask("FISICA", "11144477735"));
    expect(result.current.value).toBe("111.444.777-35");
  });

  it("formata CNPJ alfanumérico", () => {
    const { result } = renderHook(() => useCpfCnpjMask("JURIDICA", "12abc34501de35"));
    expect(result.current.value).toBe("12.ABC.345/01DE-35");
  });

  it("editar no meio de um CPF preenchido não joga o cursor para o fim", async () => {
    const user = userEvent.setup();
    render(<CpfInput initial="11144477735" />);
    const input = screen.getByTestId("cpf") as HTMLInputElement;

    await user.click(input);
    input.setSelectionRange(4, 4);
    await user.keyboard("9");

    expect(input.selectionStart).toBeLessThan(input.value.length);
    expect(input.selectionStart).not.toBe(input.value.length);
  });

  it("trocar tipoPessoa limpa o valor (remount via key)", () => {
    const { rerender } = render(<MaskHarness key="FISICA" tipo="FISICA" />);
    expect(screen.getByTestId("raw")).toHaveTextContent("11144477735");

    rerender(<MaskHarness key="JURIDICA" tipo="JURIDICA" />);
    expect(screen.getByTestId("raw")).toHaveTextContent("");
    expect(screen.getByTestId("value")).toHaveTextContent("");
  });
});
