import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, ChevronRight,
  ClipboardList, Globe, Handshake, Euro, Landmark,
  RotateCcw, Trophy, AlertTriangle, Info, Minus,
  ShoppingBag, Users, Megaphone, FileSearch, ShieldCheck,
  TrendingUp, Monitor, ScanText, Bot, MapPin,
} from "lucide-react";

// ─── Design tokens ──────────────────────────────────────────────────────────

const TEAL = "#0f6a67";
const CARD = "rounded-[28px] border border-[#e4dfd2] dark:border-border bg-white dark:bg-card shadow-sm";
const INNER = "rounded-2xl border border-[#ede8df] dark:border-border bg-[#fafaf8] dark:bg-background";

// ─── Types ──────────────────────────────────────────────────────────────────

type Antwoord = "ja" | "deels" | "nee";

interface Vraag {
  id: string;
  titel: string;
  toelichting: string;
  tip: string;
  href?: string;
  hrefLabel?: string;
}

interface Categorie {
  id: string;
  titel: string;
  subtitel: string;
  icon: typeof Globe;
  kleur: string;
  bg: string;
  vragen: Vraag[];
}

// ─── Content ─────────────────────────────────────────────────────────────────

const CATEGORIEEN: Categorie[] = [
  {
    id: "regelgeving",
    titel: "Regelgeving & Vergunningen",
    subtitel: "Ben je formeel op orde?",
    icon: ClipboardList,
    kleur: "text-[#0b2240] dark:text-[#0b2240]",
    bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/10",
    vragen: [
      {
        id: "kvk",
        titel: "Is je KvK-inschrijving volledig actueel?",
        toelichting: "Adres, activiteiten, rechtsvorm — klopt dit allemaal nog met je huidige situatie?",
        tip: "Log in op kvk.nl en controleer je gegevens. Aanpassen is kosteloos en wettelijk verplicht.",
        href: "/intel",
        hrefLabel: "Bekijk regelgeving-updates",
      },
      {
        id: "vergunningen",
        titel: "Heb je alle benodigde gemeentelijke vergunningen?",
        toelichting: "Denk aan een omgevingsvergunning, exploitatievergunning, terrasvergunning of evenementenvergunning.",
        tip: "Vraag bij het Ondernemersloket van je gemeente naar een vergunningsscan. Ontbrekende vergunningen kunnen tot boetes leiden.",
        href: "/tools/brief-analyse",
        hrefLabel: "Check een brief van de gemeente",
      },
      {
        id: "avg",
        titel: "Heb je een actueel privacybeleid (AVG) voor je klanten?",
        toelichting: "Verwerk je klantgegevens, e-mailadressen of betaalgegevens? Dan ben je verplicht een privacyverklaring te hebben.",
        tip: "De AP (Autoriteit Persoonsgegevens) heeft kant-en-klare modellen. Voeg een privacy-link toe aan je website en kassabon.",
        href: "/tools/brief-analyse",
        hrefLabel: "Laat een AVG-brief checken",
      },
      {
        id: "boekhouding",
        titel: "Houd je je boekhouding bij en bewaar je je administratie 7 jaar?",
        toelichting: "De Belastingdienst verplicht je om administratie minimaal 7 jaar te bewaren.",
        tip: "Gebruik boekhoudpaketten zoals Moneybird of Exact. Lokale accountants kunnen ook zorgen voor een jaarlijkse controle.",
      },
    ],
  },
  {
    id: "online",
    titel: "Online zichtbaarheid",
    subtitel: "Vinden klanten jou makkelijk?",
    icon: Globe,
    kleur: "text-[#0b2240] dark:text-[#0b2240]",
    bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/10",
    vragen: [
      {
        id: "website",
        titel: "Heb je een mobielvriendelijke website met up-to-date contactgegevens?",
        toelichting: "Meer dan 60% van lokale zoekopdrachten komt van mobiele telefoons. Is jouw website hierop ingericht?",
        tip: "Test je website op Google's PageSpeed Insights. Controleer of openingstijden, telefoonnummer en adres kloppen.",
        href: "/tools/website-scan",
        hrefLabel: "Doe de website-check",
      },
      {
        id: "google",
        titel: "Heb je een volledig ingevuld Google Bedrijfsprofiel?",
        toelichting: "Google Mijn Bedrijf zorgt dat je zichtbaar bent in Google Maps en zoekresultaten voor mensen in de buurt.",
        tip: "Ga naar business.google.com. Voeg foto's, openingstijden en een korte beschrijving toe. Dit verhoogt je bereik direct.",
      },
      {
        id: "reviews",
        titel: "Vraag je actief om beoordelingen van klanten?",
        toelichting: "Bedrijven met reviews scoren beter in lokale Google-zoekresultaten en wekken meer vertrouwen.",
        tip: "Stuur tevreden klanten een directe link naar je Google-recensiepagina. Reageer altijd op reviews, ook negatieve.",
      },
      {
        id: "social",
        titel: "Ben je actief op social media relevant voor jouw sector?",
        toelichting: "Instagram voor horeca en retail, LinkedIn voor B2B en techniek, Facebook voor lokale gemeenschappen.",
        tip: "Kies één platform en post minimaal één keer per week. Consistentie werkt beter dan sporadische uitbarstingen.",
      },
    ],
  },
  {
    id: "lokaal",
    titel: "Lokale verankering",
    subtitel: "Hoe verbonden ben je met je regio?",
    icon: MapPin,
    kleur: "text-[#f28a1a] dark:text-[#f28a1a]",
    bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/10",
    vragen: [
      {
        id: "inkopen",
        titel: "Koop je bewust in bij leveranciers uit jouw regio?",
        toelichting: "Van grondstoffen tot drukwerk, schoonmaak tot IT-diensten — hoe lokaal is jouw inkoopketen?",
        tip: "Gebruik de OpenRegio-kaart om lokale leveranciers te vinden. Lokaal inkopen houdt geld in de regio.",
        href: "/kansen-in-de-buurt",
        hrefLabel: "Bekijk lokale kansen",
      },
      {
        id: "netwerk",
        titel: "Ben je lid van een lokale ondernemersvereniging of BIZ?",
        toelichting: "Bedrijveninvesteringszones (BIZ) en ondernemersverenigingen versterken je positie en geven je invloed op lokaal beleid.",
        tip: "Informeer bij je gemeente naar actieve ondernemersverenigingen of BIZ in jouw wijk of gemeente.",
      },
      {
        id: "samenwerken",
        titel: "Heb je actieve samenwerkingen met andere lokale bedrijven?",
        toelichting: "Verwijs je klanten door, deel kosten, of lever je samen een dienst met een collega-ondernemer?",
        tip: "Maak een 'aanbevolen lokaal'-kaart voor je klanten. Kleine samenwerkingen beginnen met een gesprek.",
        href: "/kansen-in-de-buurt",
        hrefLabel: "Zoek lokale partners",
      },
      {
        id: "marketing_lokaal",
        titel: "Promoot je je bedrijf actief via lokale kanalen?",
        toelichting: "Lokale krant, buurtapp, gemeentelijke nieuwsbrief, lokale Facebook-groepen of een sticker in je etalage.",
        tip: "Vraag of je in de gemeentelijke ondernemersnewsletter kunt worden vermeld. Dit bereikt honderden lokale kopers.",
      },
    ],
  },
  {
    id: "subsidies",
    titel: "Kansen & weerbaarheid",
    subtitel: "Pak je de kansen die er echt zijn?",
    icon: Euro,
    kleur: "text-[#f28a1a] dark:text-[#f28a1a]",
    bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/10",
    vragen: [
      {
        id: "gemeentelijk_subsidie",
        titel: "Weet je welke regels en verplichtingen jouw gemeente voor ondernemers hanteert?",
        toelichting: "Denk aan vergunningen, lokale verordeningen en meldplichten die jouw bedrijf raken.",
        tip: "Kijk op de website van je gemeente onder 'ondernemers', of gebruik OpenRegio om de regels helder te krijgen.",
        href: "/regels/updates",
        hrefLabel: "Bekijk regels in je regio",
      },
      {
        id: "aanbestedingen",
        titel: "Monitor je aanbestedingen van gemeenten en provincies?",
        toelichting: "Overheidsaanbestedingen zijn openbaar. Bedrijven tot €150.000 omzet kunnen al meedingen bij meervoudig onderhands.",
        tip: "Maak een account op TenderNed of gebruik OpenRegio om regionale aanbestedingen te volgen.",
        href: "/kansen/aanbestedingen",
        hrefLabel: "Bekijk aanbestedingen",
      },
      {
        id: "verduurzaming",
        titel: "Volg je de ontwikkelingen in jouw sector die kansen of risico's brengen?",
        toelichting: "Marktveranderingen, nieuwe regels en lokale ontwikkelingen kunnen jouw bedrijf raken — vaak eerder dan je denkt.",
        tip: "Houd sector- en regiosignalen bij via OpenRegio, zodat je niet verrast wordt maar kunt kiezen.",
        href: "/intel",
        hrefLabel: "Bekijk sector-updates",
      },
      {
        id: "ondernemersloket",
        titel: "Heb je contact gehad met het Ondernemersloket van je gemeente?",
        toelichting: "Gemeenten hebben speciale loketten voor ondernemers met informatie over vergunningen en regelgeving.",
        tip: "Vraag een gesprek aan bij het Ondernemersloket. Zij kennen lokale regelingen die je online niet makkelijk vindt.",
      },
    ],
  },
  {
    id: "overheid",
    titel: "Overheid & Transparantie",
    subtitel: "Ken je je rechten bij de overheid?",
    icon: Landmark,
    kleur: "text-[#0b2240] dark:text-[#0b2240]",
    bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/10",
    vragen: [
      {
        id: "brieven",
        titel: "Begrijp je officiële brieven van de gemeente of overheid altijd goed?",
        toelichting: "Overheidsbesluiten, bezwaarschriften, dwangsommen en vergunningsweigeringen staan vol juridisch taalgebruik.",
        tip: "Upload overheidspost in de OpenRegio-briefchecker. Onze AI legt uit wat er staat en welke acties je kunt nemen.",
        href: "/tools/brief-analyse",
        hrefLabel: "Brief laten checken",
      },
      {
        id: "woo",
        titel: "Weet je dat je als ondernemer informatie kunt opvragen bij de overheid (WOO)?",
        toelichting: "De Wet open overheid (WOO) geeft iedereen het recht om overheidsbesluiten, vergaderingen en documenten op te vragen.",
        tip: "Via OpenRegio kun je als Pro-lid professionele WOO-verzoeken opstellen en indienen bij gemeenten.",
        href: "/woo-bibliotheek",
        hrefLabel: "WOO-documenten bekijken",
      },
      {
        id: "bezwaar",
        titel: "Weet je hoe je bezwaar kunt maken tegen een besluit van de overheid?",
        toelichting: "Bij een geweigerde vergunning of een boete heb je recht op bezwaar. Je hebt hiervoor 6 weken de tijd.",
        tip: "Maak bezwaar altijd schriftelijk en op tijd. Een juridisch advies van de KvK of VNO-NCW is vaak kosteloos voor leden.",
        href: "/tools/brief-analyse",
        hrefLabel: "Check een overheidsbesluit",
      },
      {
        id: "contact_gemeente",
        titel: "Heb je een vast contactpersoon bij je gemeente voor ondernemerszaken?",
        toelichting: "Grote gemeenten hebben een accountmanager bedrijven. Een persoonlijk contact maakt vergunningstrajecten sneller.",
        tip: "Vraag bij het Ondernemersloket naar de accountmanager Bedrijven voor jouw buurt. Bouw die relatie proactief op.",
      },
    ],
  },
];

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreVanAntwoorden(antwoorden: Record<string, Antwoord>, catId: string): number {
  const cat = CATEGORIEEN.find((c) => c.id === catId);
  if (!cat) return 0;
  return cat.vragen.reduce((acc, v) => {
    const a = antwoorden[v.id];
    if (a === "ja") return acc + 2;
    if (a === "deels") return acc + 1;
    return acc;
  }, 0);
}

function maxScore(catId: string): number {
  const cat = CATEGORIEEN.find((c) => c.id === catId);
  return (cat?.vragen.length ?? 0) * 2;
}

function totaalScore(antwoorden: Record<string, Antwoord>): number {
  return CATEGORIEEN.reduce((acc, c) => acc + scoreVanAntwoorden(antwoorden, c.id), 0);
}

function maxTotaal(): number {
  return CATEGORIEEN.reduce((acc, c) => acc + maxScore(c.id), 0);
}

function scoreLabel(pct: number): { label: string; kleur: string; bg: string } {
  if (pct >= 85) return { label: "Uitstekend", kleur: "text-[#f28a1a] dark:text-[#f28a1a]", bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/10" };
  if (pct >= 65) return { label: "Goed op weg", kleur: "text-[#0f6a67]", bg: "bg-[#0f6a67]/8 dark:bg-[#0f6a67]/15" };
  if (pct >= 40) return { label: "Nog te winnen", kleur: "text-[#f28a1a] dark:text-[#f28a1a]", bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/10" };
  return { label: "Actie vereist", kleur: "text-[#0b2240] dark:text-[#0b2240]", bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/10" };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LokaleBasischeckPage() {
  usePageTitle("Lokale Basischeck");
  const [fase, setFase] = useState<"intro" | "vraag" | "resultaat">("intro");
  const [catIdx, setCatIdx] = useState(0);
  const [vraagIdx, setVraagIdx] = useState(0);
  const [antwoorden, setAntwoorden] = useState<Record<string, Antwoord>>({});

  const totaalVragen = CATEGORIEEN.reduce((a, c) => a + c.vragen.length, 0);
  const beantwoord = Object.keys(antwoorden).length;
  const voortgang = (beantwoord / totaalVragen) * 100;

  const huidigeCat = CATEGORIEEN[catIdx];
  const huidigeVraag = huidigeCat?.vragen[vraagIdx];

  const geefAntwoord = (antwoord: Antwoord) => {
    const nieuw = { ...antwoorden, [huidigeVraag.id]: antwoord };
    setAntwoorden(nieuw);

    if (vraagIdx < huidigeCat.vragen.length - 1) {
      setVraagIdx(vraagIdx + 1);
    } else if (catIdx < CATEGORIEEN.length - 1) {
      setCatIdx(catIdx + 1);
      setVraagIdx(0);
    } else {
      setFase("resultaat");
    }
  };

  const gaNaar = (cIdx: number, vIdx: number) => {
    setCatIdx(cIdx);
    setVraagIdx(vIdx);
  };

  const opnieuw = () => {
    setFase("intro");
    setCatIdx(0);
    setVraagIdx(0);
    setAntwoorden({});
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div
          className="rounded-[28px] p-8 text-white"
          style={{ background: `linear-gradient(135deg, #0c4240 0%, ${TEAL} 55%, #0d8079 100%)` }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Uitgebreide Lokale Basischeck</h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-lg">
            In 5 thema's en {totaalVragen} gerichte vragen breng je in kaart hoe je bedrijf ervoor staat — op regelgeving, online zichtbaarheid, lokale verankering, weerbaarheid en omgang met de overheid.
          </p>
          <div className="flex items-center gap-4 mt-5 flex-wrap">
            <span className="text-xs text-white/60">{totaalVragen} vragen</span>
            <span className="text-xs text-white/60">~10 minuten</span>
            <span className="text-xs text-white/60">Inbegrepen voor leden</span>
          </div>
        </div>

        {/* Categorieën overzicht */}
        <div className={`${CARD} p-6`}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Wat we meten</h2>
          <div className="space-y-3">
            {CATEGORIEEN.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className={`${INNER} px-4 py-3.5 flex items-center gap-4`}>
                  <div className={`w-9 h-9 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${cat.kleur}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{cat.titel}</p>
                    <p className="text-xs text-muted-foreground">{cat.subtitel}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{cat.vragen.length} vragen</span>
                </div>
              );
            })}
          </div>
          <Button
            className="w-full mt-5 h-11 text-sm font-semibold"
            style={{ backgroundColor: TEAL }}
            onClick={() => setFase("vraag")}
            data-testid="button-start-basischeck"
          >
            Start de Basischeck <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Vragen ─────────────────────────────────────────────────────────────────
  if (fase === "vraag") {
    const CatIcon = huidigeCat.icon;

    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-10">
        {/* Voortgang */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-lg ${huidigeCat.bg} flex items-center justify-center`}>
                <CatIcon className={`h-3 w-3 ${huidigeCat.kleur}`} />
              </div>
              <span className="font-medium text-foreground">{huidigeCat.titel}</span>
            </div>
            <span>{beantwoord} / {totaalVragen}</span>
          </div>
          <Progress value={voortgang} className="h-1.5" data-testid="progress-basischeck" />
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {CATEGORIEEN.map((cat, cIdx) => (
              cat.vragen.map((v, vIdx) => {
                const gedaan = v.id in antwoorden;
                const huidig = cat.id === huidigeCat.id && vIdx === vraagIdx;
                return (
                  <div
                    key={v.id}
                    className={`h-1.5 w-5 rounded-full transition-all ${
                      huidig
                        ? "bg-[#0f6a67]"
                        : gedaan
                        ? antwoorden[v.id] === "ja"
                          ? "bg-[#f28a1a]"
                          : antwoorden[v.id] === "deels"
                          ? "bg-[#f28a1a]"
                          : "bg-[#0b2240]"
                        : "bg-[#ede8df] dark:bg-muted"
                    }`}
                  />
                );
              })
            ))}
          </div>
        </div>

        {/* Vraagkaart */}
        <div className={`${CARD} p-7`} data-testid={`vraag-${huidigeVraag.id}`}>
          <div className={`w-12 h-12 rounded-2xl ${huidigeCat.bg} flex items-center justify-center mb-5`}>
            <CatIcon className={`h-6 w-6 ${huidigeCat.kleur}`} />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {huidigeCat.titel} · {vraagIdx + 1} van {huidigeCat.vragen.length}
          </p>
          <h2 className="text-lg font-bold text-foreground leading-snug mb-3">
            {huidigeVraag.titel}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7">
            {huidigeVraag.toelichting}
          </p>

          {/* Antwoord knoppen */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => geefAntwoord("ja")}
              className={`${INNER} flex flex-col items-center gap-2 py-4 px-3 hover-elevate cursor-pointer transition-all`}
              data-testid="button-ja"
            >
              <CheckCircle2 className="h-6 w-6 text-[#f28a1a]" />
              <span className="text-sm font-semibold text-foreground">Ja</span>
            </button>
            <button
              onClick={() => geefAntwoord("deels")}
              className={`${INNER} flex flex-col items-center gap-2 py-4 px-3 hover-elevate cursor-pointer transition-all`}
              data-testid="button-deels"
            >
              <Minus className="h-6 w-6 text-[#f28a1a]" />
              <span className="text-sm font-semibold text-foreground">Deels</span>
            </button>
            <button
              onClick={() => geefAntwoord("nee")}
              className={`${INNER} flex flex-col items-center gap-2 py-4 px-3 hover-elevate cursor-pointer transition-all`}
              data-testid="button-nee"
            >
              <XCircle className="h-6 w-6 text-[#0b2240]" />
              <span className="text-sm font-semibold text-foreground">Nee</span>
            </button>
          </div>
        </div>

        {/* Terug knop */}
        {(catIdx > 0 || vraagIdx > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (vraagIdx > 0) {
                gaNaar(catIdx, vraagIdx - 1);
              } else {
                const prevCat = CATEGORIEEN[catIdx - 1];
                gaNaar(catIdx - 1, prevCat.vragen.length - 1);
              }
            }}
            data-testid="button-terug"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Vorige vraag
          </Button>
        )}
      </div>
    );
  }

  // ── Resultaat ──────────────────────────────────────────────────────────────
  const totaal = totaalScore(antwoorden);
  const max = maxTotaal();
  const pct = Math.round((totaal / max) * 100);
  const label = scoreLabel(pct);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Score-hero */}
      <div
        className="rounded-[28px] p-8 text-white"
        style={{ background: `linear-gradient(135deg, #0c4240 0%, ${TEAL} 55%, #0d8079 100%)` }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-white/70 mb-1">Jouw totaalscore</p>
            <div className="text-5xl font-black text-white mb-1">{pct}<span className="text-2xl font-bold text-white/60">%</span></div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${label.bg} ${label.kleur}`} data-testid="badge-totaal-label">
              {label.label}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Trophy className="h-7 w-7 text-white" />
          </div>
        </div>
        <p className="text-white/65 text-sm mt-4 leading-relaxed">
          {pct >= 85
            ? "Je bedrijf staat er uitstekend voor. Blijf je regelgeving en kansen monitoren via OpenRegio."
            : pct >= 65
            ? "Je bent goed op weg. De verbeterpunten hieronder helpen je de laatste stappen te zetten."
            : pct >= 40
            ? "Er zijn duidelijke kansen om je positie te versterken. Pak de verbeterpunten één voor één aan."
            : "Er zijn meerdere aandachtspunten. Bekijk de tips per categorie en begin met de hoogste prioriteit."}
        </p>
      </div>

      {/* Per-categorie scores */}
      <div className={`${CARD} p-6`}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Score per thema</h2>
        <div className="space-y-4">
          {CATEGORIEEN.map((cat) => {
            const catScore = scoreVanAntwoorden(antwoorden, cat.id);
            const catMax = maxScore(cat.id);
            const catPct = Math.round((catScore / catMax) * 100);
            const catLabel = scoreLabel(catPct);
            const Icon = cat.icon;

            return (
              <div key={cat.id} data-testid={`result-cat-${cat.id}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${cat.kleur}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{cat.titel}</p>
                      <span className={`text-xs font-bold shrink-0 ${catLabel.kleur}`}>{catPct}%</span>
                    </div>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="h-2 w-full rounded-full bg-[#ede8df] dark:bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        catPct >= 85 ? "bg-[#f28a1a]" : catPct >= 65 ? "bg-[#0f6a67]" : catPct >= 40 ? "bg-[#f28a1a]" : "bg-[#0b2240]"
                      }`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verbeterpunten per categorie */}
      {CATEGORIEEN.map((cat) => {
        const verbeter = cat.vragen.filter((v) => antwoorden[v.id] === "nee" || antwoorden[v.id] === "deels");
        if (verbeter.length === 0) return null;
        const Icon = cat.icon;

        return (
          <div key={cat.id} className={`${CARD} p-6`} data-testid={`verbeter-${cat.id}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${cat.kleur}`} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{cat.titel}</h2>
                <p className="text-xs text-muted-foreground">{verbeter.length} verbeterpunt{verbeter.length !== 1 ? "en" : ""}</p>
              </div>
            </div>
            <div className="h-px w-full bg-[#ede8df] dark:bg-border mb-5" />
            <div className="space-y-4">
              {verbeter.map((v) => {
                const isDeel = antwoorden[v.id] === "deels";
                return (
                  <div key={v.id} className={`${INNER} p-4`} data-testid={`tip-${v.id}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isDeel ? "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/10" : "bg-[#0b2240]/10 dark:bg-[#0b2240]/10"}`}>
                        {isDeel
                          ? <Minus className="h-3.5 w-3.5 text-[#f28a1a]" />
                          : <XCircle className="h-3.5 w-3.5 text-[#0b2240]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground leading-snug mb-1.5">{v.titel}</p>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: `${TEAL}20` }}>
                            <Info className="h-2.5 w-2.5" style={{ color: TEAL }} />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{v.tip}</p>
                        </div>
                        {v.href && v.hrefLabel && (
                          <Link href={v.href}>
                            <span
                              className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold"
                              style={{ color: TEAL }}
                              data-testid={`link-tip-${v.id}`}
                            >
                              {v.hrefLabel} <ChevronRight className="h-3 w-3" />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Volledig groen */}
      {pct === 100 && (
        <div className="rounded-[28px] border border-[#f28a1a]/20 dark:border-[#f28a1a] bg-[#f28a1a]/10 dark:bg-[#f28a1a]/20 p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[#f28a1a] mx-auto" />
          <p className="font-bold text-foreground">Je scoort op alle punten volledig!</p>
          <p className="text-sm text-muted-foreground">Je bedrijf is een voorbeeld in de regio. Deel jouw aanpak met collega-ondernemers.</p>
        </div>
      )}

      {/* Acties */}
      <div className={`${CARD} p-5 flex gap-3 flex-wrap`}>
        <Button
          variant="outline"
          className="flex-1"
          onClick={opnieuw}
          data-testid="button-opnieuw"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Opnieuw doen
        </Button>
        <Link href="/intel" className="flex-1">
          <Button className="w-full" style={{ backgroundColor: TEAL }} data-testid="button-naar-intel">
            Regio-updates bekijken <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
