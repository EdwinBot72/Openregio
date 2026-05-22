import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronRight,
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  HardHat,
  Sprout,
  Heart,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  ClipboardList,
  FileCheck,
  Gavel,
  Building2,
  Eye,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";

interface Sector {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  borderColor: string;
  regels: string[];
  vergunningen: string[];
  aankomend: string[];
  wijzigingen: number;
  impact: {
    verandert: string;
    doen: string;
    kost: string;
    kansen: string;
    risicos: string;
  };
}

const SECTOREN: Sector[] = [
  {
    id: "horeca",
    label: "Horeca",
    icon: UtensilsCrossed,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    regels: ["Exploitatievergunning", "Terrasregels gemeente", "Alcoholwet (DHW)", "Brandveiligheid", "Afvalverwerking"],
    vergunningen: ["Drank- en horecavergunning", "Omgevingsvergunning terrassen", "Muziekvergunning"],
    aankomend: ["Nieuwe terrasregels 2025", "Aanpassing Alcoholwet"],
    wijzigingen: 2,
    impact: {
      verandert: "Terrassenverordening wordt aangescherpt, nieuwe aanvraagprocedure verplicht",
      doen: "Controleer bestaande terrasvergunning vóór 1 januari",
      kost: "Eenmalige hervergunning ca. €150, mogelijk aanpassingskosten",
      kansen: "Uitbreiding terrasoppervlak mogelijk met nieuwe regels",
      risicos: "Boete bij exploitatie zonder aangepaste vergunning",
    },
  },
  {
    id: "detailhandel",
    label: "Detailhandel",
    icon: ShoppingBag,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    regels: ["Winkeltijdenwet", "Consumentenwetgeving", "Kassabonplicht", "Retourbeleid", "Productaansprakelijkheid"],
    vergunningen: ["Vestigingsvergunning", "Evenementenvergunning"],
    aankomend: ["EU Omnibus richtlijn", "Nieuwe etiketteringsregels"],
    wijzigingen: 3,
    impact: {
      verandert: "EU Omnibus verplicht transparantere prijsinformatie bij kortingsacties",
      doen: "Pas prijslabels en webshop aan vóór implementatiedatum",
      kost: "Softwarewijzigingen kassasysteem geschat €200–500",
      kansen: "Betere klantcommunicatie leidt tot hogere conversie",
      risicos: "ACM-boetes bij onjuiste prijsaanduiding tot €10.000",
    },
  },
  {
    id: "techniek",
    label: "Techniek",
    icon: Wrench,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-700",
    regels: ["NEN-normen installaties", "VCA certificering", "Arbowetgeving", "Milieumeldingen", "Gevaarlijke stoffen"],
    vergunningen: ["Omgevingsvergunning", "Milieuvergunning", "VCA diploma's"],
    aankomend: ["Nieuwe NEN 1010 norm", "CSRD rapportage"],
    wijzigingen: 1,
    impact: {
      verandert: "NEN 1010 norm voor laagspanningsinstallaties wordt herzien",
      doen: "Laat installaties controleren door gecertificeerd installateur",
      kost: "Certificeringsaudit ca. €400–800 per locatie",
      kansen: "CSRD-rapportage als onderscheidend voordeel bij aanbestedingen",
      risicos: "Aansprakelijkheid bij niet-conforme installaties",
    },
  },
  {
    id: "bouw",
    label: "Bouw",
    icon: HardHat,
    color: "text-yellow-600 dark:text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    regels: ["Bouwbesluit 2012", "Omgevingsvergunning", "Arbeidsomstandigheden", "Stikstof regelgeving", "Asbestwetgeving"],
    vergunningen: ["Omgevingsvergunning bouwen", "G-rekening", "VCA certificaat"],
    aankomend: ["Omgevingswet updates", "Energieprestatie-eisen"],
    wijzigingen: 4,
    impact: {
      verandert: "Strengere energieprestatie-eisen (BENG) voor nieuwbouw en renovatie",
      doen: "Pas offertes en technische tekeningen aan op nieuwe BENG-normen",
      kost: "Extra ontwerpkosten ca. 3–5% hogere bouwkosten",
      kansen: "Groeiende vraag naar energieneutrale verbouw",
      risicos: "Vergunning wordt geweigerd bij niet-voldoen aan BENG",
    },
  },
  {
    id: "agrarisch",
    label: "Agrarisch",
    icon: Sprout,
    color: "text-green-600 dark:text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    regels: ["Meststoffenwet", "Dierenwelzijnswet", "Gewasbeschermingsmiddelen", "Waterwetgeving", "Stikstofdeposities"],
    vergunningen: ["Omgevingsvergunning milieu", "GLB-subsidie aanvraag", "Vervoersdocumenten mest"],
    aankomend: ["Nieuw GLB 2025", "Stikstof aanpak"],
    wijzigingen: 5,
    impact: {
      verandert: "Nieuw Gemeenschappelijk Landbouwbeleid verplicht 4% niet-productief areaal",
      doen: "Meld areaalwijzigingen vóór 15 mei via RVO",
      kost: "Potentieel inkomstenverlies 2–5% subsidie bij niet-voldoen",
      kansen: "Extra ecoschema-premies voor duurzame maatregelen",
      risicos: "Korting op GLB-betaling bij te late melding",
    },
  },
  {
    id: "zorg",
    label: "Zorg & Welzijn",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    regels: ["WTZi toelating", "AVG (privacywetgeving)", "BIG-registratie", "Inspectie IGJ", "Klachtenregeling"],
    vergunningen: ["WTZi toelating", "BIG-registratie zorgverleners", "CAO-toepassing"],
    aankomend: ["Wet toetreding zorgaanbieders", "AVG handhaving"],
    wijzigingen: 2,
    impact: {
      verandert: "Wet toetreding zorgaanbieders (Wtza) vereist verplichte melding nieuwe aanbieders",
      doen: "Meld je aan via CIBG vóór start zorgverlening",
      kost: "Administratiekosten inrichting kwaliteitssysteem ca. €500",
      kansen: "Verhoogd vertrouwen bij contractering door gemeenten",
      risicos: "Boetes IGJ bij praktijk zonder Wtza-melding",
    },
  },
  {
    id: "dienstverlening",
    label: "Dienstverlening",
    icon: Briefcase,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    regels: ["AVG & privacywetgeving", "Wet DBA (zzp)", "Algemene voorwaarden", "Btw-regelgeving", "Beroepsaansprakelijkheid"],
    vergunningen: ["KvK-inschrijving", "Beroepskwalificaties", "Vakdiploma's"],
    aankomend: ["Wet toelating uitzendbureau", "Digital Services Act"],
    wijzigingen: 3,
    impact: {
      verandert: "Digital Services Act verplicht transparantie over algoritmische aanbevelingen",
      doen: "Pas privacybeleid en verwerkingsregister aan",
      kost: "Juridisch advies en systeemaanpassing ca. €300–1.000",
      kansen: "DSA-compliant zijn als USP richting zakelijke klanten",
      risicos: "Boetes AP bij niet-naleving AVG verwerkersovereenkomsten",
    },
  },
];

const MONITORING_ITEMS = [
  { icon: FileCheck, label: "Nieuwe regelgeving" },
  { icon: ClipboardList, label: "Vergunningen" },
  { icon: CircleDollarSign, label: "Belastingen en heffingen" },
  { icon: TrendingUp, label: "Subsidies" },
  { icon: Building2, label: "Gemeentelijke besluiten" },
  { icon: Gavel, label: "Omgevingswet" },
  { icon: Eye, label: "Handhaving en controles" },
];

const IMPACT_VRAGEN = [
  { icon: Activity, label: "Wat verandert er?", key: "verandert" as const },
  { icon: ClipboardList, label: "Wat moet je doen?", key: "doen" as const },
  { icon: CircleDollarSign, label: "Wat kost het?", key: "kost" as const },
  { icon: TrendingUp, label: "Welke kansen ontstaan?", key: "kansen" as const },
  { icon: AlertTriangle, label: "Welke risico's zijn er?", key: "risicos" as const },
];

function SectorModal({ sector, onClose }: { sector: Sector; onClose: () => void }) {
  const Icon = sector.icon;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${sector.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${sector.color}`} />
              </div>
              <div>
                <h2 className="font-bold text-lg">{sector.label}</h2>
                <p className="text-sm text-muted-foreground">Sectorregels & impact</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Impactanalyse */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold mb-3">Impactanalyse</h3>
              <div className="space-y-3">
                {IMPACT_VRAGEN.map(({ icon: IIcon, label, key }) => (
                  <div key={key} className="flex gap-3">
                    <IIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm mt-0.5">{sector.impact[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vergunningen */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Vergunningen
              </h3>
              <ul className="space-y-1">
                {sector.vergunningen.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            {/* Verplichtingen */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Verplichtingen & regels
              </h3>
              <ul className="space-y-1">
                {sector.regels.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Aankomend */}
            {sector.aankomend.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Aankomende wijzigingen
                </h3>
                <ul className="space-y-1">
                  {sector.aankomend.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/regels/updates" onClick={onClose}>
                  Updates volgen
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/regels/check" onClick={onClose}>
                  Raakt dit mijn bedrijf?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegelsSectorregelPage() {
  usePageTitle("Sectorregels & Impact – Grip op Regels");
  const [selected, setSelected] = useState<Sector | null>(null);
  const { user } = useAuth();
  const gemeente = user?.region || "jouw gemeente";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 px-6 py-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" className="text-blue-200 hover:text-white mb-4 -ml-2" asChild>
            <Link href="/regels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Grip op Regels
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Sectorregels & Impact
              </h1>
              <p className="text-blue-200 max-w-lg mb-6">
                Welke regels gelden voor jouw sector in {gemeente}?
                OpenRegio volgt landelijke, provinciale en gemeentelijke ontwikkelingen
                en vertaalt deze naar de impact op jouw onderneming.
              </p>
              {/* Monitoring categorieën */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MONITORING_ITEMS.map(({ icon: MIcon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-blue-100 text-sm">
                    <MIcon className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Gemeente-monitor widget */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 w-full md:w-64 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3">
                Vandaag in {gemeente}
              </p>
              <div className="space-y-2.5">
                {[
                  { n: 3, label: "nieuwe ontwikkelingen" },
                  { n: 2, label: "wijzigingen met impact" },
                  { n: 1, label: "nieuwe subsidieregeling" },
                  { n: 4, label: "openbare documenten" },
                ].map(({ n, label }) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">{n}</span>
                    <span className="text-sm text-blue-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impactanalyse uitleg */}
          <div className="mt-6 flex flex-wrap gap-2">
            {IMPACT_VRAGEN.map(({ icon: IIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full border border-white/10"
              >
                <IIcon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Kies jouw sector voor regelgeving & impactanalyse
        </p>

        {/* ── Sector grid ──────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SECTOREN.map((sector) => {
            const Icon = sector.icon;
            return (
              <Card
                key={sector.id}
                className={`cursor-pointer hover-elevate border ${sector.borderColor} transition-all`}
                onClick={() => setSelected(sector)}
                data-testid={`card-sector-${sector.id}`}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${sector.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${sector.color}`} />
                    </div>
                    {sector.wijzigingen > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {sector.wijzigingen} wijziging{sector.wijzigingen > 1 ? "en" : ""}
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-semibold text-base">{sector.label}</h2>
                  <ul className="space-y-1.5">
                    {sector.regels.slice(0, 3).map((r) => (
                      <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary mt-auto">
                    Bekijk impact
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border bg-muted/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm">Staat jouw sector er niet bij?</p>
            <p className="text-sm text-muted-foreground">
              Gebruik de hulp-tool om te bepalen welke regels voor jouw situatie gelden.
            </p>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/regels/check" data-testid="button-check-situatie">
              Controleer mijn situatie
            </Link>
          </Button>
        </div>
      </div>

      {selected && (
        <SectorModal sector={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
