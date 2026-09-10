"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lookupCep, type ViaCepAddress, type CepLookupResult } from "@/lib/viaCep";

type State = "idle" | "loading" | "ok" | "not-found" | "unavailable";

/**
 * Dispara consulta de CEP quando o campo atinge 8 dígitos.
 *
 * Nunca bloqueia o formulário: CEP desconhecido ou ViaCEP fora só informam, e
 * os campos de endereço permanecem editáveis manualmente.
 */
export function useCepLookup(onFound: (address: ViaCepAddress) => void) {
  const [state, setState] = useState<State>("idle");
  const lastLookedUp = useRef<string | null>(null);
  const currentRequest = useRef(0);

  // Parent callback changes every render; storing it in a ref avoids re-running
  // lookup just because the parent re-rendered.
  const callbackRef = useRef(onFound);
  useEffect(() => {
    callbackRef.current = onFound;
  });

  const lookup = useCallback(async (value: string) => {
    const cep = value.replace(/\D/g, "");
    if (cep.length !== 8) {
      setState("idle");
      lastLookedUp.current = null;
      return;
    }
    // Without this, every keystroke after the eighth digit repeats the call.
    if (cep === lastLookedUp.current) return;
    lastLookedUp.current = cep;

    const id = ++currentRequest.current;
    setState("loading");
    const result: CepLookupResult = await lookupCep(cep);

    // Discard response from a lookup that was superseded by another.
    if (id !== currentRequest.current) return;

    if (result.type === "ok") {
      callbackRef.current(result.address);
      setState("ok");
    } else {
      setState(result.type);
    }
  }, []);

  const message =
    state === "not-found"
      ? "CEP não encontrado. Preencha o endereço manualmente."
      : state === "unavailable"
        ? "Não foi possível consultar o CEP agora. Preencha o endereço manualmente."
        : null;

  return { lookup, loading: state === "loading", message };
}
