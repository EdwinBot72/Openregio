import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  Clock,
  FileText,
  Gavel,
  Info,
  Lightbulb,
  Loader2,
  Scale,
  ScanText,
  Upload,
  X,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AnalyseResultaat {
  afzender: string;
  documentType: string;
  juridischeBasis: string;
  bevoegdheid: string;
  termijn: string;
  aanbevolenActie: string;
}

type Modus = "tekst" | "upload";

export default function BriefAnalysePage() {
  const { toast } = useToast();
  const [modus, setModus] = useState<Modus>("tekst");
  const [tekst, setTekst] = useState("");
  const [bestand, setBestand] = useState<File | null>(null);
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);
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

  const isLoading = tekstMutation.isPending || uploadMutation.isPending;

  const handleAnalyseer = () => {
    setResultaat(null);
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

  const handleBestandKiezen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setBestand(f);
    setResultaat(null);
  };

  const handleBestandVerwijderen = () => {
    setBestand(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResultaat(null);
  };

  const velden: { label: string; key: keyof AnalyseResultaat; icon: typeof Building2 }[] = [
    { label: "Afzender", key: "afzender", icon: Building2 },
    { label: "Type document", key: "documentType", icon: FileText },
    { label: "Juridische basis", key: "juridischeBasis", icon: Scale },
    { label: "Bevoegdheid", key: "bevoegdheid", icon: Gavel },
    { label: "Termijn", key: "termijn", icon: Clock },
    { label: "Aanbevolen actie", key: "aanbevolenActie", icon: ArrowRight },
  ];

  const kanAnalyseren = modus === "tekst" ? tekst.trim().length >= 20 : bestand !== null;

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
          onClick={() => { setModus("upload"); setResultaat(null); }}
          data-testid="button-modus-upload"
        >
          <Upload className="h-4 w-4 mr-2" />
          Bestand uploaden
        </Button>
        <Button
          variant={modus === "tekst" ? "default" : "outline"}
          size="sm"
          onClick={() => { setModus("tekst"); setResultaat(null); }}
          data-testid="button-modus-tekst"
        >
          <FileText className="h-4 w-4 mr-2" />
          Tekst plakken
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {modus === "upload" ? (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bestand selecteren
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
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
                    <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG, PNG of TXT — max 10 MB</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                  <div className="p-2 rounded-md bg-muted">
                    <FileText className="h-5 w-5 text-[#1f5fae]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bestand.name}</p>
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
          ) : (
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
          )}

          <Button
            onClick={handleAnalyseer}
            disabled={isLoading || !kanAnalyseren}
            data-testid="button-analyseer"
          >
            {isLoading ? (
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
        </CardContent>
      </Card>

      {isLoading && (
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
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-[#f28a1a] mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Heb je meerdere documenten?
              Upload ze in de <a href="/woo-bibliotheek" className="text-[#1f5fae] hover:underline font-medium">Documentenbibliotheek</a> zodat
              RegioBot er vragen over kan beantwoorden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
