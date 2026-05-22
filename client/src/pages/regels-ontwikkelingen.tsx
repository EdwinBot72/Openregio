import { Link } from "wouter";
import {
  ArrowLeft,
  Smartphone,
  Bot,
  Lock,
  BarChart2,
  Coins,
  Building2,
  Leaf,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";

type Urgentie = "actie" | "6maanden" | "volgend-jaar" | "onderzoek";

interface Ontwikkeling {
  id: string;
  icon: React.ElementType;
  titel: string;
  watVerandert: string;
  wieRaaktDit: string;
  wanneer: string;
  urgentie: Urgentie;
  link?: string;
}

const URGENTIE_CONFIG: Record<
  Urgentie,
  { label: string; variant: "destructive" | "default" | "secondary" | "outline"; className: string }
> = {
  actie: {
    label: "Nu actie nodig",
    variant: "destructive",
    className: "",
  },
  "6maanden": {
    label: "Binnen 6 maanden",
    variant: "default",
    className: "bg-amber-500 hover:bg-amber-600 text-white border-0",
  },
  "volgend-jaar": {
    label: "Volgend jaar",
    variant: "secondary",
    className: "",
  },
  onderzoek: {
    label: "In onderzoek",
    variant: "outline",
    className: "",
  },
};

const ONTWIKKELINGEN: Ontwikkeling[] = [
  {
    id: "digital-wallet",
    icon: Smartphone,
    titel: "Digital Identity Wallet",
    watVerandert:
      "Europese digitale identiteit voor bedrijven en burgers — verplicht identificatiesysteem vanaf 2026.",
    wieRaaktDit: "Alle bedrijven die online diensten verlenen of klanten identificeren.",
    wanneer: "2026",
    urgentie: "6maanden",
  },
  {
    id: "ai-act",
    icon: Bot,
    titel: "EU AI Act",
    watVerandert:
      "Verplichte risicoanalyse en documentatie als je AI-systemen gebruikt in je bedrijfsvoering.",
    wieRaaktDit: "Bedrijven die AI-tools inzetten voor beslissingen of klantcontact.",
    wanneer: "Augustus 2026",
    urgentie: "6maanden",
  },
  {
    id: "avg",
    icon: Lock,
    titel: "AVG handhaving intensivering",
    watVerandert:
      "Autoriteit Persoonsgegevens vergroot handhavingscapaciteit. Hogere kans op boetes bij overtredingen.",
    wieRaaktDit: "Alle bedrijven die klant- of personeelsgegevens verwerken.",
    wanneer: "Lopend",
    urgentie: "actie",
  },
  {
    id: "csrd",
    icon: BarChart2,
    titel: "CSRD duurzaamheidsrapportage",
    watVerandert:
      "Verplichte rapportage over milieu, sociaal beleid en governance voor grotere bedrijven.",
    wieRaaktDit: "Bedrijven met meer dan 50 medewerkers of €10M omzet.",
    wanneer: "2025–2026 gefaseerd",
    urgentie: "6maanden",
  },
  {
    id: "subsidies",
    icon: Coins,
    titel: "Nieuwe subsidie-rondes ISDE & SLIM",
    watVerandert:
      "Extra investeringssubsidie voor verduurzaming en leertrajecten voor mkb'ers.",
    wieRaaktDit: "MKB-ondernemers die willen verduurzamen of personeel opleiden.",
    wanneer: "Q1 2025",
    urgentie: "actie",
  },
  {
    id: "gemeenteverordeningen",
    icon: Building2,
    titel: "Gemeentelijke verordeningen Omgevingswet",
    watVerandert:
      "Gemeenten herzien lokale regels in het kader van de Omgevingswet. Vergunningsregels kunnen veranderen.",
    wieRaaktDit: "Bedrijven met een omgevingsvergunning of bouwplannen.",
    wanneer: "2025–2026",
    urgentie: "volgend-jaar",
  },
  {
    id: "milieu",
    icon: Leaf,
    titel: "Verscherpte milieuregels stikstof",
    watVerandert:
      "Nieuwe drempelwaarden voor stikstofdeposities en verplichte compensatiemaatregelen.",
    wieRaaktDit: "Agrarische bedrijven, bouwbedrijven en industrie.",
    wanneer: "2025",
    urgentie: "actie",
  },
  {
    id: "belasting",
    icon: Receipt,
    titel: "Belastingwijzigingen 2025",
    watVerandert:
      "Aanpassing mkb-winstvrijstelling (12,7% → 12,03%), hogere WW-premies, nieuwe btw-regels diensten.",
    wieRaaktDit: "Alle zelfstandigen en mkb-ondernemers.",
    wanneer: "1 januari 2025",
    urgentie: "actie",
  },
];

const FILTER_OPTIONS: { label: string; value: Urgentie | "all" }[] = [
  { label: "Alle", value: "all" },
  { label: "Nu actie", value: "actie" },
  { label: "Binnen 6 maanden", value: "6maanden" },
  { label: "Volgend jaar", value: "volgend-jaar" },
  { label: "In onderzoek", value: "onderzoek" },
];

import { useState } from "react";

export default function RegelsOntwikkelingenPage() {
  usePageTitle("Wat komt eraan? – Grip op Regels");
  const [filter, setFilter] = useState<Urgentie | "all">("all");

  const filtered =
    filter === "all" ? ONTWIKKELINGEN : ONTWIKKELINGEN.filter((o) => o.urgentie === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-10 md:py-12">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" className="text-amber-100 hover:text-white mb-4 -ml-2" asChild>
            <Link href="/regels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Grip op Regels
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welke veranderingen komen eraan?
          </h1>
          <p className="text-amber-100 max-w-xl">
            Nieuwe wetten, subsidies, Digital ID, Europese regels en lokale
            ontwikkelingen die jouw bedrijf raken.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={filter === opt.value ? "default" : "outline"}
              onClick={() => setFilter(opt.value)}
              data-testid={`filter-urgentie-${opt.value}`}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* ── Ontwikkelingen grid ───────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => {
            const Icon = item.icon;
            const urg = URGENTIE_CONFIG[item.urgentie];
            return (
              <Card key={item.id} className="hover-elevate" data-testid={`card-ontwikkeling-${item.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{item.titel}</h3>
                        <Badge
                          variant={urg.variant}
                          className={`text-xs shrink-0 ${urg.className}`}
                        >
                          {urg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {item.watVerandert}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">Wie?</span>
                          <p className="text-foreground">{item.wieRaaktDit}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Wanneer?</span>
                          <p className="text-foreground">{item.wanneer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Geen items in deze categorie.</p>
          </div>
        )}

        {/* ── Bottom section ───────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border bg-muted/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm">Altijd op de hoogte blijven?</p>
            <p className="text-sm text-muted-foreground">
              Volg regel-updates via het dashboardsignalen-systeem.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href="/regels/updates" data-testid="button-naar-updates">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Bekijk updates
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/regels/check" data-testid="button-check-impact">
                Controleer impact
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
