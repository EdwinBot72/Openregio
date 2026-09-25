import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, Scale, Upload, X, Copy, Check, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { voerUitViaWachtrij, volgJob, wachtrijTekst, type WachtrijStatus } from "@/lib/wachtrij";
import { geefBriefDoor } from "@/lib/briefOverdracht";

const JOB_SLEUTEL = "openregio:job:rechten-rapport";

type Label = "vaststaand" | "interpretatie" | "te_controleren";
interface RapportPunt { tekst: string; label: Label; bron?: string; wet?: string; term?: string; controleer?: string; ermee?: string }
interface RapportSectie { titel: string; uitleg?: string; punten: RapportPunt[] }
interface Conceptbrief { titel: string; tekst: string }
interface Rapport {
  kop: { afzender?: string; kenmerk?: string; datum?: string; documenttype: string };
  secties: RapportSectie[];
  conceptbrieven: Conceptbrief[];
  aiGebruikt: boolean;
  besluitcontrole?: boolean;
  omvang?: { tekens: number; ingekort: boolean };
}

const MAX_BESTANDEN = 10;

const NAVY = "#0b2240";
const LABELS: Record<Label, { tekst: string; bg: string; fg: string }> = {
  vaststaand: { tekst: "Vaststaand — uit je brief", bg: "#e8f5ee", fg: "#1f6b45" },
  interpretatie: { tekst: "Juridische duiding", bg: "#eaf0fb", fg: "#1d4a8f" },
  te_controleren: { tekst: "Nog te controleren", bg: "#fff4e0", fg: "#8a5300" },
};

function LabelChip({ label }: { label: Label }) {
  const l = LABELS[label];
  return (
    <span style={{ background: l.bg, color: l.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {l.tekst}
    </span>
  );
}

function KopieerKnop({ tekst }: { tekst: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="rr-no-print"
      onClick={async () => {
        try { await navigator.clipboard.writeText(tekst); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* ignore */ }
      }}
    >
      {ok ? <><Check className="h-4 w-4 mr-1" />Gekopieerd</> : <><Copy className="h-4 w-4 mr-1" />Kopieer</>}
    </Button>
  );
}

export default function RechtenRapportPage() {
  usePageTitle("Brief analyseren — wie legt je dit op, en mag dat?");
  const { toast } = useToast();
  const [modus, setModus] = useState<"upload" | "tekst">("upload");
  const [bestanden, setBestanden] = useState<File[]>([]);
  const [tekst, setTekst] = useState("");
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [seconden, setSeconden] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [wachtStatus, setWachtStatus] = useState<WachtrijStatus | null>(null);
  const [toonWet, setToonWet] = useState(false);
  const [, navigeer] = useLocation();
  // Doorgeven kan alleen als de brief nog in deze pagina staat (niet na hervatten via de mail-link).
  const kanDoorgeven = modus === "upload" ? bestanden.length > 0 : tekst.trim().length >= 40;
  const naarBesluitControle = () => {
    if (kanDoorgeven) geefBriefDoor(modus === "upload" ? { bestanden } : { tekst: tekst.trim() });
    navigeer("/regels/controle");
  };

  const mut = useMutation({
    mutationFn: async (hervatJobId?: string): Promise<Rapport> => {
      setRapport(null);
      setWachtStatus(null);
      const opts = { returnPath: "/regels/documenten", onStatus: setWachtStatus, opslagSleutel: JOB_SLEUTEL };
      if (hervatJobId) return volgJob<Rapport>(hervatJobId, opts);
      if (modus === "upload") {
        const form = new FormData();
        for (const b of bestanden) form.append("file", b);
        return voerUitViaWachtrij<Rapport>("/api/rechten-rapport", { method: "POST", body: form }, opts);
      }
      return voerUitViaWachtrij<Rapport>("/api/rechten-rapport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst: tekst.trim() }),
      }, opts);
    },
    onSuccess: (r) => {
      setRapport(r);
      setTimeout(() => document.getElementById("rr-rapport")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    onError: (e: Error) => toast({ title: "Rapport maken mislukt", description: e.message, variant: "destructive" }),
  });

  // Hervatten: vanuit de mail-link (?job=…) of een nog lopende analyse in deze browser.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let jobId = params.get("job");
    if (jobId) window.history.replaceState(null, "", window.location.pathname);
    if (!jobId) { try { jobId = localStorage.getItem(JOB_SLEUTEL); } catch { /* geen opslag */ } }
    if (jobId) mut.mutate(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mut.isPending) { setSeconden(0); return; }
    const t = setInterval(() => setSeconden((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [mut.isPending]);

  const kan = modus === "upload" ? bestanden.length > 0 : tekst.trim().length >= 40;
  const opnieuw = () => { setRapport(null); setBestanden([]); setTekst(""); if (fileRef.current) fileRef.current.value = ""; };
  const voegToe = (lijst: FileList | null) => {
    const nieuw = Array.from(lijst ?? []);
    if (!nieuw.length) return;
    setBestanden((oud) => {
      const samen = [...oud, ...nieuw];
      if (samen.length > MAX_BESTANDEN) toast({ title: `Maximaal ${MAX_BESTANDEN} bestanden`, description: "Heeft je brief meer pagina's? Maak er één PDF van, of plak de tekst." });
      return samen.slice(0, MAX_BESTANDEN);
    });
    setRapport(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const vandaag = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .rr-print, .rr-print * { visibility: visible !important; }
          .rr-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0 10mm; }
          .rr-no-print { display: none !important; }
          .rr-sectie { break-inside: avoid; }
        }
      `}</style>

      <div className="rr-no-print">
        <Link href="/regels" className="inline-flex items-center text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Grip op Regels
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Brief analyseren</h1>
        </div>
        <p className="text-muted-foreground mb-1">
          Heb je een brief, boete, aanslag of aanmaning gekregen? OpenRegio stelt vast <strong>wie je tegenpartij is</strong> en of die
          <strong> bevoegd</strong> is, haalt de <strong>juridische taal</strong> uit je brief en legt per begrip uit wat het betekent,
          wat je controleert en wat je ermee kunt.
        </p>
        <p className="text-sm mb-6" style={{ color: NAVY }}>
          <strong>Ken je positie. Controleer de bevoegdheid. Gebruik je rechten.</strong>
        </p>

        <div className="flex gap-2 mb-4">
          <Button variant={modus === "upload" ? "default" : "outline"} size="sm" onClick={() => setModus("upload")} data-testid="button-modus-upload">
            <Upload className="h-4 w-4 mr-2" /> Bestand uploaden
          </Button>
          <Button variant={modus === "tekst" ? "default" : "outline"} size="sm" onClick={() => setModus("tekst")} data-testid="button-modus-tekst">
            <FileText className="h-4 w-4 mr-2" /> Tekst plakken
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {modus === "upload" ? (
              <>
                <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png,.txt" className="hidden" id="rr-file"
                  onChange={(e) => voegToe(e.target.files)} data-testid="input-rr-bestand" />
                {bestanden.length > 0 && (
                  <ul className="space-y-2">
                    {bestanden.map((b, i) => (
                      <li key={`${b.name}-${i}`} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <FileText className="h-5 w-5 shrink-0" style={{ color: NAVY }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{bestanden.length > 1 ? `${i + 1}. ` : ""}{b.name}</p>
                          <p className="text-xs text-muted-foreground">{(b.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <Button size="icon" variant="ghost" aria-label={`Verwijder ${b.name}`} onClick={() => setBestanden((oud) => oud.filter((_, j) => j !== i))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {bestanden.length < MAX_BESTANDEN && (
                  <label htmlFor="rr-file" className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer ${bestanden.length ? "p-4" : "p-10"}`}>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium">{bestanden.length ? "Nog een pagina of bijlage toevoegen" : "Klik om je brief te kiezen"}</p>
                    <p className="text-xs text-muted-foreground text-center">
                      PDF (ook gescand), Word, foto (JPG/PNG) of TXT — max 10 MB per bestand.
                      {!bestanden.length && <> Meerdere pagina's als foto? Kies ze allemaal, in de goede volgorde (max {MAX_BESTANDEN}).</>}
                    </p>
                  </label>
                )}
              </>
            ) : (
              <Textarea value={tekst} onChange={(e) => setTekst(e.target.value)} className="min-h-48 text-sm"
                placeholder="Plak hier de volledige tekst van de brief of het besluit..." data-testid="textarea-rr-tekst" />
            )}

            <div className="rounded-md border p-2.5 text-xs" style={{ background: "#f0f7f4", borderColor: "#cfe8dd", color: "#2f5d4b" }}>
              🔒 <strong>Veilig.</strong> Je brief wordt verwerkt op onze eigen server met een lokale AI. De tekst gaat niet naar externe partijen
              (zoals OpenAI of Google) en wordt niet opgeslagen. Je hoeft persoonlijke gegevens dus niet weg te lakken.
            </div>

            <Button onClick={() => mut.mutate(undefined)} disabled={!kan || mut.isPending} style={{ background: NAVY }} data-testid="button-rr-maak">
              {mut.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Bezig… ({seconden}s)</>
                : <><Scale className="h-4 w-4 mr-2" />Controleer deze brief</>}
            </Button>
            {mut.isPending && (
              <p className="text-sm text-muted-foreground" data-testid="text-analyse-duur">
                ⏳ <strong>{wachtrijTekst(wachtStatus)}</strong> De analyse draait op onze eigen server — daardoor blijven je
                gegevens veilig. Sluit je dit venster, dan krijg je een mail zodra de controle klaar is.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {rapport && (
        <div id="rr-rapport" className="rr-print">
          <div className="border-b pb-4 mb-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">OpenRegio — briefcontrole</p>
            <h2 className="text-xl font-bold mt-1" style={{ color: NAVY }}>Wie legt je dit op — en mag dat?</h2>
            <div className="text-sm text-muted-foreground mt-2 grid gap-0.5">
              <span><strong>Soort:</strong> {rapport.kop.documenttype}</span>
              {rapport.kop.afzender && <span><strong>Afzender:</strong> {rapport.kop.afzender}</span>}
              {rapport.kop.kenmerk && <span><strong>Kenmerk:</strong> {rapport.kop.kenmerk}</span>}
              {rapport.kop.datum && <span><strong>Datum brief:</strong> {rapport.kop.datum}</span>}
              <span><strong>Opgesteld:</strong> {vandaag}</span>
              {rapport.omvang && (
                <span><strong>Doorzocht:</strong> de hele brief, {rapport.omvang.tekens.toLocaleString("nl-NL")} tekens (± {Math.max(1, Math.round(rapport.omvang.tekens / 3000))} {Math.round(rapport.omvang.tekens / 3000) > 1 ? "pagina's" : "pagina"})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <span className="text-xs text-muted-foreground">Legenda:</span>
              <LabelChip label="vaststaand" /><LabelChip label="interpretatie" /><LabelChip label="te_controleren" />
            </div>
            <label className="rr-no-print inline-flex items-center gap-2 text-xs text-muted-foreground mt-3 cursor-pointer">
              <input type="checkbox" checked={toonWet} onChange={(e) => setToonWet(e.target.checked)} data-testid="checkbox-rr-wet" />
              Toon wetsartikelen
            </label>
            {rapport.omvang?.ingekort && (
              <p className="text-xs mt-3" style={{ color: "#8a5300" }}>
                Je brief is erg lang. Alleen het eerste deel (ca. 50 pagina's) is doorzocht; controleer de rest zelf.
              </p>
            )}
            {!rapport.aiGebruikt && (
              <p className="text-xs mt-3" style={{ color: "#8a5300" }}>
                Het automatisch uitlezen van je brief lukte niet volledig. Dit overzicht steunt vooral op de vaste controles;
                de punten over je positie kunnen onvolledig zijn.
              </p>
            )}
          </div>

          {rapport.secties.map((s) => (
            <section key={s.titel} className="rr-sectie mb-6">
              <h3 className="text-base font-bold mb-1" style={{ color: NAVY }}>{s.titel}</h3>
              {s.uitleg && <p className="text-xs text-muted-foreground mb-2">{s.uitleg}</p>}
              <ul className="space-y-2.5">
                {s.punten.map((p, i) => p.term ? (
                  <li key={i} className="rr-sectie text-sm border rounded-md p-3">
                    <div className="font-semibold mb-1" style={{ color: NAVY }}>{p.term}</div>
                    {p.bron && <div className="text-xs mb-2 pl-2 border-l-2" style={{ borderColor: LABELS.vaststaand.fg, color: LABELS.vaststaand.fg }}>In je brief: {p.bron}</div>}
                    <dl className="grid gap-1.5">
                      <div><dt className="text-xs font-semibold text-muted-foreground">Wat betekent dit</dt><dd>{p.tekst}</dd></div>
                      {p.controleer && <div><dt className="text-xs font-semibold text-muted-foreground">Wat controleer je</dt><dd>{p.controleer}</dd></div>}
                      {p.ermee && <div><dt className="text-xs font-semibold text-muted-foreground">Wat kun je ermee</dt><dd>{p.ermee}</dd></div>}
                    </dl>
                    {toonWet && p.wet && <div className="text-xs text-muted-foreground mt-1.5">Wet: {p.wet}</div>}
                  </li>
                ) : (
                  <li key={i} className="text-sm border-l-2 pl-3" style={{ borderColor: LABELS[p.label].fg }}>
                    <div className="mb-1"><LabelChip label={p.label} /></div>
                    <div>{p.tekst}</div>
                    {p.bron && <div className="text-xs text-muted-foreground mt-0.5"><em>In je brief: {p.bron}</em></div>}
                    {toonWet && p.wet && <div className="text-xs text-muted-foreground mt-0.5">Wet: {p.wet}</div>}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {rapport.conceptbrieven.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-bold mb-2" style={{ color: NAVY }}>10. Conceptbrieven</h3>
              <p className="text-xs text-muted-foreground mb-3">Pas de tekst tussen [haken] aan en lees alles na voordat je verstuurt.</p>
              {rapport.conceptbrieven.map((c) => (
                <div key={c.titel} className="rr-sectie mb-4 border rounded-md p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <strong className="text-sm">{c.titel}</strong>
                    <KopieerKnop tekst={c.tekst} />
                  </div>
                  <pre className="whitespace-pre-wrap text-xs font-sans">{c.tekst}</pre>
                </div>
              ))}
            </section>
          )}

          {rapport.besluitcontrole && (
            <div className="rr-no-print rounded-md border p-4 mb-6" style={{ background: "#eaf0fb", borderColor: "#c9d8f2" }}>
              <p className="text-sm mb-3" style={{ color: NAVY }}>
                <strong>Is dit een besluit van een overheid?</strong> Laat het dan ook doorlichten: staan bevoegdheid, motivering,
                grondslag en bezwaarclausule erin zoals de wet dat vraagt?
              </p>
              <Button onClick={naarBesluitControle} style={{ background: NAVY }} data-testid="button-rr-besluitcontrole">
                <ShieldCheck className="h-4 w-4 mr-2" /> Controleer dit besluit
              </Button>
            </div>
          )}

          <div className="rounded-md p-3 text-xs mb-6" style={{ background: "#fff7ed", color: "#7c2d12" }}>
            <strong>Controleer dit zelf.</strong> Dit overzicht is een hulpmiddel en geen juridisch advies. Punten met
            “vaststaand” komen letterlijk uit je brief; “juridische duiding” volgt uit de algemene regels (Algemene wet
            bestuursrecht en Burgerlijk Wetboek) en kan in jouw situatie anders uitpakken; “nog te controleren” moet je zelf nagaan. OpenRegio
            gaat er niet vanuit dat een besluit ongeldig is — en ook niet dat de instantie altijd gelijk heeft. Bij een groot
            belang: raadpleeg een jurist of het Juridisch Loket.
          </div>

          <div className="flex gap-2 rr-no-print">
            <Button onClick={() => window.print()} style={{ background: NAVY }} data-testid="button-rr-print">
              <Printer className="h-4 w-4 mr-2" /> Download als PDF
            </Button>
            <Button variant="outline" onClick={opnieuw}>
              <RotateCcw className="h-4 w-4 mr-2" /> Nieuwe brief
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
