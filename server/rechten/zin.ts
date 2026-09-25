// Zinnen uit een brief halen als letterlijk citaat (zonder AI).
/** Afkortingen waarna een punt geen zinseinde is. */
const AFKORTING = /(?:\b(?:art|nr|lid|bijv|ca|jl|resp|mr|dr|ir|drs|ing|mw|dhr|t\.a\.v|m\.b\.t|i\.v\.m|o\.a)|\b[A-Za-z])$/i;
/** Einde van een zin? Niet bij "5.000", "art. 5", "B.V." of "J. de Vries". */
export function isEinde(t: string, i: number): boolean {
  const c = t[i];
  if (c === "\n") return true;
  if (c !== "." && c !== "!" && c !== "?") return false;
  const volgend = t[i + 1];
  if (volgend && !/\s/.test(volgend)) return false;
  return !AFKORTING.test(t.slice(Math.max(0, i - 8), i));
}
/** De zin waarin een match staat, als letterlijk citaat. */
export function zinRond(t: string, idx: number, len: number): string {
  let a = idx; while (a > 0 && !isEinde(t, a - 1)) a--;
  let b = idx + len; while (b < t.length && !isEinde(t, b)) b++;
  const z = t.slice(a, b + 1).replace(/\s+/g, " ").trim();
  return z.length > 240 ? z.slice(0, 237) + "…" : z;
}
export function eerste(t: string, re: RegExp): { m: RegExpMatchArray; zin: string } | null {
  const m = t.match(re);
  return m && m.index !== undefined ? { m, zin: zinRond(t, m.index, m[0].length) } : null;
}

