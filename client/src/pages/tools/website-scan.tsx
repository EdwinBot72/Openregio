import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Search, CheckCircle2, AlertTriangle, XCircle,
  ArrowRight, Copy, RotateCcw, Lock, ChevronRight,
  Shield, Smartphone, Share2, MapPin, Loader2,
  TrendingUp, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type Categorie = {
  naam: string;
  score: number;
  oordeel: "goed" | "matig" | "slecht";
  toelichting: string;
};

type Aanbeveling = {
  prioriteit: "hoog" | "midden" | "laag";
  actie: string;
  waarom: string;
};

type ScanResult = {
  url: string;
  signals: Record<string, any>;
  analysis: {
    overallScore: number;
    categories: Categorie[];
    sterkePunten: string[];
    aanbevelingen: Aanbeveling[];
    samenvattend: string;
  };
};

const catIcons: Record<string, React.ElementType> = {
  "Vindbaarheid (SEO)": Search,
  "Lokale aanwezigheid": MapPin,
  "Mobiel & Technisch": Smartphone,
  "Social & Deelbaarheid": Share2,
};

function scoreColor(score: number) {
  if (score >= 75) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function oordeelBadge(oordeel: string) {
  if (oordeel === "goed") return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Goed</Badge>;
  if (oordeel === "matig") return <Badge className="bg-amber-100 text-amber-700 text-xs">Matig</Badge>;
  return <Badge className="bg-red-100 text-red-700 text-xs">Verbeter</Badge>;
}

function prioriteitBadge(p: string) {
  if (p === "hoog") return <Badge className="bg-red-100 text-red-700 text-xs">Hoog</Badge>;
  if (p === "midden") return <Badge className="bg-amber-100 text-amber-700 text-xs">Midden</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 text-xs">Laag</Badge>;
}

export default function WebsiteScanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = (user as any)?.plan === "pro" || (user as any)?.role === "admin" || (user as any)?.role === "master";

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);

  const LOADING_MSGS = [
    "Website ophalen...",
    "HTML analyseren...",
    "SEO-signalen controleren...",
    "Lokale aanwezigheid beoordelen...",
    "AI-analyse uitvoeren...",
  ];

  const runScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingMsg(0);

    const interval = setInterval(() => {
      setLoadingMsg(prev => Math.min(prev + 1, LOADING_MSGS.length - 1));
    }, 2200);

    try {
      const data = await apiRequest("POST", "/api/tools/website-scan", { url: url.trim() });
      setResult(data as ScanResult);
    } catch (e: any) {
      setError(e.message || "Scan mislukt. Probeer het opnieuw.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const text = [
      `WEBSITE SCAN RAPPORT — ${result.url}`,
      `Eindscore: ${result.analysis.overallScore}/100`,
      "",
      "CATEGORIEËN:",
      ...result.analysis.categories.map(c => `• ${c.naam}: ${c.score}/100 (${c.oordeel})\n  ${c.toelichting}`),
      "",
      "STERKE PUNTEN:",
      ...result.analysis.sterkePunten.map(p => `• ${p}`),
      "",
      "AANBEVELINGEN:",
      ...result.analysis.aanbevelingen.map(a => `[${a.prioriteit.toUpperCase()}] ${a.actie}\n  ${a.waarom}`),
      "",
      result.analysis.samenvattend,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Rapport gekopieerd", description: "Plak het in een document of e-mail." });
  };

  if (!isPro) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Website Scan</h1>
        <p className="text-slate-600 mb-8">
          De uitgebreide website scan is beschikbaar voor Pro-bijdragers. Krijg een volledige analyse
          van jouw online aanwezigheid, lokale vindbaarheid en concrete verbeterpunten.
        </p>
        <Link href="/lidmaatschap?plan=pro">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-upgrade-pro">
            Bekijk Pro-lidmaatschap <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Pro-tool</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Website Scan</h1>
        <p className="text-slate-600">
          Voer je websiteadres in en ontvang een uitgebreide analyse van je online zichtbaarheid,
          vindbaarheid en lokale aanwezigheid — met concrete verbeterpunten.
        </p>
      </div>

      {/* URL Input */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="www.jouwbedrijf.nl"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && runScan()}
                className="pl-9"
                disabled={loading}
                data-testid="input-website-url"
              />
            </div>
            <Button
              onClick={runScan}
              disabled={loading || !url.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[110px]"
              data-testid="button-start-scan"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />Scannen</>}
            </Button>
          </div>
          {loading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                {LOADING_MSGS[loadingMsg]}
              </div>
              <Progress value={((loadingMsg + 1) / LOADING_MSGS.length) * 85} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-6" data-testid="scan-error">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-5" data-testid="scan-result">
          {/* Overall score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Eindscore</p>
                  <p className="text-sm text-slate-500 truncate max-w-[300px]">{result.url}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black" style={{ color: scoreColor(result.analysis.overallScore) }}>
                    {result.analysis.overallScore}
                    <span className="text-lg font-normal text-slate-400">/100</span>
                  </div>
                </div>
              </div>
              <Progress value={result.analysis.overallScore} className="h-2 mb-4" />
              <p className="text-sm text-slate-600 leading-relaxed">{result.analysis.samenvattend}</p>
            </CardContent>
          </Card>

          {/* Categories */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Categorieën</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.analysis.categories.map((cat, i) => {
                const Icon = catIcons[cat.naam] || Eye;
                return (
                  <Card key={i} data-testid={`category-card-${i}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-semibold text-slate-800">{cat.naam}</span>
                        </div>
                        {oordeelBadge(cat.oordeel)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={cat.score} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold text-slate-600 w-8 text-right">{cat.score}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{cat.toelichting}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sterke punten */}
          {result.analysis.sterkePunten.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Sterke punten</p>
              <div className="space-y-2">
                {result.analysis.sterkePunten.map((punt, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-800">{punt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aanbevelingen */}
          {result.analysis.aanbevelingen.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Aanbevelingen</p>
              <div className="space-y-3">
                {result.analysis.aanbevelingen.map((a, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white" data-testid={`aanbeveling-${i}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {prioriteitBadge(a.prioriteit)}
                      <span className="text-sm font-semibold text-slate-800">{a.actie}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{a.waarom}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technische signalen */}
          {result.signals && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Technische signalen</p>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "HTTPS", value: result.signals.isHttps, type: "bool" },
                      { label: "Mobiel viewport", value: result.signals.hasViewport, type: "bool" },
                      { label: "Canonical tag", value: result.signals.hasCanonical, type: "bool" },
                      { label: "Structured data", value: result.signals.hasStructuredData, type: "bool" },
                      { label: "Open Graph afbeelding", value: result.signals.hasOgImage, type: "bool" },
                      { label: "Telefoonnummer", value: result.signals.hasPhone, type: "bool" },
                      { label: "E-mailadres", value: result.signals.hasEmail, type: "bool" },
                      { label: "Google Maps", value: result.signals.hasGoogleMaps, type: "bool" },
                      { label: "H1-koppen", value: result.signals.h1Count, type: "num" },
                      { label: "H2-koppen", value: result.signals.h2Count, type: "num" },
                      { label: "Afbeeldingen", value: result.signals.imgTotal, type: "num" },
                      { label: "Afb. zonder alt-tekst", value: result.signals.imgNoAlt, type: "num-warn" },
                    ].map((sig, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {sig.type === "bool" ? (
                          sig.value
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        ) : sig.type === "num-warn" ? (
                          (sig.value as number) > 0
                            ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="text-xs text-slate-600">{sig.label}</span>
                        {(sig.type === "num" || sig.type === "num-warn") && (
                          <span className="text-xs font-semibold text-slate-800 ml-auto">{sig.value as number}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={copyReport} data-testid="button-copy-report">
              <Copy className="w-4 h-4 mr-2" />Rapport kopiëren
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setUrl(""); }} data-testid="button-new-scan">
              <RotateCcw className="w-4 h-4 mr-2" />Nieuwe scan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
