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
  BookOpen, TrendingUp, ChevronRight, Sparkles, Target,
  Scale, Network, Newspaper, RefreshCw, Leaf, Building2,
  Cpu, HandCoins, BarChart3, CircleDot,
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

const STAPPEN = [
  {
    nr: 1,
    titel: "Maak je profiel aan",
    omschrijving: "Vul je bedrijfsprofiel in zodat andere leden je kunnen vinden in het netwerk.",
    icon: Shield,
    url: "/bedrijfsprofiel",
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    checkKey: "profiel",
  },
  {
    nr: 2,
    titel: "Doe de Basischeck",
    omschrijving: "Controleer in 3 minuten of je voldoet aan de regels in jouw regio.",
    icon: Target,
    url: "/basischeck",
    kleur: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    checkKey: "basischeck",
  },
  {
    nr: 3,
    titel: "Volg Regio Intel",
    omschrijving: "Bekijk welke regelgeving, subsidies en beleid er actueel zijn voor jouw sector.",
    icon: TrendingUp,
    url: "/intel",
    kleur: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    checkKey: "intel",
  },
  {
    nr: 4,
    titel: "Stuur een overheidsbrief in",
    omschrijving: "Upload een beschikking, gemeentebesluit of officiële correspondentie en laat OpenRegio het voor jou lezen.",
    icon: FileText,
    url: "/woo-bibliotheek",
    kleur: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    checkKey: "dossier",
  },
  {
    nr: 5,
    titel: "Stel RegioBot een vraag",
    omschrijving: "Gebruik AI om documenten te analyseren en antwoorden te vinden met bronverwijzing.",
    icon: Bot,
    url: "/regiobot",
    kleur: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    checkKey: "regiobot",
    proOnly: true,
  },
];

const SNELLE_ACTIES = [
  { label: "Basischeck", icon: Target, url: "/basischeck", kleur: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40" },
  { label: "Regio Intel", icon: TrendingUp, url: "/intel", kleur: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
  { label: "RegioBot", icon: Bot, url: "/regiobot", kleur: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", proOnly: true },
  { label: "Brief begrijpen", icon: FileText, url: "/tools/brief-analyse", kleur: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { label: "Netwerk", icon: Users, url: "/regiocrew", kleur: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  { label: "Mijn dossiers", icon: Landmark, url: "/woo-bibliotheek", kleur: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
  { label: "Website Scan", icon: Globe, url: "/tools/website-scan", kleur: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", proOnly: true },
  { label: "Regelgeving", icon: BookOpen, url: "/regelgeving-verkenner", kleur: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
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
  const isPro = user?.plan === "pro" || (user as any)?.role === "admin" || (user as any)?.role === "master";

  const [checklist, setChecklist] = useState<Record<string, boolean>>(loadChecklist);
  const greeting = getGreeting();

  const { data: nieuwsTip, isLoading: tipLoading } = useQuery<NieuwsTip>({
    queryKey: ["/api/tools/nieuws-tip"],
    queryFn: () => fetch("/api/tools/nieuws-tip").then((r) => r.json()),
    staleTime: 1000 * 60 * 60, // 1 uur client-side cache
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

  const voornaam = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "ondernemer";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Hero greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111b3a] via-[#122347] to-[#0a6a5e] p-7 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Aan de slag</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black leading-tight mb-1">
          {greeting}, {voornaam}!
        </h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl">
          Hier vind je alles om OpenRegio optimaal in te zetten — tips, stappen en actuele signalen voor vandaag.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-white/30 text-white bg-white/10 hover:bg-white/20" data-testid="button-naar-dashboard">
              Ga naar dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/intel">
            <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90" data-testid="button-regio-intel">
              Actuele signalen <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Wat is OpenRegio? */}
      <div data-testid="section-wat-is-openregio">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Wat is OpenRegio?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Juridische post begrijpen</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Beschikkingen, bezwaarschriften en officiële gemeentebrieven zijn vaak onduidelijk geschreven. OpenRegio leest en vertaalt overheidsdocumentatie naar plain-language zodat jij weet wat er van je verwacht wordt — zonder advocaat.
              </p>
            </div>
          </div>
          <div className="rounded-xl border p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Network className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Coöperatief netwerk</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Als lid ben je mede-eigenaar van de coöperatie. Je hebt stemrecht, toegang tot het ondernemersnetwerk in jouw regio en kunt samenwerken met andere lokale ondernemers.
              </p>
            </div>
          </div>
          <div className="rounded-xl border p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">AI die werkt voor jou</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                RegioBot analyseert beschikkingen, gemeentebesluiten en correspondentie die jij uploadt. Stel een vraag en krijg altijd een antwoord met bronverwijzing — zodat je weet waar je aan toe bent.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Tip van vandaag — AI-gegenereerd op basis van actueel nieuws */}
        <Card data-testid="card-tip-van-vandaag">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Tip van vandaag</CardTitle>
                  <p className="text-xs text-muted-foreground">Gebaseerd op het nieuws van vandaag</p>
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
                {nieuwsTip?.tip ?? "Controleer vandaag of de lokale regelgeving in jouw gemeente is bijgewerkt via Regio Intel."}
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
                  Bekijk Regio Intel <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Voortgangskaart */}
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
            <div className="space-y-2">
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

      {/* Stappengids */}
      <Card data-testid="section-stappen">
        <CardHeader>
          <CardTitle className="text-base">Hoe zet je OpenRegio in?</CardTitle>
          <p className="text-sm text-muted-foreground">Volg deze stappen om het meeste uit het platform te halen.</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAPPEN.map((stap) => (
              <Link key={stap.nr} href={stap.url} asChild>
                <a
                  className="rounded-xl border p-4 space-y-3 hover-elevate cursor-pointer block"
                  data-testid={`stap-${stap.nr}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${stap.bg} flex items-center justify-center shrink-0`}>
                      <stap.icon className={`h-4 w-4 ${stap.kleur}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">Stap {stap.nr}</span>
                    {stap.proOnly && <Badge variant="outline" className="text-[10px] py-0 ml-auto">Pro</Badge>}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{stap.titel}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{stap.omschrijving}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stap.kleur}`}>
                    Ga naar <ChevronRight className="h-3 w-3" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Actuele signalen */}
        <Card data-testid="card-actuele-signalen">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-sm font-semibold">Actuele signalen</CardTitle>
              </div>
              <Link href="/intel">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2" data-testid="button-alle-signalen">
                  Alles zien <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recenteSignalen.length === 0 && (
              <p className="text-sm text-muted-foreground">Signalen worden geladen...</p>
            )}
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
          </CardContent>
        </Card>

        {/* Snelle acties */}
        <Card data-testid="card-snelle-acties">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <CardTitle className="text-sm font-semibold">Snelle acties</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {SNELLE_ACTIES.filter((a) => !a.proOnly || isPro).map((actie) => (
                <Link key={actie.url} href={actie.url} asChild>
                  <a
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover-elevate cursor-pointer"
                    data-testid={`actie-${actie.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${actie.bg} flex items-center justify-center`}>
                      <actie.icon className={`h-4 w-4 ${actie.kleur}`} />
                    </div>
                    <span className="text-[10px] font-medium text-center text-muted-foreground leading-tight">{actie.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Great Reset & Agenda 2030 */}
      <Card data-testid="card-globale-agenda">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base">Globale agenda's die jouw bedrijf raken</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                De Great Reset en Agenda 2030 zijn internationale beleidsprogramma's die via EU-regelgeving al doorwerken in de dagelijkse praktijk van lokale ondernemers.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* De Great Reset */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="font-semibold text-sm">De Great Reset (WEF, 2020)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Het Wereld Economisch Forum lanceerde De Great Reset als respons op de coronacrisis: een wereldwijd hervormingsplan om economieën "beter, veerkrachtiger en rechtvaardiger" te herbouwen. Concreet betekent dit een versnelde transitie naar duurzame en digitale bedrijfsmodellen.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Leaf, label: "Groene economie", tekst: "Strengere eisen aan energie, CO₂-uitstoot en circulaire inkoop. Lokale aanbestedingen vragen al om duurzaamheidsverklaringen.", kleur: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40" },
                { icon: Cpu, label: "Digitale transformatie", tekst: "Verplichte digitale processen: e-facturering (Peppol), digitale kassabonnen, UBO-registratie. Analoog werken wordt steeds lastiger.", kleur: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
                { icon: Users, label: "Stakeholderkapitalisme", tekst: "Bedrijven worden aangestuurd om niet alleen winst te maken, maar ook waarde te leveren voor werknemers, gemeenschap en milieu.", kleur: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
                { icon: Building2, label: "Lokale impact", tekst: "Gemeenten vertalen WEF-doelstellingen in lokale verordeningen: parkeerbeleid, reclameregels, terrassenvergunningen en duurzame bouwvereisten.", kleur: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
              ].map((punt) => (
                <div key={punt.label} className="flex gap-3 rounded-xl border p-3">
                  <div className={`w-8 h-8 rounded-lg ${punt.bg} flex items-center justify-center shrink-0`}>
                    <punt.icon className={`h-3.5 w-3.5 ${punt.kleur}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5">{punt.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{punt.tekst}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* Agenda 2030 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="font-semibold text-sm">Agenda 2030 — de 17 SDG's (VN, 2015)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              De VN-Agenda 2030 bevat 17 Duurzame Ontwikkelingsdoelen (SDG's) die landen — en daarmee bedrijven — moeten realiseren vóór 2030. Voor het mkb en zzp werken deze door via EU-richtlijnen, gemeentelijk subsidiebeleid en inkoopvereisten van grotere opdrachtgevers.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { nr: "SDG 8", label: "Waardig werk", tekst: "Eerlijke lonen, veilige werkplek, geen schijnzelfstandigheid. DBA-wetgeving handhaving en minimumuurloon voor zzp zijn hieruit voortgekomen.", kleur: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", icon: HandCoins },
                { nr: "SDG 11", label: "Duurzame steden", tekst: "Gemeenten sturen op leefbaarheid: venstertijden voor belevering, emissievrije zones, terrasbeleid en verkeersluwe winkelgebieden.", kleur: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/40", icon: Building2 },
                { nr: "SDG 12", label: "Verantwoorde consumptie", tekst: "Circulaire inkoop, productpaspoort (ESPR), verbod op wegwerpplastic. Toeleveranciers van grote bedrijven moeten al aantonen hoe duurzaam zij inkopen.", kleur: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", icon: Leaf },
                { nr: "SDG 13", label: "Klimaatactie", tekst: "CSRD-rapportage, energiebesparingsplicht boven €400k omzet, zakelijk reisbeleid. Kleine bedrijven worden via de keten meegetrokken.", kleur: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", icon: TrendingUp },
                { nr: "SDG 16", label: "Vrede & instituties", tekst: "UBO-register, Wwft-verplichtingen voor bepaalde beroepen (makelaars, taxateurs, handelaren). Meer transparantie-eisen bij overheidscontracten.", kleur: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40", icon: Scale },
                { nr: "SDG 17", label: "Samenwerking", tekst: "Coöperaties, brancheorganisaties en regionale samenwerkingsverbanden worden gestimuleerd. OpenRegio is een directe invulling van dit doel.", kleur: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", icon: Network },
              ].map((sdg) => (
                <div key={sdg.nr} className="flex gap-3 rounded-xl border p-3">
                  <div className={`w-8 h-8 rounded-lg ${sdg.bg} flex items-center justify-center shrink-0`}>
                    <sdg.icon className={`h-3.5 w-3.5 ${sdg.kleur}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold ${sdg.kleur}`}>{sdg.nr}</span>
                      <span className="text-xs font-semibold">{sdg.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sdg.tekst}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
              <CircleDot className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Wat verandert er voor jou?</span> Wet- en regelgeving die uit deze agenda's voortkomt, verschijnt als lokale signalen in <Link href="/intel" className="underline underline-offset-2 hover:text-foreground transition-colors">Regio Intel</Link> en als juridische duiding in de <Link href="/wetgeving" className="underline underline-offset-2 hover:text-foreground transition-colors">Wetgeving & Regelgeving</Link> sectie. OpenRegio houdt bij welke verplichtingen al gelden en wanneer nieuwe ingaan — zodat jij niet achter de feiten aan loopt.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Pro-upgrade CTA voor basis-leden */}
      {user?.plan === "basic" && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/40" data-testid="card-pro-cta">
          <CardContent className="p-5 flex items-center gap-4 flex-wrap justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Meer doen met Pro</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Krijg toegang tot RegioBot, de dossierbibliotheek en de Website Scan voor €24,95/mnd.
                </p>
              </div>
            </div>
            <Link href="/lidmaatschap?plan=pro">
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
