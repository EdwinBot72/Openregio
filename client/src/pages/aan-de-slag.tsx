import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  Lightbulb, CheckCircle2, Circle, ArrowRight, Bot, FileText,
  Globe, Users, Zap, Landmark, Shield, Star, Clock, MapPin,
  TrendingUp, ChevronRight, Sparkles, Target, Newspaper,
  ScanText, Building2, Monitor, Handshake, Search,
} from "lucide-react";
import type { IntelSignaal } from "@shared/schema";

type NieuwsTip = {
  tip: string;
  bronnen: string[];
  bronUrl?: string;
  datum: string;
  cached?: boolean;
  fallback?: boolean;
};

const KEUZE_BLOKKEN = [
  {
    icon: Search,
    label: "Ik wil beter gevonden worden",
    sub: "Website check, vindbaarheid en bedrijfsprofiel",
    href: "/tools/website-scan",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    ring: "ring-blue-200 dark:ring-blue-900/60",
    testid: "keuze-gevonden",
  },
  {
    icon: ScanText,
    label: "Ik wil een brief laten checken",
    sub: "Upload een overheidsbrief of beschikking",
    href: "/tools/brief-analyse",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    ring: "ring-violet-200 dark:ring-violet-900/60",
    testid: "keuze-brief",
  },
  {
    icon: TrendingUp,
    label: "Ik wil kansen in mijn regio zien",
    sub: "Subsidies, aanbestedingen en regio-updates",
    href: "/kansen-in-de-buurt",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    ring: "ring-emerald-200 dark:ring-emerald-900/60",
    testid: "keuze-kansen",
  },
];

const STAPPEN = [
  {
    nr: 1,
    titel: "Maak je profiel aan",
    omschrijving: "Vul je bedrijfsprofiel in zodat andere leden je kunnen vinden.",
    icon: Shield,
    url: "/bedrijfsprofiel",
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    checkKey: "profiel",
  },
  {
    nr: 2,
    titel: "Doe de Lokale Basischeck",
    omschrijving: "Controleer in 3 minuten of je voldoet aan de regels in jouw regio.",
    icon: Target,
    url: "/basischeck",
    kleur: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    checkKey: "basischeck",
  },
  {
    nr: 3,
    titel: "Bekijk regio-updates",
    omschrijving: "Bekijk welke regelgeving, subsidies en beleid er actueel zijn.",
    icon: TrendingUp,
    url: "/intel",
    kleur: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    checkKey: "intel",
  },
  {
    nr: 4,
    titel: "Stuur een overheidsbrief in",
    omschrijving: "Upload een beschikking of gemeentebesluit en laat OpenRegio het voor jou lezen.",
    icon: FileText,
    url: "/tools/brief-analyse",
    kleur: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    checkKey: "brief",
  },
  {
    nr: 5,
    titel: "Stel RegioBot een vraag",
    omschrijving: "Gebruik AI om documenten te analyseren en antwoorden te vinden.",
    icon: Bot,
    url: "/regiobot",
    kleur: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    checkKey: "regiobot",
    proOnly: true,
  },
];

function getGreeting() {
  const uur = new Date().getHours();
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

const CHECKLIST_KEY = "openregio_checklist_v1";

function loadChecklist(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecklist(data: Record<string, boolean>) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data));
}

export default function AanDeSlagPage() {
  usePageTitle("Aan de slag");
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "coaching" || user?.role === "admin" || user?.role === "master";

  const [checklist, setChecklist] = useState<Record<string, boolean>>(loadChecklist);
  const greeting = getGreeting();

  const { data: nieuwsTip, isLoading: tipLoading } = useQuery<NieuwsTip>({
    queryKey: ["/api/tools/nieuws-tip"],
    queryFn: () => fetch("/api/tools/nieuws-tip").then((r) => r.json()),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const { data: signalen = [] } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen", "alle"],
    queryFn: () => fetch("/api/intel/signalen").then((r) => r.json()),
  });

  const recenteSignalen = signalen.slice(0, 3);

  const stappen = STAPPEN.filter((s) => !s.proOnly || isPro);
  const gedaanAantal = stappen.filter((s) => checklist[s.checkKey]).length;
  const voortgang = Math.round((gedaanAantal / stappen.length) * 100);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveChecklist(updated);
      return updated;
    });
  };

  const formatDatum = (d: string | Date) =>
    new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long" });

  const voornaam =
    user?.firstName?.trim() ||
    user?.businessName?.trim() ||
    user?.email?.split("@")[0] ||
    "ondernemer";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── Hero greeting ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-7 text-white" data-testid="section-greeting">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Vandaag</span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] rounded-full border-white/20 bg-white/10 text-white"
            data-testid="badge-plan-greeting"
          >
            {isPro ? "Pro" : "Basis"}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-black leading-tight mb-1 text-white" data-testid="text-greeting">
          {greeting}, {voornaam}!
        </h1>
        <p className="text-white/70 text-sm mb-0">
          Wat wil je vandaag aanpakken?
        </p>
      </div>

      {/* ── 4 Keuzeblokken ───────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-3" data-testid="section-keuzes">
        {KEUZE_BLOKKEN.map((blok) => (
          <Link key={blok.testid} href={blok.href} asChild>
            <a
              className={`group flex items-center gap-4 rounded-2xl border bg-card p-5 hover-elevate cursor-pointer ring-1 ${blok.ring} transition-all`}
              data-testid={blok.testid}
            >
              <div className={`w-12 h-12 rounded-xl ${blok.bg} flex items-center justify-center shrink-0`}>
                <blok.icon className={`h-5 w-5 ${blok.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground leading-tight">{blok.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{blok.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </Link>
        ))}
      </div>

      {/* ── Kans van vandaag + Voortgang ─────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        <Card data-testid="card-tip-van-vandaag">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Kans van vandaag</CardTitle>
                  <p className="text-xs text-muted-foreground">Actueel nieuws voor jou vertaald</p>
                </div>
              </div>
              {!nieuwsTip?.fallback && (
                <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                  <Newspaper className="h-2.5 w-2.5" />
                  {nieuwsTip?.bronnen?.[0] ?? "Actueel nieuws"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tipLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-nieuws-tip">
                {nieuwsTip?.tip ?? "Controleer vandaag of de lokale regelgeving in jouw gemeente is bijgewerkt via Regio-updates."}
              </p>
            )}
            {nieuwsTip?.bronUrl ? (
              <a href={nieuwsTip.bronUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full" data-testid="button-tip-actie" disabled={tipLoading}>
                  Lees het nieuwsartikel <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ) : (
              <Link href="/intel">
                <Button size="sm" className="w-full" data-testid="button-tip-actie" disabled={tipLoading}>
                  Bekijk regio-updates <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-voortgang">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                  <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-sm font-semibold">Jouw voortgang</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">{gedaanAantal}/{stappen.length} klaar</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={voortgang} className="h-1.5" data-testid="progress-checklist" />
            <div className="space-y-1.5">
              {stappen.map((stap) => (
                <button
                  key={stap.checkKey}
                  className="w-full flex items-center gap-3 text-left py-1.5 hover-elevate rounded-md px-1"
                  onClick={() => toggleCheck(stap.checkKey)}
                  data-testid={`check-${stap.checkKey}`}
                >
                  {checklist[stap.checkKey] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm ${checklist[stap.checkKey] ? "line-through text-muted-foreground" : ""}`}>
                    {stap.titel}
                    {stap.proOnly && <Badge variant="outline" className="ml-2 text-[10px] py-0">Pro</Badge>}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Actuele signalen ─────────────────────────────────────────────── */}
      <Card data-testid="card-actuele-signalen">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-sm font-semibold">Actuele signalen in jouw regio</CardTitle>
            </div>
            <Link href="/intel">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" data-testid="button-alle-signalen">
                Alles zien <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recenteSignalen.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Signalen worden geladen...</p>
          ) : (
            <div className="space-y-3">
              {recenteSignalen.map((signaal) => (
                <div
                  key={signaal.id}
                  className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0"
                  data-testid={`signaal-item-${signaal.id}`}
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{signaal.titel}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{signaal.regio}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDatum(signaal.datum)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Stappengids ──────────────────────────────────────────────────── */}
      <Card data-testid="section-stappen">
        <CardHeader>
          <CardTitle className="text-base">Hoe zet je OpenRegio optimaal in?</CardTitle>
          <p className="text-sm text-muted-foreground">Volg deze stappen om het meeste uit het platform te halen.</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STAPPEN.map((stap) => (
              <Link key={stap.nr} href={stap.url} asChild>
                <a
                  className="rounded-xl border p-4 space-y-2 hover-elevate cursor-pointer block"
                  data-testid={`stap-${stap.nr}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${stap.bg} flex items-center justify-center shrink-0`}>
                      <stap.icon className={`h-4 w-4 ${stap.kleur}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">Stap {stap.nr}</span>
                    {stap.proOnly && <Badge variant="outline" className="text-[10px] py-0 ml-auto">Pro</Badge>}
                  </div>
                  <p className="font-semibold text-sm">{stap.titel}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{stap.omschrijving}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stap.kleur}`}>
                    Ga naar <ChevronRight className="h-3 w-3" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Pro-upgrade CTA voor basis-leden ─────────────────────────────── */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/40" data-testid="card-pro-cta">
          <CardContent className="p-5 flex items-center gap-4 flex-wrap justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Meer grip op brieven, kansen en documenten?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Met Pro gebruik je RegioBot AI, analyseer je brieven en maak je WOO-verzoeken. Vanaf €49/mnd.
                </p>
              </div>
            </div>
            <Link href="/lidmaatschap">
              <Button size="sm" data-testid="button-upgrade-pro">
                Bekijk Pro <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
