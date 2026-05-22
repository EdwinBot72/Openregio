import { useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Hash,
  Loader2,
  Scale,
  ScanText,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  Send,
  Bot,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { usePageTitle } from "@/hooks/usePageTitle";

interface AnalyseResultaat {
  afzender: string;
  kenmerk?: string;
  documentType: string;
  juridischeBasis: string;
  bevoegdheid: string;
  termijn: string;
  aanbevolenActie: string;
}

type Modus = "upload" | "tekst";

function detecteerAfzenderEnum(afzender: string): string {
  const t = (afzender || "").toLowerCase();
  if (!t || t === "onbekend") return "";
  if (t.includes("provincie")) return "provincie";
  if (t.includes("omgevingsdienst") || t.includes("rud") || t.includes("dcmr")) return "omgevingsdienst";
  if (t.includes("rvo") || t.includes("ministerie") || t.includes("rijksdienst") || t.includes("belastingdienst")) return "rvo";
  if (t.includes("gemeente") || t.includes("college") || t.includes("burgemeester") || t.includes("b&w")) return "gemeente";
  return "anders";
}

function bouwSamenvatting(r: AnalyseResultaat): string {
  const delen: string[] = [];
  if (r.documentType && r.documentType.toLowerCase() !== "onbekend") delen.push(`Document: ${r.documentType}.`);
  if (r.juridischeBasis && r.juridischeBasis.toLowerCase() !== "onbekend") delen.push(`Juridische basis: ${r.juridischeBasis}.`);
  if (r.aanbevolenActie && r.aanbevolenActie.toLowerCase() !== "onbekend") delen.push(`Aanbevolen actie: ${r.aanbevolenActie}`);
  return delen.join(" ").trim();
}

function bouwHulpEngineHref(r: AnalyseResultaat): string {
  const params = new URLSearchParams();
  const afzenderEnum = detecteerAfzenderEnum(r.afzender);
  if (afzenderEnum) params.set("afzender", afzenderEnum);
  const kenmerk = (r.kenmerk || "").trim();
  if (kenmerk && kenmerk.toLowerCase() !== "onbekend") params.set("kenmerk", kenmerk);
  const samenvatting = bouwSamenvatting(r);
  if (samenvatting) params.set("kort", samenvatting);
  const qs = params.toString();
  return `/regels/help/brief-ontvangen${qs ? `?${qs}` : ""}`;
}

type StapStatus = "wachten" | "bezig" | "klaar" | "fout";

interface Stappen {
  analyse: StapStatus;
  verstuur: StapStatus;
}

export default function BriefAnalysePage() {
  usePageTitle("Mijn brief analyseren – Grip op Regels");
  const { toast } = useToast();
  const [modus, setModus] = useState<Modus>("upload");
  const [tekst, setTekst] = useState("");
  const [bestand, setBestand] = useState<File | null>(null);
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);
  const [stappen, setStappen] = useState<Stappen>({ analyse: "wachten", verstuur: "wachten" });
  const [verstuurFout, setVerstuurFout] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Stuur bestand door naar externe AI agent */
  async function verstuurNaarAgent(file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/brief-analyse/opslaan-extern", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      const msg = [data?.error, data?.hint].filter(Boolean).join(" — ") || `Versturen mislukt (${res.status})`;
      throw new Error(msg);
    }
  }

  const analyseerMutation = useMutation({
    mutationFn: async () => {
      setResultaat(null);
      setVerstuurFout(null);
      setStappen({ analyse: "bezig", verstuur: "wachten" });

      let analyseResultaat: AnalyseResultaat;

      if (modus === "tekst") {
        const res = await apiRequest("POST", "/api/brief-analyse", { tekst: tekst.trim() });
        analyseResultaat = await res.json() as AnalyseResultaat;
      } else {
        const form = new FormData();
        form.append("file", bestand!);
        const res = await fetch("/api/brief-analyse/upload", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        const data = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          const msg = [data?.error, data?.hint].filter(Boolean).join(" — ") || `Analyse mislukt (${res.status})`;
          throw new Error(msg);
        }
        analyseResultaat = data as AnalyseResultaat;
      }

      setStappen({ analyse: "klaar", verstuur: "bezig" });

      // Stuur het bestand (of een tekstblob) door naar de AI agent
      try {
        if (modus === "upload" && bestand) {
          await verstuurNaarAgent(bestand);
        } else {
          // Maak een tekstbestand van de geplakte tekst
          const blob = new Blob([tekst.trim()], { type: "text/plain" });
          const file = new File([blob], "brief.txt", { type: "text/plain" });
          await verstuurNaarAgent(file);
        }
        setStappen({ analyse: "klaar", verstuur: "klaar" });
      } catch (err: any) {
        setStappen({ analyse: "klaar", verstuur: "fout" });
        setVerstuurFout(err.message || "Versturen naar AI agent mislukt");
      }

      return analyseResultaat;
    },
    onSuccess: (data) => setResultaat(data),
    onError: (err: Error) => {
      setStappen({ analyse: "fout", verstuur: "wachten" });
      toast({ title: "Analyse mislukt", description: err.message, variant: "destructive" });
    },
  });

  const isBezig = analyseerMutation.isPending;
  const kanAnalyseren = modus === "tekst" ? tekst.trim().length >= 20 : bestand !== null;

  const handleBestandKiezen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setBestand(f);
    setResultaat(null);
    setStappen({ analyse: "wachten", verstuur: "wachten" });
    setVerstuurFout(null);
  };

  const handleBestandVerwijderen = () => {
    setBestand(null);
    setResultaat(null);
    setStappen({ analyse: "wachten", verstuur: "wachten" });
    setVerstuurFout(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const velden: { label: string; key: keyof AnalyseResultaat; icon: typeof Building2 }[] = [
    { label: "Afzender", key: "afzender", icon: Building2 },
    { label: "Kenmerk", key: "kenmerk", icon: Hash },
    { label: "Type document", key: "documentType", icon: FileText },
    { label: "Juridische basis", key: "juridischeBasis", icon: Scale },
    { label: "Bevoegdheid", key: "bevoegdheid", icon: Gavel },
    { label: "Termijn", key: "termijn", icon: Clock },
    { label: "Aanbevolen actie", key: "aanbevolenActie", icon: ArrowRight },
  ];

  function StapIndicator({ label, status }: { label: string; status: StapStatus }) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          status === "klaar" ? "bg-emerald-500" :
          status === "bezig" ? "bg-primary animate-pulse" :
          status === "fout" ? "bg-destructive" :
          "bg-muted"
        }`}>
          {status === "klaar" && <CheckCircle2 className="w-3 h-3 text-white" />}
          {status === "bezig" && <Loader2 className="w-3 h-3 text-white animate-spin" />}
          {status === "fout" && <AlertCircle className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-sm ${status === "wachten" ? "text-muted-foreground" : "text-foreground"}`}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-700 to-violet-900 px-6 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="text-violet-200 hover:text-white mb-4 -ml-2" asChild>
            <Link href="/regels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Grip op Regels
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3" data-testid="heading-brief-analyse">
            Mijn brief analyseren
          </h1>
          <p className="text-violet-200 max-w-lg mb-5">
            Upload een overheidsbrief of plak de tekst. OpenRegio analyseert het document
            en stuurt het automatisch door naar de AI agent voor verdere verwerking.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Besluiten", "Vergunningen", "WOO-reacties", "Aanschrijvingen", "Bezwaarbesluiten"].map((t) => (
              <div
                key={t}
                className="flex items-center gap-1.5 bg-white/10 text-violet-100 text-xs px-3 py-1.5 rounded-full border border-white/10"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Modus switcher ────────────────────────────────────────── */}
        <div className="flex gap-2">
          <Button
            variant={modus === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => { setModus("upload"); setResultaat(null); setStappen({ analyse: "wachten", verstuur: "wachten" }); setVerstuurFout(null); }}
            data-testid="button-modus-upload"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bestand uploaden
          </Button>
          <Button
            variant={modus === "tekst" ? "default" : "outline"}
            size="sm"
            onClick={() => { setModus("tekst"); setResultaat(null); setStappen({ analyse: "wachten", verstuur: "wachten" }); setVerstuurFout(null); }}
            data-testid="button-modus-tekst"
          >
            <FileText className="h-4 w-4 mr-2" />
            Tekst plakken
          </Button>
        </div>

        {/* ── Upload / tekst invoer ─────────────────────────────────── */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {modus === "upload" ? (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={handleBestandKiezen}
                  className="hidden"
                  id="brief-file-input"
                  data-testid="input-brief-bestand"
                />
                {!bestand ? (
                  <label
                    htmlFor="brief-file-input"
                    className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 cursor-pointer hover-elevate transition-colors"
                    data-testid="dropzone-brief"
                  >
                    <div className="p-3 rounded-full bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Klik om een bestand te kiezen</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, JPG, PNG of TXT — max 10 MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="p-2 rounded-md bg-muted">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid="text-bestandsnaam">{bestand.name}</p>
                      <p className="text-xs text-muted-foreground">{(bestand.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={handleBestandVerwijderen} data-testid="button-verwijder-bestand">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium block" htmlFor="tekst-input">
                  Tekst van de brief
                </label>
                <Textarea
                  id="tekst-input"
                  value={tekst}
                  onChange={(e) => setTekst(e.target.value)}
                  placeholder="Plak hier de volledige tekst van de brief of het besluit..."
                  className="min-h-48 text-sm"
                  data-testid="textarea-document-tekst"
                />
                <p className="text-xs text-muted-foreground">{tekst.length} / 8000 tekens</p>
              </div>
            )}

            {/* Actieknop */}
            <Button
              onClick={() => analyseerMutation.mutate()}
              disabled={isBezig || !kanAnalyseren}
              className="w-full sm:w-auto"
              data-testid="button-analyseer"
            >
              {isBezig ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verwerken…</>
              ) : (
                <><ScanText className="h-4 w-4 mr-2" />Analyseer brief & stuur naar AI agent</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Stappen-voortgang ─────────────────────────────────────── */}
        {(isBezig || resultaat) && (
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Verwerkingsstatus
              </p>
              <StapIndicator
                label="Document analyseren met AI"
                status={stappen.analyse}
              />
              <StapIndicator
                label="Doorsturen naar AI agent"
                status={stappen.verstuur}
              />
              {verstuurFout && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2 text-sm text-amber-800 dark:text-amber-300 mt-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Analyse geslaagd, maar doorsturen mislukt: {verstuurFout}</span>
                </div>
              )}
              {stappen.verstuur === "klaar" && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <Bot className="h-4 w-4" />
                  Brief succesvol afgeleverd bij de AI agent.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Skeleton ─────────────────────────────────────────────── */}
        {isBezig && stappen.analyse === "bezig" && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Document wordt geanalyseerd…</p>
              {velden.map((v) => (
                <div key={v.key} className="flex gap-3 items-start">
                  <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Analyseresultaat ─────────────────────────────────────── */}
        {resultaat && (
          <Card data-testid="card-analyse-resultaat">
            <CardContent className="pt-6 space-y-1">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold">Analyseresultaat</h2>
                <Badge variant="secondary" className="text-xs">AI-analyse</Badge>
              </div>
              <div className="divide-y">
                {velden.map((v) => {
                  const IconComp = v.icon;
                  return (
                    <div key={v.key} className="flex gap-3 items-start py-3" data-testid={`row-${v.key}`}>
                      <div className="p-1.5 rounded-md bg-muted mt-0.5">
                        <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{v.label}</p>
                        <p className="text-sm font-medium mt-0.5" data-testid={`text-${v.key}`}>
                          {resultaat[v.key] || "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-muted-foreground flex-1">
                  Wil je hier direct iets mee doen? Open de hulp-engine met deze gegevens als startpunt.
                </p>
                <Link href={bouwHulpEngineHref(resultaat)} data-testid="link-reageren-met-hulp-engine">
                  <Button size="sm" className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Reageren met hulp-engine
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Nieuwe brief ─────────────────────────────────────────── */}
        {resultaat && (
          <Button
            variant="outline"
            onClick={() => {
              setResultaat(null);
              setBestand(null);
              setTekst("");
              setStappen({ analyse: "wachten", verstuur: "wachten" });
              setVerstuurFout(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            data-testid="button-nieuwe-brief"
          >
            <Send className="h-4 w-4 mr-2" />
            Nieuwe brief analyseren
          </Button>
        )}
      </div>
    </div>
  );
}
