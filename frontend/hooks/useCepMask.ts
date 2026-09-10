"use client";

import {
  type ChangeEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  displayIndexAtRaw,
  formatCep,
  onlyDigits,
  rawIndexBefore,
} from "./maskUtils";

type UseCepMaskReturn = {
  value: string;
  raw: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setRaw: (value: string) => void;
};

export function useCepMask(initialValue = ""): UseCepMaskReturn {
  const [raw, setRawState] = useState(() => onlyDigits(initialValue).slice(0, 8));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRawRef = useRef<number | null>(null);

  const value = formatCep(raw);

  useLayoutEffect(() => {
    if (cursorRawRef.current === null || !inputRef.current) return;
    const pos = displayIndexAtRaw(value, cursorRawRef.current);
    inputRef.current.setSelectionRange(pos, pos);
    cursorRawRef.current = null;
  }, [value]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPos = input.selectionStart ?? 0;
    const rawBefore = rawIndexBefore(input.value, cursorPos);
    const newRaw = onlyDigits(input.value).slice(0, 8);
    cursorRawRef.current = Math.min(rawBefore, newRaw.length);
    setRawState(newRaw);
  }, []);

  const setRaw = useCallback((value: string) => {
    const limited = onlyDigits(value).slice(0, 8);
    cursorRawRef.current = limited.length;
    setRawState(limited);
  }, []);

  return { value, raw, onChange, inputRef, setRaw };
}
