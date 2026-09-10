import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupCep } from "./viaCep";

describe("lookupCep", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resposta normal devolve endereço", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          logradouro: "Av. Paulista",
          bairro: "Bela Vista",
          localidade: "São Paulo",
          uf: "sp",
        }),
      }),
    );

    const result = await lookupCep("01310-100");
    expect(result).toEqual({
      type: "ok",
      address: {
        rua: "Av. Paulista",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      },
    });
  });

  it("200 com erro true devolve not-found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ erro: true }),
      }),
    );

    expect(await lookupCep("01310100")).toEqual({ type: "not-found" });
  });

  it('200 com erro "true" como string devolve not-found', async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ erro: "true" }),
      }),
    );

    expect(await lookupCep("01310100")).toEqual({ type: "not-found" });
  });

  it("fetch rejeitando devolve unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    expect(await lookupCep("01310100")).toEqual({ type: "unavailable" });
  });

  it("CEP com menos de 8 dígitos não chama fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await lookupCep("01310")).toEqual({ type: "not-found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
