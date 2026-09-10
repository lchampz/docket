import { act, render, renderHook, screen } from "@testing-library/react";
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

describe("remoção de caracteres", () => {
  it("apaga o último dígito e reformata", () => {
    const { result } = renderHook(() => useCpfCnpjMask("FISICA"));

    act(() => {
      result.current.setRaw("11144477735");
    });
    expect(result.current.value).toBe("111.444.777-35");

    // O navegador entrega o valor já sem o caractere apagado.
    act(() => {
      result.current.onChange({
        target: { value: "111.444.777-3", selectionStart: 13 },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe("111.444.777-3");
    expect(result.current.raw).toBe("1114447773");
  });

  it("apagar tudo esvazia o valor bruto", () => {
    const { result } = renderHook(() => useCpfCnpjMask("FISICA"));
    act(() => result.current.setRaw("11144477735"));

    act(() => {
      result.current.onChange({
        target: { value: "", selectionStart: 0 },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.raw).toBe("");
    expect(result.current.value).toBe("");
  });

  it("CNPJ alfanumérico também aceita remoção", () => {
    const { result } = renderHook(() => useCpfCnpjMask("JURIDICA"));
    act(() => result.current.setRaw("12ABC34501DE35"));
    expect(result.current.value).toBe("12.ABC.345/01DE-35");

    act(() => {
      result.current.onChange({
        target: { value: "12.ABC.345/01DE-3", selectionStart: 17 },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.raw).toBe("12ABC34501DE3");
  });
});
