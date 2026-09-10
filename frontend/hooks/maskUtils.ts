/** Conta quantos caracteres brutos existem antes de `pos` na string formatada. */
export function rawIndexBefore(formatted: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < formatted.length; i++) {
    if (isSlotChar(formatted[i])) count++;
  }
  return count;
}

/** Posição na string formatada correspondente ao índice bruto. */
export function displayIndexAtRaw(formatted: string, rawIndex: number): number {
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (count === rawIndex) return i;
    if (isSlotChar(formatted[i])) count++;
  }
  return formatted.length;
}

function isSlotChar(ch: string): boolean {
  return /[0-9A-Za-z]/.test(ch);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function sanitizeCnpjChar(ch: string, index: number): string | null {
  const upper = ch.toUpperCase();
  if (index < 12) {
    return /^[0-9A-Z]$/.test(upper) ? upper : null;
  }
  return /^[0-9]$/.test(ch) ? ch : null;
}

export function extractCnpjRaw(value: string): string {
  let raw = "";
  for (const ch of value) {
    const upper = ch.toUpperCase();
    const next = sanitizeCnpjChar(upper, raw.length);
    if (next !== null && raw.length < 14) raw += next;
  }
  return raw;
}

export function formatCep(raw: string): string {
  const d = onlyDigits(raw).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatCpf(raw: string): string {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(raw: string): string {
  const r = raw.slice(0, 14);
  let out = "";
  for (let i = 0; i < r.length; i++) {
    if (i === 2 || i === 5) out += ".";
    if (i === 8) out += "/";
    if (i === 12) out += "-";
    out += r[i];
  }
  return out;
}
