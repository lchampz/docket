import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./client";
import { applyApiErrorToForm } from "./formErrors";

describe("applyApiErrorToForm", () => {
  it("ApiError de validação distribui erros nos campos", () => {
    const setError = vi.fn();
    const error = new ApiError(400, "VALIDACAO", "Inválido", [
      { field: "nome", message: "Obrigatório" },
    ]);

    expect(applyApiErrorToForm(error, setError)).toBeNull();
    expect(setError).toHaveBeenCalledWith("nome", "Obrigatório");
  });

  it("409 NOME_DUPLICADO com mapa cai no campo", () => {
    const setError = vi.fn();
    const error = new ApiError(409, "NOME_DUPLICADO", "Nome já existe");

    expect(
      applyApiErrorToForm(error, setError, { NOME_DUPLICADO: "nome" }),
    ).toBeNull();
    expect(setError).toHaveBeenCalledWith("nome", "Nome já existe");
  });

  it("409 sem mapa devolve mensagem para toast", () => {
    const setError = vi.fn();
    const error = new ApiError(409, "RECURSO_EM_USO", "Em uso");

    expect(applyApiErrorToForm(error, setError)).toBe("Em uso");
    expect(setError).not.toHaveBeenCalled();
  });

  it("erro que não é ApiError devolve mensagem genérica", () => {
    const setError = vi.fn();

    expect(applyApiErrorToForm(new Error("boom"), setError)).toBe(
      "Ocorreu um erro inesperado.",
    );
  });
});
