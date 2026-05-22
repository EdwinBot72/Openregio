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
  Save,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  FilePlus2,
  BookOpen,
  Search,
  FolderOpen,
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

const TOOLS = [
  {
    icon: ScanText,
    titel: "Document analyseren",
    omschrijving: "Upload een brief of besluit en ontvang direct een gestructureerde analyse.",
    anchor: "analyse",
  },
  {
    icon: FolderOpen,
    titel: "Documentenbibliotheek",
    omschrijving: "Sla documenten op zodat RegioBot er vragen over kan beantwoorden.",
    href: "/regels/woo",
  },
  {
    icon: Search,
    titel: "WOO-verzoek indienen",
    omschrijving: "Vraag officiële gemeentedocumenten op via de Wet open overheid.",
    href: "/regels/woo",
  },
];

export default function BriefAnalysePage() {
  usePageTitle("Documenten & Controles – Grip op Regels");
  const { toast } = useToast();
  const [modus, setModus] = useState<Modus>("upload");
  const [tekst, setTekst] = useState("");
  const [bestand, setBestand] = useState<File | null>(null);
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tekstMutation = useMutation({
    mutationFn: async (t: string) => {
      const res = await apiRequest("POST", "/api/brief-analyse", { tekst: t });
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
      const res = await fetch("/api/brief-analyse/upload", { method: "POST", body: form, credentials: "include" });
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

  const opslaanMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/brief-analyse/opslaan-extern", { method: "POST", body: form, credentials: "include" });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const msg = [data?.error, data?.hint].filter(Boolean).join(" — ") || `Opslaan mislukt (${res.status})`;
        throw new Error(msg);
      }
      return data;
    },
    onSuccess: (_data, file) => {
      setUploadFeedback({ type: "success", message: `Bestand '${file.name}' succesvol opgeslagen.` });
    },
    onError: (err: Error) => {
      setUploadFeedback({ type: "error", message: err.message });
    },
  });

  const isAnalyseren = tekstMutation.isPending || uploadMutation.isPending;
  const isOpslaan = opslaanMutation.isPending;
  const kanAnalyseren = modus === "tekst" ? tekst.trim().length >= 20 : bestand !== null;
  const kanOpslaan = modus === "upload" && bestand !== null;

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

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-700 to-violet-900 px-6 py-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" className="text-violet-200 hover:text-white mb-4 -ml-2" asChild>
            <Link href="/regels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Grip op Regels
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Documenten & Controles
              </h1>
              <p className="text-violet-200 max-w-lg mb-5">
                Welke informatie kan je opvragen of controleren? Upload een brief,
                dien een WOO-verzoek in of doorzoek je documentenbibliotheek.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Besluiten", "Vergunningen", "WOO-reacties", "Aanschrijvingen", "Bezwaarbesluiten"].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 bg-white/10 text-violet-100 text-xs px-3 py-1.5 rounded-full border border-white/10"
                  >
                    <BookOpen className="w-3 h-3" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Widget */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 w-full md:w-56 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300 mb-3">
                Wat je kunt doen
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: ScanText, label: "Brief analyseren" },
                  { icon: FilePlus2, label: "WOO-verzoek indienen" },
                  { icon: FolderOpen, label: "Documenten opslaan" },
                  { icon: Search, label: "Documenten doorzoeken" },
                ].map(({ icon: WIcon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <WIcon className="w-4 h-4 text-violet-300 shrink-0" />
                    <span className="text-sm text-violet-100">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Tool-kaarten ──────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {TOOLS.map(({ icon: TIcon, titel, omschrijving, anchor, href }) => (
            <Card key={titel} className="hover-elevate">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
                  <TIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{titel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{omschrijving}</p>
                </div>
                {anchor ? (
                  <a href={`#${anchor}`} className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1 mt-auto">
                    Ga naar tool
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <Link href={href!} className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1 mt-auto">
                    Openen
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Document analyseren ───────────────────────────────────── */}
        <section id="analyse">
          <h2 className="text-lg font-bold mb-4" data-testid="heading-brief-analyse">
            Document analyseren
          </h2>

          {/* Modus switcher */}
          <div className="flex gap-2 mb-4">
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
                  {/* Upload zone */}
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

                  {/* Flash feedback */}
                  {uploadFeedback && (
                    <div
                      className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
                        uploadFeedback.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
                      }`}
                      data-testid={`feedback-${uploadFeedback.type}`}
                    >
                      {uploadFeedback.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                      <span>{uploadFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAnalyseer} disabled={isAnalyseren || isOpslaan || !kanAnalyseren} data-testid="button-analyseer">
                      {isAnalyseren ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyseren…</>
                      ) : (
                        <><ScanText className="h-4 w-4 mr-2" />Analyseer document</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleOpslaan} disabled={isAnalyseren || isOpslaan || !kanOpslaan} data-testid="button-opslaan-bibliotheek">
                      {isOpslaan ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Opslaan…</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />Opslaan in bibliotheek</>
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
                  <Button onClick={handleAnalyseer} disabled={isAnalyseren || !kanAnalyseren} data-testid="button-analyseer">
                    {isAnalyseren ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyseren…</>
                    ) : (
                      <><ScanText className="h-4 w-4 mr-2" />Analyseer document</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skeleton */}
          {isAnalyseren && (
            <Card className="mt-4">
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

          {/* Resultaat */}
          {resultaat && (
            <Card className="mt-4" data-testid="card-analyse-resultaat">
              <CardContent className="pt-6 space-y-1">
                <h3 className="font-semibold mb-4">Analyseresultaat</h3>
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
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <div className="rounded-xl border bg-muted/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm">Meerdere documenten bewaren?</p>
            <p className="text-sm text-muted-foreground">
              Upload ze in de documentenbibliotheek zodat RegioBot er vragen over kan beantwoorden.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href="/regels/woo" data-testid="button-naar-bibliotheek">
                <FolderOpen className="w-3.5 h-3.5 mr-1" />
                Documentenbibliotheek
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/regels/woo" data-testid="button-woo-verzoek">
                <FilePlus2 className="w-3.5 h-3.5 mr-1" />
                WOO-verzoek indienen
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
