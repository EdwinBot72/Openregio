import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { voerUitViaWachtrij, volgJob, wachtrijTekst, type WachtrijStatus } from "@/lib/wachtrij";
import { DoorsturenNaarOpenRegio } from "@/components/DoorsturenNaarOpenRegio";
import { AlertCircle, ArrowRight, CheckCircle2, Download, FileText, Loader2, Printer, RotateCcw, Upload, X } from "lucide-react";
import { downloadUitlegPdf } from "@/lib/rapport-pdf";

export type UitlegSoort = "brief" | "contract";

interface Begrip { term: string; citaat: string; betekenis: string; controleer: string; ermee: string; wet?: string; letOp?: boolean }
interface Uitleg {
  soort: UitlegSoort;
  kop: { onderwerp?: string; afzender?: string; datum?: string; kenmerk?: string };
  partijen: string[];
  gewoneTaal: string[];
  juridisch: string[];
  watMoetJe: string[];
  verplichtingen: { partij: string; moet: string[] }[];
  soortBrief?: string;
  termijnen: string[];
  bedragen: string[];
  begrippen: Begrip[];
  aiGebruikt: boolean;
  omvang: { tekens: number; ingekort: boolean };
}

const NAVY = "#0b2240";
const MAX_BESTANDEN = 10;

const TEKST: Record<UitlegSoort, { titel: string; intro: string; plakken: string; knop: string; leeg: string }> = {
  brief: {
    titel: "Brievenagent",
    intro: "Upload een brief of plak de tekst. Je krijgt uitleg in gewone taal én juridisch: wat er staat, wat het betekent, wat er van je gevraagd wordt en welke juridische begrippen erin staan.",
    plakken: "Plak hier de tekst van de brief…",
    knop: "Leg deze brief uit",
    leeg: "brief",
  },
  contract: {
    titel: "Contractagent",
    intro: "Upload een contract, offerte of algemene voorwaarden, of plak de tekst. Je krijgt uitleg in gewone taal én juridisch: wat jullie afspreken, wie wat moet doen, en welke bepalingen extra aandacht verdienen.",
    plakken: "Plak hier de tekst van het contract…",
    knop: "Leg dit contract uit",
    leeg: "contract",
  },
};

function Blok({ titel, uitleg, children }: { titel: string; uitleg?: string; children: ReactNode }) {
  return (
    <section className="ua-sectie" style={{ marginBottom: 22 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: NAVY }}>{titel}</h3>
      {uitleg && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{uitleg}</p>}
      {children}
    </section>
  );
}

function Lijst({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

function Citaten({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
      {items.map((t, i) => (
        <li key={i} style={{ fontSize: 13, color: "#1f6b45", borderLeft: "3px solid #1f6b45", paddingLeft: 10 }}>“{t}”</li>
      ))}
    </ul>
  );
}

export function UitlegAgent({ soort, icoon }: { soort: UitlegSoort; icoon: ReactNode }) {
  const t = TEKST[soort];
  const sleutel = `openregio:job:${soort === "contract" ? "contractagent" : "brievenagent"}`;
  const pad = soort === "contract" ? "/agents/contractagent" : "/agents/brievenagent";
  const { toast } = useToast();
  const [modus, setModus] = useState<"upload" | "tekst">("upload");
  const [bestanden, setBestanden] = useState<File[]>([]);
  const [tekst, setTekst] = useState("");
  const [uitleg, setUitleg] = useState<Uitleg | null>(null);
  const [wachtStatus, setWachtStatus] = useState<WachtrijStatus | null>(null);
  const [seconden, setSeconden] = useState(0);
  const [toonWet, setToonWet] = useState(false);
  const [pdfBezig, setPdfBezig] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mut = useMutation({
    mutationFn: async (hervatJobId?: string): Promise<Uitleg> => {
      setUitleg(null);
      setWachtStatus(null);
      const opts = { returnPath: pad, onStatus: setWachtStatus, opslagSleutel: sleutel };
      if (hervatJobId) return volgJob<Uitleg>(hervatJobId, opts);
      const form = new FormData();
      form.append("soort", soort);
      if (modus === "upload") for (const b of bestanden) form.append("file", b);
      else form.append("tekst", tekst.trim());
      return voerUitViaWachtrij<Uitleg>("/api/uitleg", { method: "POST", body: form }, opts);
    },
    onSuccess: (u) => {
      setUitleg(u);
      setTimeout(() => document.getElementById("ua-resultaat")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    onError: (e: Error) => toast({ title: "Uitleg maken mislukt", description: e.message, variant: "destructive" }),
  });

  // Hervatten: vanuit de mail-link (?job=…) of een nog lopende uitleg in deze browser.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let jobId = params.get("job");
    if (jobId) window.history.replaceState(null, "", window.location.pathname);
    if (!jobId) { try { jobId = localStorage.getItem(sleutel); } catch { /* geen opslag */ } }
    if (jobId) mut.mutate(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mut.isPending) { setSeconden(0); return; }
    const i = setInterval(() => setSeconden((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [mut.isPending]);

  const voegToe = (lijst: FileList | null) => {
    const nieuw = Array.from(lijst ?? []);
    if (!nieuw.length) return;
    setBestanden((oud) => {
      const samen = [...oud, ...nieuw];
      if (samen.length > MAX_BESTANDEN) toast({ title: `Maximaal ${MAX_BESTANDEN} bestanden`, description: "Maak er één PDF van, of plak de tekst." });
      return samen.slice(0, MAX_BESTANDEN);
    });
    setUitleg(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const kan = modus === "upload" ? bestanden.length > 0 : tekst.trim().length >= 40;
  const opnieuw = () => { setUitleg(null); setBestanden([]); setTekst(""); };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .ua-print, .ua-print * { visibility: visible !important; }
          .ua-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0 10mm; }
          .ua-no-print { display: none !important; }
          .ua-sectie { break-inside: avoid; }
        }
      `}</style>

      <div className="ua-no-print">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: NAVY + "18", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY }}>{icoon}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>{t.titel}</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Uitleg in gewone taal en juridisch</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: "0 0 20px" }}>{t.intro}</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Button size="sm" variant={modus === "upload" ? "default" : "outline"} onClick={() => setModus("upload")} style={modus === "upload" ? { background: NAVY } : {}} data-testid={`button-${soort}-upload`}>
            <Upload size={14} /> Bestand uploaden
          </Button>
          <Button size="sm" variant={modus === "tekst" ? "default" : "outline"} onClick={() => setModus("tekst")} style={modus === "tekst" ? { background: NAVY } : {}} data-testid={`button-${soort}-tekst`}>
            <FileText size={14} /> Tekst plakken
          </Button>
        </div>

        <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 14, display: "grid", gap: 10 }}>
          {modus === "upload" ? (
            <>
              <input ref={fileRef} id={`ua-file-${soort}`} type="file" multiple accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.jpg,.jpeg,.jfif,.png,.webp,.bmp,.tif,.tiff,.heic,.heif" style={{ display: "none" }}
                onChange={(e) => voegToe(e.target.files)} data-testid={`input-${soort}-bestand`} />
              {bestanden.map((b, i) => (
                <div key={`${b.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc" }}>
                  <FileText size={16} style={{ color: NAVY, flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {bestanden.length > 1 ? `${i + 1}. ` : ""}{b.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{(b.size / 1024).toFixed(0)} KB</span>
                  <button aria-label={`Verwijder ${b.name}`} onClick={() => setBestanden((o) => o.filter((_, j) => j !== i))} style={{ background: "none", border: 0, cursor: "pointer", color: "#64748b" }}>
                    <X size={15} />
                  </button>
                </div>
              ))}
              {bestanden.length < MAX_BESTANDEN && (
                <label htmlFor={`ua-file-${soort}`} style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: bestanden.length ? "14px" : "32px 20px", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}>
                  <Upload size={24} style={{ color: "#94a3b8", margin: "0 auto 6px" }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{bestanden.length ? "Nog een pagina of bijlage toevoegen" : "Klik om je bestand te kiezen"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>PDF (ook gescand), Word, OpenDocument, RTF, TXT of foto (JPG, PNG, HEIC, WebP, TIFF) — max 10 MB per bestand, tot {MAX_BESTANDEN} bestanden</div>
                </label>
              )}
            </>
          ) : (
            <Textarea placeholder={t.plakken} value={tekst} onChange={(e) => setTekst(e.target.value)} style={{ minHeight: 180, fontSize: 14 }} data-testid={`textarea-${soort}`} />
          )}
        </div>

        <div style={{ background: "#f0f7f4", border: "1px solid #cfe8dd", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "#2f5d4b", marginBottom: 14 }}>
          🔒 <strong>Veilig.</strong> De uitleg wordt gemaakt op onze eigen server met een lokale AI. Je document gaat niet naar externe partijen en wordt niet opgeslagen.
        </div>

        <Button disabled={!kan || mut.isPending} onClick={() => mut.mutate(undefined)} style={{ background: NAVY, width: "100%" }} data-testid={`button-${soort}-uitleg`}>
          {mut.isPending ? <><Loader2 size={15} className="animate-spin" /> Bezig… ({seconden}s)</> : t.knop}
        </Button>
        {mut.isPending && (
          <p style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
            ⏳ <strong>{wachtrijTekst(wachtStatus)}</strong> De uitleg wordt op onze eigen server gemaakt en kan een paar minuten duren. Sluit je dit venster, dan krijg je een mail zodra hij klaar is.
          </p>
        )}
      </div>

      {uitleg && (
        <div id="ua-resultaat" className="ua-print" style={{ marginTop: 28, background: "white", border: `1.5px solid ${NAVY}30`, borderRadius: 14, padding: 24 }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>OpenRegio — {t.titel.toLowerCase()}</div>
            <h2 style={{ margin: "4px 0 6px", fontSize: 20, fontWeight: 800, color: NAVY }}>{uitleg.kop.onderwerp || (soort === "contract" ? "Uitleg van je contract" : "Uitleg van je brief")}</h2>
            <div style={{ display: "grid", gap: 2, fontSize: 13, color: "#475569" }}>
              {uitleg.soortBrief && <span><strong>Soort brief:</strong> {uitleg.soortBrief}</span>}
              {uitleg.kop.afzender && <span><strong>Afzender:</strong> {uitleg.kop.afzender}</span>}
              {uitleg.kop.datum && <span><strong>Datum:</strong> {uitleg.kop.datum}</span>}
              {uitleg.kop.kenmerk && <span><strong>Kenmerk:</strong> {uitleg.kop.kenmerk}</span>}
              <span><strong>Doorgenomen:</strong> {uitleg.omvang.tekens.toLocaleString("nl-NL")} tekens (± {Math.max(1, Math.round(uitleg.omvang.tekens / 3000))} {Math.round(uitleg.omvang.tekens / 3000) > 1 ? "pagina's" : "pagina"})</span>
            </div>
            {uitleg.omvang.ingekort && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a5300" }}>Het document is erg lang; alleen het eerste deel (ca. 50 pagina's) is doorgenomen.</p>}
          </div>

          {uitleg.partijen.length > 0 && <Blok titel="Partijen"><Lijst items={uitleg.partijen} /></Blok>}

          <Blok titel="In gewone taal" uitleg="Automatisch gemaakte uitleg op basis van je tekst — controleer die zelf.">
            <Lijst items={uitleg.gewoneTaal} />
          </Blok>

          {uitleg.juridisch.length > 0 && (
            <Blok titel="Juridisch uitgelegd" uitleg={soort === "brief" ? "Wat dit soort brief juridisch betekent. Algemene uitleg, geen advies over jouw situatie." : "Wat dit contract juridisch betekent. Algemene uitleg, geen advies over jouw situatie."}>
              <Lijst items={uitleg.juridisch} />
            </Blok>
          )}

          {uitleg.watMoetJe.length > 0 && <Blok titel="Wat wordt er van je gevraagd?"><Lijst items={uitleg.watMoetJe} /></Blok>}

          {uitleg.verplichtingen.length > 0 && (
            <Blok titel="Wie moet wat doen?" uitleg="Automatisch uit het contract gehaald — controleer het zelf in de tekst.">
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {uitleg.verplichtingen.map((v) => (
                  <div key={v.partij}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 4 }}>{v.partij}</div>
                    <Lijst items={v.moet} />
                  </div>
                ))}
              </div>
            </Blok>
          )}

          {uitleg.termijnen.length > 0 && <Blok titel="Termijnen" uitleg="Letterlijk uit je tekst."><Citaten items={uitleg.termijnen} /></Blok>}
          {uitleg.bedragen.length > 0 && <Blok titel="Bedragen" uitleg="Letterlijk uit je tekst."><Citaten items={uitleg.bedragen} /></Blok>}

          {uitleg.begrippen.length > 0 && (
            <Blok titel="Juridische begrippen uitgelegd" uitleg="Woorden uit je tekst met juridisch gevolg: wat ze betekenen, wat je controleert en wat je ermee kunt.">
              <label className="ua-no-print" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={toonWet} onChange={(e) => setToonWet(e.target.checked)} /> Toon wetsartikelen
              </label>
              <div style={{ display: "grid", gap: 10 }}>
                {uitleg.begrippen.map((b) => (
                  <div key={b.term} className="ua-sectie" style={{ border: `1px solid ${b.letOp ? "#f5c98a" : "#e2e8f0"}`, background: b.letOp ? "#fffaf1" : "white", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <strong style={{ color: NAVY, fontSize: 14 }}>{b.term}</strong>
                      {b.letOp && <span style={{ fontSize: 11, fontWeight: 800, color: "#8a5300", background: "#fff1d6", borderRadius: 999, padding: "1px 8px" }}>Let op</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#1f6b45", borderLeft: "3px solid #1f6b45", paddingLeft: 8, marginBottom: 8 }}>In je tekst: “{b.citaat}”</div>
                    <dl style={{ margin: 0, display: "grid", gap: 6, fontSize: 13.5, color: "#334155", lineHeight: 1.55 }}>
                      <div><dt style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b" }}>Wat betekent dit</dt><dd style={{ margin: 0 }}>{b.betekenis}</dd></div>
                      <div><dt style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b" }}>Wat controleer je</dt><dd style={{ margin: 0 }}>{b.controleer}</dd></div>
                      <div><dt style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b" }}>Wat kun je ermee</dt><dd style={{ margin: 0 }}>{b.ermee}</dd></div>
                    </dl>
                    {toonWet && b.wet && <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Wet: {b.wet}</div>}
                  </div>
                ))}
              </div>
            </Blok>
          )}

          <div style={{ display: "flex", gap: 10, background: "#fef9e7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
            <AlertCircle size={15} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
              Deze uitleg is automatisch gemaakt en geen juridisch advies. Citaten komen letterlijk uit je tekst; de uitleg eromheen kan fouten bevatten. Bij een groot belang: raadpleeg een jurist of het Juridisch Loket.
            </p>
          </div>

          <div className="ua-no-print" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <Button
              disabled={pdfBezig}
              onClick={async () => {
                setPdfBezig(true);
                try { await downloadUitlegPdf(uitleg, { metWet: toonWet }); }
                catch { toast({ title: "PDF maken mislukt", description: "Probeer het opnieuw, of gebruik Printen.", variant: "destructive" }); }
                finally { setPdfBezig(false); }
              }}
              style={{ background: NAVY }}
              data-testid={`button-${soort}-pdf`}
            >
              {pdfBezig ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download als PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}><Printer size={14} /> Printen</Button>
            <Button variant="outline" onClick={opnieuw}><RotateCcw size={14} /> Nieuwe {t.leeg}</Button>
            {soort === "brief" && (
              <Link href="/regels/documenten">
                <Button variant="outline">Controleer wie je dit oplegt <ArrowRight size={13} /></Button>
              </Link>
            )}
          </div>
          {!uitleg.aiGebruikt && (
            <p className="ua-no-print" style={{ margin: "10px 0 0", fontSize: 12, color: "#8a5300" }}>
              <CheckCircle2 size={12} style={{ display: "inline" }} /> De automatische uitleg lukte deze keer niet volledig; begrippen, termijnen en bedragen zijn wel uit je tekst gehaald.
            </p>
          )}
        </div>
      )}

      <div className="ua-no-print" style={{ marginTop: 28 }}>
        <DoorsturenNaarOpenRegio soort={soort} bestanden={modus === "upload" ? bestanden : []} tekst={modus === "tekst" ? tekst : ""} />
      </div>
    </div>
  );
}
