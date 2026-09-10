"use client";

import {
  type ChangeEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { TipoPessoa } from "@/lib/api/types";
import {
  displayIndexAtRaw,
  extractCnpjRaw,
  formatCnpj,
  formatCpf,
  onlyDigits,
  rawIndexBefore,
} from "./maskUtils";

type UseCpfCnpjMaskReturn = {
  value: string;
  raw: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setRaw: (value: string) => void;
};

function parseInitial(tipoPessoa: TipoPessoa, value: string): string {
  if (tipoPessoa === "FISICA") return onlyDigits(value).slice(0, 11);
  return extractCnpjRaw(value).slice(0, 14);
}

function format(tipoPessoa: TipoPessoa, raw: string): string {
  return tipoPessoa === "FISICA" ? formatCpf(raw) : formatCnpj(raw);
}

function extract(tipoPessoa: TipoPessoa, value: string): string {
  if (tipoPessoa === "FISICA") return onlyDigits(value).slice(0, 11);
  return extractCnpjRaw(value).slice(0, 14);
}

export function useCpfCnpjMask(
  tipoPessoa: TipoPessoa,
  initialValue = "",
): UseCpfCnpjMaskReturn {
  const maxLen = tipoPessoa === "FISICA" ? 11 : 14;
  const [raw, setRawState] = useState(() =>
    parseInitial(tipoPessoa, initialValue),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRawRef = useRef<number | null>(null);

  const value = format(tipoPessoa, raw);

  useLayoutEffect(() => {
    if (cursorRawRef.current === null || !inputRef.current) return;
    const pos = displayIndexAtRaw(value, cursorRawRef.current);
    inputRef.current.setSelectionRange(pos, pos);
    cursorRawRef.current = null;
  }, [value]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const cursorPos = input.selectionStart ?? 0;
      const rawBefore = rawIndexBefore(input.value, cursorPos);
      const newRaw = extract(tipoPessoa, input.value).slice(0, maxLen);
      cursorRawRef.current = Math.min(rawBefore, newRaw.length);
      setRawState(newRaw);
    },
    [tipoPessoa, maxLen],
  );

  const setRaw = useCallback(
    (value: string) => {
      const limited = parseInitial(tipoPessoa, value).slice(0, maxLen);
      cursorRawRef.current = limited.length;
      setRawState(limited);
    },
    [tipoPessoa, maxLen],
  );

  return { value, raw, onChange, inputRef, setRaw };
}
