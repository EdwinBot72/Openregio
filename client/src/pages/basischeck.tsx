import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, ArrowRight, ArrowLeft,
  ShoppingBag, Users, CalendarDays, HandshakeIcon,
  Megaphone, Landmark, HeartHandshake, MapPin,
} from "lucide-react";
import { Link } from "wouter";

interface Vraag {
  id: string;
  icon: typeof ShoppingBag;
  titel: string;
  toelichting: string;
  tip: string;
}

const VRAGEN: Vraag[] = [
  {
    id: "lokaal_inkopen",
    icon: ShoppingBag,
    titel: "Koop jij bewust in bij leveranciers in jouw regio?",
    toelichting: "Denk aan groente, verpakkingsmateriaal, drukwerk, schoonmaak — worden die lokaal ingekocht?",
    tip: "Zoek op OpenRegio actieve aanbieders in jouw gemeente en vraag een offerte. Lokaal inkopen versterkt de hele regionale economie.",
  },
  {
    id: "doorverwijzen",
    icon: Users,
    titel: "Verwijs je klanten actief door naar andere lokale ondernemers?",
    toelichting: "Als jij iets niet kunt leveren, stuur je dan klanten naar een collega in de buurt?",
    tip: "Maak een korte 'aanbevolen lokaal' lijst voor je klanten. Via RegioCrew vind je collega-ondernemers in jouw sector.",
  },
  {
    id: "netwerken",
    icon: CalendarDays,
    titel: "Neem je deel aan lokale evenementen, markten of ondernemersnetwerken?",
    toelichting: "Denk aan een lokale ondernemersvereniging, weekmarkt, beurzen of gemeente-evenementen.",
    tip: "Bekijk de Gemeente-updates sectie voor aankomende evenementen en aanbestedingen in jouw gemeente.",
  },
  {
    id: "kennis",
    icon: MapPin,
    titel: "Ken je de meeste ondernemers in jouw directe omgeving persoonlijk?",
    toelichting: "Weet je wie er op jouw straat of in jouw wijk ondernemen en wat zij doen?",
    tip: "Maak een rondje in je buurt en stel jezelf voor. Of plaats een bericht op de Lokale Marktplaats zodat collega's jou vinden.",
  },
  {
    id: "marketing",
    icon: Megaphone,
    titel: "Promoot je jouw bedrijf actief via lokale media of lokale online groepen?",
    toelichting: "Denk aan lokale krant, buurtapp, Facebook-groepen van je gemeente, of een sticker op je raam.",
    tip: "Meld je aan bij lokale Facebook-groepen en deel je aanbod. Gebruik het Google Bedrijfsprofiel voor zichtbaarheid in de buurt.",
  },
  {
    id: "samenwerken",
    icon: HandshakeIcon,
    titel: "Heb je actieve samenwerkingen met andere lokale bedrijven?",
    toelichting: "Lever je samen met anderen, of heb je een formele of informele samenwerking?",
    tip: "Gebruik de Lokale Marktplaats om een 'ik zoek samenwerking' oproep te plaatsen. Kleine samenwerkingen beginnen vaak simpel.",
  },
  {
    id: "lokale_diensten",
    icon: Landmark,
    titel: "Maak je gebruik van lokale banken, accountants of adviseurs?",
    toelichting: "Zijn jouw financiële en zakelijke dienstverleners ook lokaal actief?",
    tip: "Raiffeisen, regionale Rabobank-kantoren en lokale boekhoudkantoren investeren hun winst terug in de regio. Dat maakt verschil.",
  },
  {
    id: "bijdragen",
    icon: HeartHandshake,
    titel: "Draag je bij aan lokale initiatieven, sponsoring of community-activiteiten?",
    toelichting: "Denk aan een plaatselijk sportteam sponsoren, een buurtfeest ondersteunen of lokale schoolactiviteiten.",
    tip: "Sponsoring hoeft niet duur te zijn — een product, een dienst, of gewoon aanwezig zijn bij lokale activiteiten telt ook.",
  },
];

const SCORE_LABELS = [
  { min: 0, max: 2, label: "Nog veel te winnen", kleur: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
  { min: 3, max: 5, label: "Op weg lokaal", kleur: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { min: 6, max: 7, label: "Sterk lokaal", kleur: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { min: 8, max: 8, label: "Volledig lokaal!", kleur: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40" },
];

export default function BasischeckPage() {
  usePageTitle("Lokaal Ondernemen Check");
  const [started, setStarted] = useState(false);
  const [huidigVraag, setHuidigVraag] = useState(0);
  const [antwoorden, setAntwoorden] = useState<Record<string, boolean>>({});
  const [klaar, setKlaar] = useState(false);

  const beantwoord = (ja: boolean) => {
    const vraag = VRAGEN[huidigVraag];
    setAntwoorden((prev) => ({ ...prev, [vraag.id]: ja }));
    if (huidigVraag < VRAGEN.length - 1) {
      setHuidigVraag((prev) => prev + 1);
    } else {
      setKlaar(true);
    }
  };

  const terug = () => {
    if (huidigVraag > 0) setHuidigVraag((prev) => prev - 1);
  };

  const opnieuw = () => {
    setStarted(false);
    setHuidigVraag(0);
    setAntwoorden({});
    setKlaar(false);
  };

  const score = Object.values(antwoorden).filter(Boolean).length;
  const scoreLabel = SCORE_LABELS.find((s) => score >= s.min && score <= s.max) ?? SCORE_LABELS[0];
  const verbetertips = VRAGEN.filter((v) => antwoorden[v.id] === false);
  const voortgang = ((huidigVraag + (klaar ? 1 : 0)) / VRAGEN.length) * 100;

  if (!started) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center mx-auto">
            <MapPin className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Lokaal Ondernemen Check</h1>
          <p className="text-muted-foreground leading-relaxed">
            Hoe lokaal is jouw bedrijf eigenlijk? Met 8 vragen meten we je lokale score en geven we concrete tips om jouw bijdrage aan de regionale economie te vergroten.
          </p>
        </div>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: ShoppingBag, text: "Lokaal inkopen" },
                { icon: Users, text: "Doorverwijzen" },
                { icon: CalendarDays, text: "Netwerken" },
                { icon: HandshakeIcon, text: "Samenwerken" },
                { icon: Megaphone, text: "Lokale marketing" },
                { icon: HeartHandshake, text: "Bijdragen" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStarted(true)} data-testid="button-start-check">
              Start de check <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (klaar) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-3">
          <div className={`w-14 h-14 rounded-2xl ${scoreLabel.bg} flex items-center justify-center mx-auto`}>
            <MapPin className={`h-7 w-7 ${scoreLabel.kleur}`} />
          </div>
          <h1 className="text-2xl font-bold">Jouw lokale score</h1>
          <div className={`text-4xl font-bold ${scoreLabel.kleur}`}>{score} / {VRAGEN.length}</div>
          <Badge className={`${scoreLabel.bg} ${scoreLabel.kleur} border-0`} data-testid="badge-score-label">
            {scoreLabel.label}
          </Badge>
        </div>

        {verbetertips.length > 0 && (
          <Card data-testid="section-verbetertips">
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-sm">Verbeterpunten voor jou</h2>
              <div className="space-y-4">
                {verbetertips.map((v) => (
                  <div key={v.id} className="flex gap-3 border-b last:border-0 pb-4 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <v.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">{v.titel}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {score === VRAGEN.length && (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40">
            <CardContent className="p-5 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
              <p className="font-semibold text-sm">Je scoort volledig lokaal!</p>
              <p className="text-xs text-muted-foreground">Je bent een voorbeeld voor andere ondernemers in jouw regio. Deel jouw aanpak via de Community.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={opnieuw} data-testid="button-opnieuw">
            Opnieuw doen
          </Button>
          <Link href="/lokaal-marktplaats" asChild>
            <Button className="flex-1" data-testid="button-naar-marktplaats">
              Lokale Marktplaats <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const vraag = VRAGEN[huidigVraag];

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Vraag {huidigVraag + 1} van {VRAGEN.length}</span>
          <span>{Math.round(voortgang)}%</span>
        </div>
        <Progress value={voortgang} className="h-1.5" data-testid="progress-vraag" />
      </div>

      <Card data-testid={`vraag-${vraag.id}`}>
        <CardContent className="p-6 space-y-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
            <vraag.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-base leading-snug mb-2">{vraag.titel}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{vraag.toelichting}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-12 text-base border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
              onClick={() => beantwoord(false)}
              data-testid="button-nee"
            >
              <XCircle className="mr-2 h-4 w-4" /> Nee
            </Button>
            <Button
              className="h-12 text-base bg-green-600 hover:bg-green-700"
              onClick={() => beantwoord(true)}
              data-testid="button-ja"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Ja
            </Button>
          </div>
        </CardContent>
      </Card>

      {huidigVraag > 0 && (
        <Button variant="ghost" size="sm" onClick={terug} data-testid="button-terug">
          <ArrowLeft className="mr-2 h-4 w-4" /> Vorige vraag
        </Button>
      )}
    </div>
  );
}
