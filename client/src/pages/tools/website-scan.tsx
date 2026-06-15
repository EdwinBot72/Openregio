import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Search, CheckCircle2, AlertTriangle, XCircle,
  ArrowRight, Copy, RotateCcw, Lock, ChevronDown, ChevronUp,
  Smartphone, Share2, MapPin, Loader2, TrendingUp,
  Flame, AlertCircle, Info, HelpCircle,
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

function scoreLabel(score: number) {
  if (score >= 80) return { label: "Goed", color: "#059669", bg: "#f0fdf4" };
  if (score >= 55) return { label: "Verbetering nodig", color: "#d97706", bg: "#fffbeb" };
  return { label: "Urgente actie nodig", color: "#dc2626", bg: "#fef2f2" };
}

function prioriteitIcon(p: string) {
  if (p === "hoog") return <Flame className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
  if (p === "midden") return <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
  return <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
}

function prioriteitStyle(p: string): string {
  if (p === "hoog") return "border-red-100 bg-red-50";
  if (p === "midden") return "border-amber-100 bg-amber-50";
  return "border-blue-100 bg-blue-50";
}

// Bouw een hulp-engine link vanuit een website-scan uitkomst.
// Keuze van flow: 'regel-onduidelijk' — een ondernemer wil vaak een leverancier,
// webbouwer of (lokale) instantie uitleg vragen over wat er moet gebeuren aan
// de website. Die flow levert een concept-vraag met een open onderwerp + uitleg.
// We vullen minimaal twee velden voor:
//  - onderwerp: korte titel ("Online vindbaarheid van <domein>")
//  - onduidelijk: top-aanbevelingen uit de scan (hoog/midden prioriteit)
//  - urgentie: 'deadline' bij score<80, anders 'informatief'. We zetten bewust
//    nooit 'handhaving' — die optie impliceert lopende handhaving/controle en
//    dat valt niet uit een scan-score af te leiden.
function bouwHulpEngineHref(r: ScanResult): string {
  const params = new URLSearchParams();

  let domein = r.url;
  try {
    domein = new URL(r.url).hostname.replace(/^www\./, "");
  } catch {
    // url zoals ingevoerd zonder protocol — laat ongewijzigd
  }
  params.set("onderwerp", `Online vindbaarheid van ${domein}`);

  const top = (r.analysis.aanbevelingen ?? [])
    .filter((a) => a.prioriteit === "hoog" || a.prioriteit === "midden")
    .slice(0, 3);
  const lijst = (top.length > 0 ? top : (r.analysis.aanbevelingen ?? []).slice(0, 3))
    .map((a, i) => `${i + 1}. ${a.actie}`)
    .join("\n");
  const onduidelijk = [
    `Uit een website-scan van ${domein} (score ${r.analysis.overallScore}/100) komen de volgende punten naar voren:`,
    lijst,
    "",
    "Mijn vraag: hoe pak ik dit het beste aan en wie is hiervoor verantwoordelijk?",
  ]
    .filter(Boolean)
    .join("\n");
  params.set("onduidelijk", onduidelijk);

  const score = r.analysis.overallScore;
  const urgentie = score < 80 ? "deadline" : "informatief";
  params.set("urgentie", urgentie);

  return `/regels/help/regel-onduidelijk?${params.toString()}`;
}

export default function WebsiteScanPage() {
  usePageTitle("Website Scan");
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.plan === "pro" || user?.plan === "coaching" || user?.role === "admin" || user?.role === "master";

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [showTechnisch, setShowTechnisch] = useState(false);

  const MSGS = [
    "Website ophalen...",
    "HTML en meta-tags analyseren...",
    "SEO-signalen controleren...",
    "Lokale aanwezigheid beoordelen...",
    "AI-aanbevelingen genereren...",
  ];

  const runScan = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setMsgIdx(0);
    setShowTechnisch(false);

    const interval = setInterval(() => {
      setMsgIdx(prev => Math.min(prev + 1, MSGS.length - 1));
    }, 2500);

    try {
      const res = await apiRequest("POST", "/api/tools/website-scan", { url: trimmed });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data as ScanResult);
    } catch (e: any) {
      setError(e.message || "Scan mislukt. Controleer de URL en probeer opnieuw.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const lines = [
      `WEBSITE SCAN — ${result.url}`,
      `Score: ${result.analysis.overallScore}/100`,
      "",
      result.analysis.samenvattend,
      "",
      "WAT TE DOEN:",
      ...result.analysis.aanbevelingen.map(
        (a, i) => `${i + 1}. [${a.prioriteit.toUpperCase()}] ${a.actie}\n   ${a.waarom}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast({ title: "Rapport gekopieerd" });
  };

  if (!isPro) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Website Scan</h1>
        <p className="text-slate-600 mb-8">
          De uitgebreide website scan is beschikbaar voor Pro-bijdragers. Krijg een directe analyse
          van jouw online zichtbaarheid met concrete actiepunten.
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
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: "220px" }}>
        <img src="/img/zichtbaarheid.webp" alt="Website analyse & SEO" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,42,78,0.88) 0%, rgba(15,42,78,0.55) 60%, rgba(15,42,78,0.2) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end p-7">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Pro-tool · Zichtbaarheid</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Website Scan</h1>
          <p className="text-sm text-white/70">
            Voer je websiteadres in en ontdek direct wat je moet aanpakken voor betere vindbaarheid.
          </p>
        </div>
      </div>

      {/* Input */}
      <Card className="mb-5">
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="bijv. www.jouwbedrijf.nl"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && runScan()}
                className="pl-9"
                disabled={loading}
                data-testid="input-website-url"
              />
            </div>
            <Button
              onClick={runScan}
              disabled={loading || !url.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-start-scan"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Search className="w-4 h-4 mr-2" />Scannen</>
              }
            </Button>
          </div>

          {loading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 flex-shrink-0" />
                <span>{MSGS[msgIdx]}</span>
              </div>
              <Progress value={((msgIdx + 1) / MSGS.length) * 80} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-5" data-testid="scan-error">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Scan mislukt</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5" data-testid="scan-result">

          {/* Score banner */}
          {(() => {
            const s = scoreLabel(result.analysis.overallScore);
            return (
              <div className="rounded-xl p-5 flex items-center gap-5" style={{ background: s.bg }}>
                <div className="text-center flex-shrink-0">
                  <div className="text-5xl font-black leading-none" style={{ color: s.color }}>
                    {result.analysis.overallScore}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">/ 100</div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 mb-1">{s.label}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.analysis.samenvattend}</p>
                </div>
              </div>
            );
          })()}

          {/* Actielijst — het meest zichtbaar */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-red-500" />
              <h2 className="font-bold text-slate-800">Dit moet je aanpakken</h2>
            </div>
            <div className="space-y-2.5">
              {result.analysis.aanbevelingen.map((a, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${prioriteitStyle(a.prioriteit)}`}
                  data-testid={`actie-${i}`}
                >
                  <div className="flex items-start gap-2.5">
                    {prioriteitIcon(a.prioriteit)}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{a.actie}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.waarom}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categorieën scores */}
          <div>
            <h2 className="font-bold text-slate-800 mb-3">Scores per categorie</h2>
            <div className="grid grid-cols-2 gap-3">
              {result.analysis.categories.map((cat, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100" data-testid={`cat-${i}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">{cat.naam}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: cat.score >= 70 ? "#059669" : cat.score >= 45 ? "#d97706" : "#dc2626" }}
                    >
                      {cat.score}/100
                    </span>
                  </div>
                  <Progress value={cat.score} className="h-1.5 mb-2" />
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.toelichting}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sterke punten */}
          {result.analysis.sterkePunten?.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-800 mb-3">Wat al goed gaat</h2>
              <div className="space-y-2">
                {result.analysis.sterkePunten.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-800">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technische details — inklapbaar */}
          {result.signals && Object.keys(result.signals).length > 3 && (
            <div>
              <button
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                onClick={() => setShowTechnisch(prev => !prev)}
                data-testid="toggle-technisch"
              >
                {showTechnisch ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Technische signalen bekijken
              </button>
              {showTechnisch && (
                <Card className="mt-3">
                  <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: "HTTPS", value: result.signals.isHttps, type: "bool" },
                        { label: "Mobiel viewport", value: result.signals.hasViewport, type: "bool" },
                        { label: "Canonical tag", value: result.signals.hasCanonical, type: "bool" },
                        { label: "Structured data", value: result.signals.hasStructuredData, type: "bool" },
                        { label: "OG-afbeelding", value: result.signals.hasOgImage, type: "bool" },
                        { label: "Telefoonnummer", value: result.signals.hasPhone, type: "bool" },
                        { label: "E-mailadres", value: result.signals.hasEmail, type: "bool" },
                        { label: "Google Maps", value: result.signals.hasGoogleMaps, type: "bool" },
                        { label: "H1-koppen", value: result.signals.h1Count, type: "num" },
                        { label: "H2-koppen", value: result.signals.h2Count, type: "num" },
                        { label: "Afbeeldingen", value: result.signals.imgTotal, type: "num" },
                        { label: "Geen alt-tekst", value: result.signals.imgNoAlt, type: "num-warn" },
                      ].map((sig, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {sig.type === "bool" ? (
                            sig.value
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          ) : sig.type === "num-warn" ? (
                            (sig.value as number) > 0
                              ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          )}
                          <span className="text-xs text-slate-600">{sig.label}</span>
                          {(sig.type === "num" || sig.type === "num-warn") && (
                            <span className="text-xs font-bold text-slate-700 ml-auto">{sig.value as number}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href={bouwHulpEngineHref(result)}>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-hulp-engine"
              >
                <HelpCircle className="w-4 h-4 mr-2" />Reageren met hulp-engine
              </Button>
            </Link>
            <Button variant="outline" onClick={copyReport} data-testid="button-copy-report">
              <Copy className="w-4 h-4 mr-2" />Rapport kopiëren
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setUrl(""); }} data-testid="button-new-scan">
              <RotateCcw className="w-4 h-4 mr-2" />Nieuwe scan
            </Button>
          </div>
          <p className="text-xs text-slate-500 -mt-2" data-testid="text-hulp-engine-hint">
            Geeft de scan-uitkomsten door aan de flow 'Regel of besluit niet duidelijk' zodat je
            direct een concept-vraag opstelt voor je webbouwer of de gemeente.
          </p>
        </div>
      )}
    </div>
  );
}
