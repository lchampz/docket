/**
 * Consulta de endereço por CEP.
 *
 * ViaCEP é serviço público gratuito: cai, fica lento e responde de formas
 * estranhas. Nada aqui pode impedir o cadastro de cartório — autopreenchimento
 * é conveniência, não pré-requisito.
 */

const TIMEOUT_MS = 5_000;

export type ViaCepAddress = {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type CepLookupResult =
  | { type: "ok"; address: ViaCepAddress }
  | { type: "not-found" }
  | { type: "unavailable" };

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export async function lookupCep(maskedCep: string): Promise<CepLookupResult> {
  const cep = maskedCep.replace(/\D/g, "");
  if (cep.length !== 8) return { type: "not-found" };

  let response: Response;
  try {
    response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { type: "unavailable" };
  }

  if (!response.ok) return { type: "unavailable" };

  let data: ViaCepResponse;
  try {
    data = (await response.json()) as ViaCepResponse;
  } catch {
    return { type: "unavailable" };
  }

  // ViaCEP returns 200 with {"erro": true} for unknown zip codes. Trusting HTTP
  // status here would fill the form with undefined.
  // In some responses the field comes as the string "true".
  if (data.erro === true || data.erro === "true") {
    return { type: "not-found" };
  }

  return {
    type: "ok",
    address: {
      rua: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: (data.uf ?? "").toUpperCase(),
    },
  };
}
