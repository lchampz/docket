import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCepMask } from "./useCepMask";

describe("useCepMask", () => {
  it("formata CEP e descarta não-dígito", () => {
    const { result } = renderHook(() => useCepMask("01310100"));
    expect(result.current.value).toBe("01310-100");
    expect(result.current.raw).toBe("01310100");
  });

  it("ignora letras na entrada inicial", () => {
    const { result } = renderHook(() => useCepMask("01310-1OO"));
    expect(result.current.raw).toBe("013101");
    expect(result.current.value).toBe("01310-1");
  });
});
