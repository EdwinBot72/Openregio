import { useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Hash,
  Info,
  Lightbulb,
  Loader2,
  Scale,
  ScanText,
  Save,
  Sparkles,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AnalyseResultaat {
  afzender: string;
  kenmerk?: string;
  documentType: string;
  juridischeBasis: string;
  bevoegdheid: string;
  termijn: string;
  aanbevolenActie: string;
}

type Modus = "tekst" | "upload";
type UploadFeedback = { type: "success" | "error"; message: string } | null;

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
  if (r.documentType && r.documentType.toLowerCase() !== "onbekend") {
    delen.push(`Document: ${r.documentType}.`);
  }
  if (r.juridischeBasis && r.juridischeBasis.toLowerCase() !== "onbekend") {
    delen.push(`Juridische basis: ${r.juridischeBasis}.`);
  }
  if (r.aanbevolenActie && r.aanbevolenActie.toLowerCase() !== "onbekend") {
    delen.push(`Aanbevolen actie: ${r.aanbevolenActie}`);
  }
  return delen.join(" ").trim();
}

function bouwHulpEngineHref(r: AnalyseResultaat): string {
  const params = new URLSearchParams();
  const afzenderEnum = detecteerAfzenderEnum(r.afzender);
  if (afzenderEnum) params.set("afzender", afzenderEnum);
  const kenmerk = (r.kenmerk || "").trim();
  if (kenmerk && kenmerk.toLowerCase() !== "onbekend") {
    params.set("kenmerk", kenmerk);
  }
  const samenvatting = bouwSamenvatting(r);
  if (samenvatting) params.set("kort", samenvatting);
  const qs = params.toString();
  return `/regels/help/brief-ontvangen${qs ? `?${qs}` : ""}`;
}

export default function BriefAnalysePage() {
  const { toast } = useToast();
  const [modus, setModus] = useState<Modus>("tekst");
  const [tekst, setTekst] = useState("");
  const [bestand, setBestand] = useState<File | null>(null);
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tekstMutation = useMutation({
    mutationFn: async (tekst: string) => {
      const res = await apiRequest("POST", "/api/brief-analyse", { tekst });
      return res.json() as Promise<AnalyseResultaat>;
    },
    onSuccess: (data) => setResultaat(data),
    onError: (err: Error) => {
      toast({ title: "Analyse mislukt", description: err.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/brief-analyse/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const msg = [data?.error, data?.hint].filter(Boolean).join(" — ") || `Upload mislukt (${res.status})`;
        throw new Error(msg);
      }
      return data as AnalyseResultaat;
    },
    onSuccess: (data) => setResultaat(data),
    onError: (err: Error) => {
      toast({ title: "Analyse mislukt", description: err.message, variant: "destructive" });
    },
  });

  /** Opslaan in de WOO-documentenbibliotheek */
  const opslaanMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/rag/documents", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const msg = [data?.error, data?.hint].filter(Boolean).join(" — ") || `Opslaan mislukt (${res.status})`;
        throw new Error(msg);
      }
      return data;
    },
    onSuccess: (_data, file) => {
      setUploadFeedback({
        type: "success",
        message: `Bestand '${file.name}' succesvol opgeslagen in je bibliotheek.`,
      });
    },
    onError: (err: Error) => {
      setUploadFeedback({ type: "error", message: err.message });
    },
  });

  const isAnalyseren = tekstMutation.isPending || uploadMutation.isPending;
  const isOpslaan = opslaanMutation.isPending;

  const handleAnalyseer = () => {
    setResultaat(null);
    setUploadFeedback(null);
    if (modus === "tekst") {
      if (!tekst.trim() || tekst.trim().length < 20) {
        toast({ title: "Tekst te kort", description: "Plak de volledige tekst van het document.", variant: "destructive" });
        return;
      }
      tekstMutation.mutate(tekst.trim());
    } else {
      if (!bestand) {
        toast({ title: "Geen bestand", description: "Selecteer eerst een bestand.", variant: "destructive" });
        return;
      }
      uploadMutation.mutate(bestand);
    }
  };

  const handleOpslaan = () => {
    if (!bestand) return;
    setUploadFeedback(null);
    opslaanMutation.mutate(bestand);
  };

  const handleBestandKiezen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setBestand(f);
    setResultaat(null);
    setUploadFeedback(null);
  };

  const handleBestandVerwijderen = () => {
    setBestand(null);
    setUploadFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResultaat(null);
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

  const kanAnalyseren = modus === "tekst" ? tekst.trim().length >= 20 : bestand !== null;
  const kanOpslaan = modus === "upload" && bestand !== null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <ScanText className="h-7 w-7 text-[#1f5fae]" />
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="heading-brief-analyse">
            Brief analyse
          </h1>
        </div>
        <p className="text-muted-foreground">
          Upload een overheidsbrief of plak de tekst — en ontvang direct een gestructureerde analyse.
        </p>
      </header>

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Hoe werkt het?</p>
              <p className="text-sm text-muted-foreground">
                Upload een PDF of foto van de brief, of plak de tekst hieronder.
                De analyse geeft je inzicht in afzender, documenttype, juridische grondslag en wat je kunt doen.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {["Besluiten", "Vergunningen", "WOO-reacties", "Aanschrijvingen", "Bezwaarbesluiten"].map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-normal">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modus switcher */}
      <div className="flex gap-2">
        <Button
          variant={modus === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => { setModus("upload"); setResultaat(null); setUploadFeedback(null); }}
          data-testid="button-modus-upload"
        >
          <Upload className="h-4 w-4 mr-2" />
          Bestand uploaden
        </Button>
        <Button
          variant={modus === "tekst" ? "default" : "outline"}
          size="sm"
          onClick={() => { setModus("tekst"); setResultaat(null); setUploadFeedback(null); }}
          data-testid="button-modus-tekst"
        >
          <FileText className="h-4 w-4 mr-2" />
          Tekst plakken
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {modus === "upload" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Bestand selecteren
                </label>
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
                      <FileText className="h-5 w-5 text-[#1f5fae]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid="text-bestandsnaam">{bestand.name}</p>
                      <p className="text-xs text-muted-foreground">{(bestand.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleBestandVerwijderen}
                      data-testid="button-verwijder-bestand"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Inline succes/fout bericht — stijl als Flask flash messages */}
              {uploadFeedback && (
                <div
                  className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
                    uploadFeedback.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                  data-testid={`feedback-${uploadFeedback.type}`}
                >
                  {uploadFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                  )}
                  <span>{uploadFeedback.message}</span>
                </div>
              )}

              {/* Twee actieknoppen naast elkaar */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAnalyseer}
                  disabled={isAnalyseren || isOpslaan || !kanAnalyseren}
                  data-testid="button-analyseer"
                >
                  {isAnalyseren ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyseren…
                    </>
                  ) : (
                    <>
                      <ScanText className="h-4 w-4 mr-2" />
                      Analyseer document
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleOpslaan}
                  disabled={isAnalyseren || isOpslaan || !kanOpslaan}
                  data-testid="button-opslaan-bibliotheek"
                >
                  {isOpslaan ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opslaan…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan in bibliotheek
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block" htmlFor="tekst-input">
                  Tekst van het document
                </label>
                <Textarea
                  id="tekst-input"
                  value={tekst}
                  onChange={(e) => setTekst(e.target.value)}
                  placeholder="Plak hier de volledige tekst van de brief of het besluit..."
                  className="min-h-48 text-sm"
                  data-testid="textarea-document-tekst"
                />
                <p className="text-xs text-muted-foreground mt-1.5">{tekst.length} / 8000 tekens</p>
              </div>

              <Button
                onClick={handleAnalyseer}
                disabled={isAnalyseren || !kanAnalyseren}
                data-testid="button-analyseer"
              >
                {isAnalyseren ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyseren…
                  </>
                ) : (
                  <>
                    <ScanText className="h-4 w-4 mr-2" />
                    Analyseer document
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAnalyseren && (
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

      {resultaat && (
        <Card data-testid="card-analyse-resultaat">
          <CardContent className="pt-6 space-y-1">
            <h2 className="font-semibold mb-4">Document analyse</h2>
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
                Wil je hier direct iets mee doen? Open de hulp-engine met deze
                gegevens als startpunt.
              </p>
              <Link
                href={bouwHulpEngineHref(resultaat)}
                data-testid="link-reageren-met-hulp-engine"
              >
                <Button size="sm" className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reageren met hulp-engine
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-[#f28a1a] mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Heb je meerdere documenten?
              Upload ze in de <a href="/regels/woo" className="text-[#1f5fae] hover:underline font-medium">Documentenbibliotheek</a> zodat
              RegioBot er vragen over kan beantwoorden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
