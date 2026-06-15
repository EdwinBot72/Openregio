import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Send,
  RefreshCw,
  ChevronRight,
  Wrench,
  Lightbulb,
  ArrowRight,
  Users,
  FileText,
  Globe,
  TrendingUp,
  Settings,
  Mail,
  BarChart2,
  Zap,
  HelpCircle,
  ShoppingBag,
  Building2,
  RotateCcw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Mode = "route" | "woo";

interface BusinessTool {
  name: string;
  category: string;
  pricing: "gratis" | "freemium" | "betaald";
  difficulty: "makkelijk" | "gemiddeld" | "gevorderd";
  whenToUse: string;
  openRegioService?: string;
}

interface RouteResult {
  intent: string;
  tools: BusinessTool[];
  answer: string;
}

// ── WOO types (kept for backward compat) ─────────────────────────────────────
type Task =
  | "analyse_besluit"
  | "mandaat_check"
  | "wat_ontbreekt"
  | "vervolg_woo"
  | "tijdlijn"
  | "publiceer_samenvatting";

interface Region { id: number; name: string; slug: string }
interface Authority { id: number; name: string; slug: string }
interface DossierRow {
  id: number; title: string; reference_code: string | null;
  region_name: string | null;
}
interface Citation {
  sourceNo: number; source_type: string; request_id: number;
  document_id: number | null; region: string | null; authority: string | null;
  title: string | null; filename: string | null; file_url: string | null;
}
interface WooResponse { answer: string; citations: Citation[] }

interface Message {
  role: "bot" | "user";
  text: string;
  citations?: Citation[];
  isError?: boolean;
}

const TASK_LABELS: Record<Task, string> = {
  analyse_besluit: "Analyseer besluit",
  mandaat_check: "Mandaat-check",
  wat_ontbreekt: "Wat ontbreekt?",
  vervolg_woo: "Vervolg-WOO",
  tijdlijn: "Bouw tijdlijn",
  publiceer_samenvatting: "Publiceer-samenvatting",
};

const TASK_TEMPLATES: Record<Task, string> = {
  analyse_besluit:
    "Analyseer dit besluit/antwoord. Geef: kernbeslissing, genoemde grondslag, wie tekent/rol, wat wringt, en welke stukken ontbreken (WOO).\n\n",
  mandaat_check:
    "Doe een mandaat-check voor dit onderwerp/besluit. Zoek naar mandaat/delegatie/aanwijzing/uitbesteding. Zeg wat je wel/niet ziet en formuleer concrete WOO-vragen.\n\n",
  wat_ontbreekt:
    "Maak een checklist van ontbrekende stukken (besluiten, mandaatregister, contracten, werkinstructies, beleidskaders). Formuleer vervolg-WOO vragen.\n\n",
  vervolg_woo:
    "Genereer vervolg-WOO vragen op basis van gaten/inconsistenties. Kort, documentgericht.\n\n",
  tijdlijn:
    "Bouw een tijdlijn met datum/actie/partij en markeer hiaten. Gebruik alleen feiten uit bronnen.\n\n",
  publiceer_samenvatting:
    "Maak een publicatie-ready samenvatting (zonder persoonsgegevens). Alleen feiten + verwijzingen.\n\n",
};

const WOO_SUGGESTIONS: { label: string; task: Task }[] = [
  { label: "Analyseer een besluit", task: "analyse_besluit" },
  { label: "Doe een mandaat-check", task: "mandaat_check" },
  { label: "Wat ontbreekt in dit dossier?", task: "wat_ontbreekt" },
  { label: "Stel vervolg-WOO vragen op", task: "vervolg_woo" },
  { label: "Bouw een tijdlijn", task: "tijdlijn" },
  { label: "Maak een publiceerbare samenvatting", task: "publiceer_samenvatting" },
];

// ── Quick prompts ─────────────────────────────────────────────────────────────

const QUICK_PROMPTS: { label: string; icon: typeof Users; prompt: string }[] = [
  { label: "Meer klanten", icon: Users, prompt: "Ik wil meer klanten voor mijn bedrijf" },
  { label: "Minder administratie", icon: FileText, prompt: "Ik wil minder tijd kwijt aan administratie" },
  { label: "AI gebruiken", icon: Bot, prompt: "Ik wil AI gebruiken maar weet niet hoe" },
  { label: "Offerte maken", icon: ShoppingBag, prompt: "Ik wil een professionele offerte maken" },
  { label: "Website verbeteren", icon: Globe, prompt: "Ik wil mijn website of aanbod verbeteren" },
  { label: "Tool kiezen", icon: Wrench, prompt: "Ik zoek een handige tool voor mijn bedrijf" },
  { label: "Automatiseren", icon: Zap, prompt: "Ik wil iets automatiseren in mijn bedrijf" },
  { label: "Gemeente of regels", icon: Building2, prompt: "Ik heb een vraag over gemeente of regels" },
  { label: "Actie starten", icon: TrendingUp, prompt: "Ik wil een actie of campagne starten" },
  { label: "Bedrijf organiseren", icon: Settings, prompt: "Ik wil mijn bedrijf beter organiseren" },
];

const INTENT_LABELS: Record<string, string> = {
  klanten_krijgen: "Klanten krijgen",
  administratie_verminderen: "Administratie verminderen",
  ai_tool_kiezen: "AI-tool kiezen",
  automatisering: "Automatisering",
  teksten_en_communicatie: "Teksten & communicatie",
  website_en_aanbod: "Website & aanbod",
  social_media_en_content: "Social media & content",
  offertes_en_facturen: "Offertes & facturen",
  planning_en_productiviteit: "Planning & productiviteit",
  gemeente_en_regels: "Gemeente & regels",
  verkoop_en_lancering: "Verkoop & lancering",
  bedrijf_organiseren: "Bedrijf organiseren",
  onbekend: "Algemene vraag",
};

const PRICING_LABELS: Record<string, string> = {
  gratis: "Gratis",
  freemium: "Freemium",
  betaald: "Betaald",
};

// Parse structured markdown answer into sections
function parseAnswer(text: string) {
  const sections: { heading: string; body: string }[] = [];
  const lines = text.split("\n");
  let current: { heading: string; body: string } | null = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.replace("## ", "").trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ heading: "", body: text }];
}

const CTA_BUTTONS = [
  "Laat mijn route uitwerken",
  "Maak een lokale actie voor mij",
  "Help mij met AI-tools",
  "Laat mijn website checken",
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function RegioBotPage() {
  usePageTitle("RegioBot");
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "coaching";
  const searchString = useSearch();

  const [mode, setMode] = useState<Mode>("route");

  // Route planner state
  const [routeMessage, setRouteMessage] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [showExtra, setShowExtra] = useState(false);

  // WOO state
  const [task, setTask] = useState<Task>("analyse_besluit");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: "bot",
    text: "Hoi! Ik ben de WOO-analysemodule. Ik help je met WOO-verzoeken, mandaatchecks en analyses van besluiten — altijd met bronvermelding. Kies een taak of stel direct je vraag.",
  }]);
  const [lastQuestion, setLastQuestion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedAuthority, setSelectedAuthority] = useState("all");
  const [selectedDossierId, setSelectedDossierId] = useState("none");

  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ["/api/woo/regions"],
    enabled: mode === "woo",
  });
  const { data: authorities = [] } = useQuery<Authority[]>({
    queryKey: ["/api/woo/authorities"],
    enabled: mode === "woo",
  });
  const dossiersUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedRegion !== "all") p.set("region", selectedRegion);
    if (selectedAuthority !== "all") p.set("authority", selectedAuthority);
    return `/api/woo/library?${p.toString()}`;
  }, [selectedRegion, selectedAuthority]);
  const { data: dossiers = [] } = useQuery<DossierRow[]>({
    queryKey: [dossiersUrl],
    enabled: mode === "woo",
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const dossier = params.get("dossier");
    const t = params.get("task") as Task | null;
    if (dossier) { setSelectedDossierId(dossier); setMode("woo"); }
    if (t && t in TASK_LABELS) { setTask(t); setMode("woo"); }
  }, [searchString]);

  // Route planner mutation
  const routeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/regiobot/route", {
        message: routeMessage,
        businessType: businessType || undefined,
        city: city || undefined,
      });
      return res.json() as Promise<RouteResult>;
    },
    onSuccess: (data) => {
      setRouteResult(data);
      setRouteError(null);
    },
    onError: (err: any) => {
      const match = err?.message?.match(/^(\d{3}):\s*([\s\S]*)/);
      let msg = "Er ging iets mis. Probeer het opnieuw.";
      if (match) {
        try { msg = JSON.parse(match[2])?.error ?? msg; } catch { msg = match[2] ?? msg; }
      }
      setRouteError(msg);
      setRouteResult(null);
    },
  });

  // WOO mutation
  const askMutation = useMutation({
    mutationFn: async (finalQuestion: string) => {
      const res = await apiRequest("POST", "/api/regiobot", {
        task,
        question: finalQuestion,
        dossierRequestId: selectedDossierId === "none" ? undefined : Number(selectedDossierId),
        regionSlug: selectedRegion === "all" ? undefined : selectedRegion,
        authoritySlug: selectedAuthority === "all" ? undefined : selectedAuthority,
        limit: 6,
      });
      return res.json() as Promise<WooResponse>;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "bot", text: data.answer, citations: data.citations }]);
    },
    onError: (err: any) => {
      let msg = "Er ging iets mis. Probeer het opnieuw.";
      const match = err?.message?.match(/^(\d{3}):\s*([\s\S]*)/);
      if (match) {
        const status = parseInt(match[1], 10);
        try {
          const parsed = JSON.parse(match[2]);
          const bMsg = parsed.error ?? parsed.message;
          if (status === 503) msg = `Service tijdelijk niet beschikbaar.${bMsg ? ` ${bMsg}` : ""}`;
          else if (status === 429) msg = "Te veel aanvragen. Wacht even en probeer opnieuw.";
          else if (bMsg) msg = bMsg;
        } catch { /* ignore */ }
      }
      setMessages((prev) => [...prev, { role: "bot", text: msg, isError: true }]);
    },
  });

  const handleWooSubmit = () => {
    const final = question.trim();
    if (final.length < 3 && selectedDossierId === "none") return;
    setLastQuestion(final);
    setMessages((prev) => [...prev, { role: "user", text: final || `(${TASK_LABELS[task]})` }]);
    setQuestion("");
    askMutation.mutate(final);
  };

  const handleWooRetry = () => {
    if (!lastQuestion && selectedDossierId === "none") return;
    setMessages((prev) => [...prev, { role: "user", text: lastQuestion || `(${TASK_LABELS[task]})` }]);
    askMutation.mutate(lastQuestion);
  };

  const handleQuickPrompt = (prompt: string) => {
    setRouteMessage(prompt);
    setRouteResult(null);
    setRouteError(null);
  };

  const handleRouteSubmit = () => {
    if (routeMessage.trim().length < 5) return;
    setRouteResult(null);
    setRouteError(null);
    routeMutation.mutate();
  };

  const handleReset = () => {
    setRouteResult(null);
    setRouteError(null);
    setRouteMessage("");
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4" data-testid="page-regiobot-gate">
        <Bot className="w-12 h-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">RegioBot</h1>
        <p className="text-muted-foreground">Log in om RegioBot te gebruiken.</p>
        <Link href="/login">
          <Button data-testid="button-login">Inloggen</Button>
        </Link>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" data-testid="page-regiobot">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Bot className="w-7 h-7 text-primary" />
          RegioBot
        </h1>
        <p className="text-muted-foreground">
          Slimme AI-hulp voor lokale ondernemers. Vertel wat je zoekt — RegioBot geeft je direct de slimste route, handige tools en concrete stappen.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 border-b pb-0">
        <button
          onClick={() => setMode("route")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            mode === "route"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid="tab-route"
        >
          Slimme route
        </button>
        <button
          onClick={() => setMode("woo")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            mode === "woo"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid="tab-woo"
        >
          WOO-analyse
          {!isPro && <span className="ml-1 text-xs text-muted-foreground">(Pro)</span>}
        </button>
      </div>

      {/* ── SLIMME ROUTE MODE ────────────────────────────────────────────── */}
      {mode === "route" && (
        <div className="space-y-5">
          {/* Quick prompts */}
          {!routeResult && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="grid-quick-prompts">
              {QUICK_PROMPTS.map((qp) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-left transition-colors hover-elevate ${
                      routeMessage === qp.prompt
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground"
                    }`}
                    data-testid={`button-quick-${qp.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Input card */}
          {!routeResult && (
            <Card data-testid="card-input">
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="rb-message">Jouw vraag of situatie</Label>
                  <Textarea
                    id="rb-message"
                    value={routeMessage}
                    onChange={(e) => setRouteMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleRouteSubmit();
                      }
                    }}
                    placeholder="Bijv. Ik ben kapper en wil meer boekingen op dinsdag"
                    maxLength={2000}
                    rows={3}
                    data-testid="textarea-message"
                  />
                  <p className="text-xs text-muted-foreground text-right">{routeMessage.length}/2000</p>
                </div>

                {/* Optional fields toggle */}
                <button
                  type="button"
                  onClick={() => setShowExtra((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  data-testid="button-toggle-extra"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${showExtra ? "rotate-90" : ""}`} />
                  Bedrijfstype en plaats toevoegen (optioneel)
                </button>

                {showExtra && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="rb-biztype">Bedrijfstype</Label>
                      <Input
                        id="rb-biztype"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        placeholder="bijv. kapsalon, bouwbedrijf"
                        maxLength={100}
                        data-testid="input-business-type"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rb-city">Plaats / regio</Label>
                      <Input
                        id="rb-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="bijv. Utrecht, Gelderland"
                        maxLength={100}
                        data-testid="input-city"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRouteSubmit}
                  disabled={routeMutation.isPending || routeMessage.trim().length < 5}
                  className="w-full"
                  data-testid="button-submit-route"
                >
                  {routeMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Route wordt bepaald...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Geef mij de slimste route
                    </>
                  )}
                </Button>

                {!user?.plan || user.plan === "basic" || user.plan === "pending" ? (
                  <p className="text-xs text-center text-muted-foreground">
                    Basis: 3 routes per dag &nbsp;·&nbsp;{" "}
                    <Link href="/lidmaatschap?plan=pro" className="text-primary hover:underline">
                      Upgrade naar Pro voor 50/maand
                    </Link>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {routeError && (
            <Card className="border-destructive/30" data-testid="card-route-error">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm text-destructive">{routeError}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-reset">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Opnieuw proberen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading skeleton */}
          {routeMutation.isPending && (
            <div className="space-y-3" data-testid="skeleton-loading">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32" />
              <Skeleton className="h-24" />
            </div>
          )}

          {/* Result */}
          {routeResult && !routeMutation.isPending && (
            <div className="space-y-4" data-testid="card-route-result">

              {/* Header with intent + reset */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Jouw route</span>
                  <Badge variant="secondary" data-testid="badge-intent">
                    {INTENT_LABELS[routeResult.intent] ?? routeResult.intent}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} data-testid="button-new-question">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Nieuwe vraag
                </Button>
              </div>

              {/* Structured answer */}
              <Card data-testid="card-answer">
                <CardContent className="pt-4 space-y-4">
                  {parseAnswer(routeResult.answer).map((section, i) => (
                    <div key={i} className="space-y-1">
                      {section.heading && (
                        <p className="font-semibold text-sm text-foreground">{section.heading}</p>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {section.body.trim()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tool cards */}
              {routeResult.tools.length > 0 && (
                <div className="space-y-2" data-testid="section-tools">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    Aanbevolen tools
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {routeResult.tools.map((tool) => (
                      <Card key={tool.name} className="text-sm" data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <CardContent className="pt-3 pb-3 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium">{tool.name}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                {PRICING_LABELS[tool.pricing] ?? tool.pricing}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {tool.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{tool.whenToUse}</p>
                          {tool.openRegioService && (
                            <p className="text-xs text-primary/80">{tool.openRegioService}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA section */}
              <Card className="bg-primary/5 border-primary/20" data-testid="card-cta">
                <CardContent className="pt-4 space-y-3">
                  <p className="font-semibold text-sm">Wil je dat OpenRegio dit voor je uitwerkt?</p>
                  <p className="text-xs text-muted-foreground">
                    Onze specialisten kunnen de route concreet maken voor jouw bedrijf.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CTA_BUTTONS.map((label) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid={`button-cta-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <a href="mailto:info@openregio.nl?subject=Hulpvraag%20RegioBot">
                          {label}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── WOO-ANALYSE MODE ─────────────────────────────────────────────── */}
      {mode === "woo" && !isPro && (
        <Card data-testid="card-woo-upgrade">
          <CardContent className="pt-6 pb-6 text-center space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground" />
            <h3 className="font-semibold">WOO-analyse is beschikbaar voor Pro-leden</h3>
            <p className="text-sm text-muted-foreground">
              Krijg toegang tot de WOO-bibliotheek, dossieranalyse en mandaatchecks.
            </p>
            <Link href="/lidmaatschap?plan=pro">
              <Button data-testid="button-upgrade-pro">Upgrade naar Pro</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {mode === "woo" && isPro && (
        <div className="space-y-4" data-testid="section-woo">
          {/* Context filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="rb-dossier">Dossier (optioneel)</Label>
                <select
                  id="rb-dossier"
                  value={selectedDossierId}
                  onChange={(e) => setSelectedDossierId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="select-dossier"
                >
                  <option value="none">Geen dossier (losse vraag)</option>
                  {dossiers.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.title || "(geen titel)"}{d.reference_code ? ` · ${d.reference_code}` : ""}
                      {d.region_name ? ` · ${d.region_name}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="rb-region">Regio</Label>
                  <select
                    id="rb-region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    data-testid="select-region"
                  >
                    <option value="all">Alle regio's</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.slug}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rb-authority">Bestuursorgaan</Label>
                  <select
                    id="rb-authority"
                    value={selectedAuthority}
                    onChange={(e) => setSelectedAuthority(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    data-testid="select-authority"
                  >
                    <option value="all">Alle bestuursorganen</option>
                    {authorities.map((a) => (
                      <option key={a.id} value={a.slug}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task suggestion pills */}
          <div className="flex flex-wrap gap-2" data-testid="card-suggestions">
            {WOO_SUGGESTIONS.map((s) => (
              <button
                key={s.task}
                onClick={() => { setTask(s.task); setQuestion(TASK_TEMPLATES[s.task]); }}
                className={`rounded-full border px-3 py-1 text-xs transition-colors hover-elevate ${
                  task === s.task ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
                data-testid={`suggestion-${s.task}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Chat */}
          <Card data-testid="card-chat">
            <CardContent className="pt-4 space-y-3">
              <div
                className="space-y-3 max-h-96 overflow-y-auto pr-1"
                data-testid="chat-messages"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-md px-3 py-2 text-sm ${
                      m.role === "bot"
                        ? "bg-muted text-foreground"
                        : "bg-primary/10 text-foreground ml-8"
                    }`}
                    data-testid={`message-${m.role}-${idx}`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2 space-y-0.5 text-xs text-muted-foreground border-t pt-2">
                        {m.citations.map((c) => (
                          <div key={c.sourceNo} data-testid={`citation-${idx}-${c.sourceNo}`}>
                            Bron {c.sourceNo}: {c.title || c.filename || `request ${c.request_id}`}
                          </div>
                        ))}
                      </div>
                    )}
                    {m.isError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWooRetry}
                        disabled={askMutation.isPending}
                        className="mt-2"
                        data-testid={`button-retry-${idx}`}
                      >
                        Probeer opnieuw
                      </Button>
                    )}
                  </div>
                ))}
                {askMutation.isPending && (
                  <div className="bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground" data-testid="message-loading">
                    RegioBot denkt na...
                  </div>
                )}
              </div>

              <form
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); handleWooSubmit(); }}
              >
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Stel een vraag — actieve taak: ${TASK_LABELS[task]}`}
                  rows={2}
                  className="resize-none"
                  data-testid="textarea-question"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleWooSubmit();
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={askMutation.isPending || (question.trim().length < 3 && selectedDossierId === "none")}
                  data-testid="button-submit"
                  className="shrink-0 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
