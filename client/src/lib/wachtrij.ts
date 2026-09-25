// Client-helper voor de analyse-wachtrij: indienen met ?async=1, daarna de
// plek in de rij volgen tot het resultaat klaar is. Werkt ook als de server
// (nog) synchroon antwoordt.

export interface WachtrijStatus {
  jobId: string;
  status: "queued" | "running" | "done" | "error";
  plek: number;
  geschatteSeconden: number;
}

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));

function foutTekst(data: any, fallback: string): string {
  return [data?.error, data?.hint].filter(Boolean).join(" — ") || fallback;
}

function slaOp(sleutel: string | undefined, jobId: string | null) {
  if (!sleutel) return;
  try { jobId ? localStorage.setItem(sleutel, jobId) : localStorage.removeItem(sleutel); } catch { /* geen opslag beschikbaar */ }
}

export function bewaardeJob(sleutel: string): string | null {
  try { return localStorage.getItem(sleutel); } catch { return null; }
}

/** Volgt een bestaande job tot die klaar is en geeft het resultaat terug. */
export async function volgJob<T = any>(
  jobId: string,
  opts: { onStatus?: (s: WachtrijStatus) => void; opslagSleutel?: string } = {},
): Promise<T> {
  let netwerkFouten = 0;
  for (;;) {
    let res: Response;
    try {
      res = await fetch(`/api/analyse-jobs/${encodeURIComponent(jobId)}`, { credentials: "include" });
    } catch {
      if (++netwerkFouten > 20) throw new Error("Geen verbinding met de server. Probeer het later opnieuw.");
      await wacht(5000);
      continue;
    }
    netwerkFouten = 0;
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      slaOp(opts.opslagSleutel, null);
      throw new Error(foutTekst(data, "Deze analyse is niet meer beschikbaar. Start hem opnieuw."));
    }
    opts.onStatus?.(data as WachtrijStatus);
    if (data.status === "done") { slaOp(opts.opslagSleutel, null); return data.resultaat as T; }
    if (data.status === "error") { slaOp(opts.opslagSleutel, null); throw new Error(foutTekst(data.resultaat, "De analyse is mislukt. Probeer het opnieuw.")); }
    await wacht(data.status === "running" ? 3000 : 4000);
  }
}

/** Dient een analyse in via de wachtrij en wacht op het resultaat. */
export async function voerUitViaWachtrij<T = any>(
  url: string,
  init: RequestInit,
  opts: { returnPath: string; onStatus?: (s: WachtrijStatus) => void; opslagSleutel?: string },
): Promise<T> {
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}async=1&returnPath=${encodeURIComponent(opts.returnPath)}`, { credentials: "include", ...init });
  const data = await res.json().catch(() => ({} as any));
  if (res.status === 202 && data?.jobId) {
    slaOp(opts.opslagSleutel, data.jobId);
    opts.onStatus?.(data as WachtrijStatus);
    return volgJob<T>(data.jobId, opts);
  }
  if (!res.ok) throw new Error(foutTekst(data, `Er ging iets mis (${res.status}). Probeer het opnieuw.`));
  return data as T; // server antwoordde direct (synchroon)
}

/** Leesbare wachtrij-melding voor in de interface. */
export function wachtrijTekst(s: WachtrijStatus | null): string {
  if (!s) return "Je aanvraag wordt verstuurd…";
  const min = Math.max(1, Math.round(s.geschatteSeconden / 60));
  if (s.status === "queued") {
    return s.plek <= 1
      ? `Je bent als volgende aan de beurt (± ${min} min).`
      : `Je staat op plek ${s.plek} in de wachtrij (± ${min} min).`;
  }
  if (s.status === "running") return `Je brief wordt nu geanalyseerd (nog ± ${min} min).`;
  return "Bijna klaar…";
}
