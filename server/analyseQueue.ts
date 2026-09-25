// ─────────────────────────────────────────────────────────────
// Wachtrij voor zware AI-analyses (lokale AI op CPU verwerkt er één tegelijk).
//
// • Een aanvraag krijgt direct een jobId + plek in de rij (HTTP 202);
//   de server werkt de jobs één voor één af.
// • De client pollt GET /api/analyse-jobs/:id voor plek, schatting en resultaat.
// • Privacy: invoer en resultaat staan ALLEEN in het werkgeheugen (niet in de
//   database). De invoer (brieftekst/bestand) wordt direct na verwerking
//   losgelaten; het resultaat verdwijnt na 24 uur. Bij een herstart van de
//   server vervallen lopende jobs (de gebruiker krijgt "probeer opnieuw").
// • Heeft de gebruiker het venster gesloten, dan volgt een mail als het klaar is.
// ─────────────────────────────────────────────────────────────
import crypto from "crypto";

type JobStatus = "queued" | "running" | "done" | "error";
export interface JobResultaat { status: number; body: any }

interface Job {
  id: string;
  userId: string;
  email?: string;
  firstName?: string;
  returnPath: string;
  status: JobStatus;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  lastPolledAt: number;
  httpStatus?: number;
  body?: any;
  run: (() => Promise<JobResultaat>) | null;
}

const MAX_WACHTRIJ = 200;
const MAX_PER_GEBRUIKER = 3;
const BEWAAR_MS = 24 * 60 * 60 * 1000;
const WEG_NA_MS = 45_000; // niet gepold in 45s = venster gesloten → mail

const jobs = new Map<string, Job>();
const rij: string[] = [];
let bezig: string | null = null;
let gemiddeldeMs = 100_000; // startschatting; past zich aan op echte duur

const TOEGESTANE_PADEN = /^\/[a-z0-9/_-]{0,80}$/i;

export class WachtrijFout extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Zet een job in de rij. Gooit WachtrijFout bij limieten. */
export function zetInRij(opts: {
  user: { id: string; email?: string; firstName?: string | null };
  returnPath?: string;
  run: () => Promise<JobResultaat>;
}): ReturnType<typeof jobWeergave> {
  const actief = [...jobs.values()].filter((j) => j.userId === opts.user.id && (j.status === "queued" || j.status === "running")).length;
  if (actief >= MAX_PER_GEBRUIKER) {
    throw new WachtrijFout(429, `Je hebt al ${MAX_PER_GEBRUIKER} analyses in de wachtrij. Wacht tot die klaar zijn.`);
  }
  if (rij.length >= MAX_WACHTRIJ) {
    throw new WachtrijFout(503, "Het is op dit moment erg druk. Probeer het over een paar minuten opnieuw.");
  }
  const id = crypto.randomUUID();
  const job: Job = {
    id,
    userId: opts.user.id,
    email: opts.user.email,
    firstName: opts.user.firstName || undefined,
    returnPath: opts.returnPath && TOEGESTANE_PADEN.test(opts.returnPath) ? opts.returnPath : "/regels/documenten",
    status: "queued",
    createdAt: Date.now(),
    lastPolledAt: Date.now(),
    run: opts.run,
  };
  jobs.set(id, job);
  rij.push(id);
  setImmediate(verwerk);
  return jobWeergave(job);
}

function jobWeergave(job: Job) {
  const plekInRij = rij.indexOf(job.id); // -1 als niet (meer) in de rij
  const voor = plekInRij >= 0 ? plekInRij + (bezig ? 1 : 0) : 0;
  const lopendResterend = bezig && job.status === "queued"
    ? Math.max(10_000, gemiddeldeMs - (Date.now() - (jobs.get(bezig)?.startedAt || Date.now())))
    : 0;
  const schattingMs =
    job.status === "queued" ? lopendResterend + Math.max(0, voor - (bezig ? 1 : 0)) * gemiddeldeMs + gemiddeldeMs
    : job.status === "running" ? Math.max(5_000, gemiddeldeMs - (Date.now() - (job.startedAt || Date.now())))
    : 0;
  return {
    jobId: job.id,
    status: job.status,
    plek: job.status === "queued" ? voor + 1 : 0,
    geschatteSeconden: Math.round(schattingMs / 1000),
    ...(job.status === "done" || job.status === "error" ? { httpStatus: job.httpStatus, resultaat: job.body } : {}),
  };
}

async function verwerk(): Promise<void> {
  if (bezig) return;
  const id = rij.shift();
  if (!id) return;
  const job = jobs.get(id);
  if (!job || !job.run) { setImmediate(verwerk); return; }
  bezig = id;
  job.status = "running";
  job.startedAt = Date.now();
  try {
    const r = await job.run();
    job.httpStatus = r.status;
    job.body = r.body;
    job.status = r.status < 400 ? "done" : "error";
  } catch (e: any) {
    console.error("[Wachtrij] job mislukt:", e?.message || e);
    job.httpStatus = 500;
    job.body = { error: "De analyse is mislukt. Probeer het opnieuw." };
    job.status = "error";
  } finally {
    job.finishedAt = Date.now();
    job.run = null; // invoer (brief/bestand) direct loslaten
    const duur = job.finishedAt - (job.startedAt || job.finishedAt);
    if (job.status === "done") gemiddeldeMs = Math.round(gemiddeldeMs * 0.7 + duur * 0.3);
    bezig = null;
    console.log(`[Wachtrij] job ${job.id.slice(0, 8)} ${job.status} in ${Math.round(duur / 1000)}s — nog ${rij.length} in de rij`);
    void mailAlsWeg(job);
    setImmediate(verwerk);
  }
}

async function mailAlsWeg(job: Job): Promise<void> {
  if (!job.email || Date.now() - job.lastPolledAt < WEG_NA_MS) return;
  try {
    const { sendAnalyseKlaarEmail } = await import("./services/emailService");
    const basis = process.env.PUBLIC_BASE_URL || "https://www.openregio.nl";
    await sendAnalyseKlaarEmail(job.email, job.firstName || "", `${basis}${job.returnPath}?job=${job.id}`, job.status === "done");
  } catch (e: any) {
    console.error("[Wachtrij] klaar-mail mislukt:", e?.message || e);
  }
}

// Opruimen: afgeronde jobs na 24 uur weg.
setInterval(() => {
  const nu = Date.now();
  for (const [id, j] of jobs) if (j.finishedAt && nu - j.finishedAt > BEWAAR_MS) jobs.delete(id);
}, 10 * 60 * 1000).unref();

/** Voert een bestaande Express-handler uit en vangt status + JSON op. */
export async function voerHandlerUit(handler: (req: any, res: any) => any, req: any): Promise<JobResultaat> {
  let status = 200;
  let klaar = false;
  let body: any = null;
  const nep: any = {
    headersSent: false,
    status(c: number) { status = c; return nep; },
    json(b: any) { if (!klaar) { klaar = true; body = b; nep.headersSent = true; } return nep; },
    send(b: any) { return nep.json(b); },
    end() { return nep.json(null); },
    setHeader() { return nep; }, set() { return nep; }, type() { return nep; },
  };
  try {
    await handler(req, nep);
  } catch (e: any) {
    console.error("[Wachtrij] handler-fout:", e?.message || e);
    return { status: 500, body: { error: "De analyse is mislukt. Probeer het opnieuw." } };
  }
  return klaar ? { status, body } : { status: 500, body: { error: "De analyse gaf geen antwoord. Probeer het opnieuw." } };
}

/**
 * Omhulsel voor een bestaande handler: met ?async=1 gaat het verzoek de wachtrij in
 * (202 + jobId); zonder blijft alles synchroon zoals vroeger.
 */
export function viaWachtrij(handler: (req: any, res: any) => any) {
  return async (req: any, res: any) => {
    if (req.query?.async !== "1") return handler(req, res);
    if (!req.user?.id) return res.status(401).json({ error: "Niet ingelogd" });
    try {
      const view = zetInRij({
        user: req.user,
        returnPath: typeof req.query?.returnPath === "string" ? req.query.returnPath : undefined,
        run: () => voerHandlerUit(handler, req),
      });
      res.status(202).json(view);
    } catch (e: any) {
      if (e instanceof WachtrijFout) return res.status(e.status).json({ error: e.message });
      throw e;
    }
  };
}

/** GET /api/analyse-jobs/:id — alleen de eigenaar mag zijn job zien. */
export function registreerWachtrijRoutes(app: any, requireAuth: any): void {
  app.get("/api/analyse-jobs/:id", requireAuth, (req: any, res: any) => {
    const job = jobs.get(String(req.params.id));
    if (!job || job.userId !== req.user?.id) {
      return res.status(404).json({ error: "Deze analyse is niet (meer) beschikbaar. Mogelijk is de server herstart — start de analyse opnieuw." });
    }
    job.lastPolledAt = Date.now();
    res.json(jobWeergave(job));
  });
}
