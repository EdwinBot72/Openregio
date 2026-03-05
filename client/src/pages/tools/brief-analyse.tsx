import { useState } from "react";
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
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalyseResultaat {
  afzender: string;
  documentType: string;
  juridischeBasis: string;
  bevoegdheid: string;
  termijn: string;
  aanbevolenActie: string;
}

export default function BriefAnalysePage() {
  const { toast } = useToast();
  const [tekst, setTekst] = useState("");
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);

  const analyseMutation = useMutation({
    mutationFn: async (tekst: string) => {
      const res = await apiRequest("POST", "/api/brief-analyse", { tekst });
      return res.json() as Promise<AnalyseResultaat>;
    },
    onSuccess: (data) => {
      setResultaat(data);
    },
    onError: () => {
      toast({
        title: "Analyse mislukt",
        description: "Probeer het opnieuw. Zorg dat de tekst minimaal een paar zinnen bevat.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyseer = () => {
    if (!tekst.trim() || tekst.trim().length < 20) {
      toast({
        title: "Tekst te kort",
        description: "Plak de volledige tekst van het document.",
        variant: "destructive",
      });
      return;
    }
    setResultaat(null);
    analyseMutation.mutate(tekst.trim());
  };

  const velden: { label: string; key: keyof AnalyseResultaat; icon: typeof Building2 }[] = [
    { label: "Afzender", key: "afzender", icon: Building2 },
    { label: "Type document", key: "documentType", icon: FileText },
    { label: "Juridische basis", key: "juridischeBasis", icon: Scale },
    { label: "Bevoegdheid", key: "bevoegdheid", icon: Gavel },
    { label: "Termijn", key: "termijn", icon: Clock },
    { label: "Aanbevolen actie", key: "aanbevolenActie", icon: ArrowRight },
  ];

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
          Plak de tekst van een overheidsbrief of besluit en ontvang een gestructureerde analyse.
        </p>
      </header>

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Hoe werkt het?</p>
              <p className="text-sm text-muted-foreground">
                Kopieer de tekst van een gemeentebrief, besluit, vergunning of andere officiële brief
                en plak deze hieronder. De analyse geeft je direct inzicht in wie de afzender is,
                welk type document het is, de juridische grondslag, en wat je kunt doen.
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

      <Card>
        <CardContent className="pt-6 space-y-4">
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
            disabled={analyseMutation.isPending || !tekst.trim()}
            data-testid="button-analyseer"
          >
            {analyseMutation.isPending ? (
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

      {analyseMutation.isPending && (
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
