import { useState } from "react";
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
  AlertTriangle,
  Clock,
  CalendarDays,
  Search,
  ClipboardList,
  CircleDollarSign,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";

type Urgentie = "actie" | "6maanden" | "volgend-jaar" | "onderzoek";
type Categorie = "EU" | "Subsidie" | "Gemeentelijk" | "Belasting" | "Milieu";

interface Ontwikkeling {
  id: string;
  icon: React.ElementType;
  titel: string;
  watVerandert: string;
  watMoetJeDoen: string;
  watKostHet: string;
  wieRaaktDit: string;
  wanneer: string;
  urgentie: Urgentie;
  categorie: Categorie;
}

const URGENTIE_CONFIG: Record<
  Urgentie,
  { label: string; icon: React.ElementType; colorClass: string; badgeClass: string }
> = {
  actie: {
    label: "Nu actie nodig",
    icon: AlertTriangle,
    colorClass: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
  "6maanden": {
    label: "Binnen 6 maanden",
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  "volgend-jaar": {
    label: "Volgend jaar",
    icon: CalendarDays,
    colorClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  onderzoek: {
    label: "In onderzoek",
    icon: Search,
    colorClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

const CATEGORIE_CONFIG: Record<Categorie, { label: string; colorClass: string }> = {
  EU: { label: "EU", colorClass: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800" },
  Subsidie: { label: "Subsidie", colorClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" },
  Gemeentelijk: { label: "Gemeente", colorClass: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800" },
  Belasting: { label: "Belasting", colorClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-700" },
  Milieu: { label: "Milieu", colorClass: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800" },
};

const ONTWIKKELINGEN: Ontwikkeling[] = [
  {
    id: "digital-wallet",
    icon: Smartphone,
    titel: "Digital Identity Wallet",
    watVerandert: "Europese digitale identiteit voor bedrijven en burgers — verplicht identificatiesysteem vanaf 2026.",
    watMoetJeDoen: "Informeer je over welke klantprocessen moeten worden aangepast. Vraag je softwareleverancier naar compatibiliteit.",
    watKostHet: "Aanpassingskosten afhankelijk van systemen; vaak €500–2.000 voor integratie",
    wieRaaktDit: "Alle bedrijven die online diensten verlenen of klanten identificeren.",
    wanneer: "2026",
    urgentie: "6maanden",
    categorie: "EU",
  },
  {
    id: "ai-act",
    icon: Bot,
    titel: "EU AI Act",
    watVerandert: "Verplichte risicoanalyse en documentatie als je AI-systemen gebruikt in je bedrijfsvoering.",
    watMoetJeDoen: "Maak een lijst van alle AI-tools die je gebruikt. Bepaal per tool het risiconiveau en pas documentatie aan.",
    watKostHet: "Interne tijdsinvestering ca. 4–8 uur. Externe juridische check ca. €300–600",
    wieRaaktDit: "Bedrijven die AI-tools inzetten voor beslissingen of klantcontact.",
    wanneer: "Augustus 2026",
    urgentie: "6maanden",
    categorie: "EU",
  },
  {
    id: "avg",
    icon: Lock,
    titel: "AVG handhaving intensivering",
    watVerandert: "Autoriteit Persoonsgegevens vergroot handhavingscapaciteit. Hogere kans op boetes bij overtredingen.",
    watMoetJeDoen: "Controleer je verwerkersregister en privacybeleid. Zorg dat cookie-consent en datalekprocedure up-to-date zijn.",
    watKostHet: "Boetes kunnen oplopen tot €20 miljoen of 4% van wereldwijde omzet",
    wieRaaktDit: "Alle bedrijven die klant- of personeelsgegevens verwerken.",
    wanneer: "Lopend",
    urgentie: "actie",
    categorie: "EU",
  },
  {
    id: "csrd",
    icon: BarChart2,
    titel: "CSRD duurzaamheidsrapportage",
    watVerandert: "Verplichte rapportage over milieu, sociaal beleid en governance voor grotere bedrijven.",
    watMoetJeDoen: "Check of jouw bedrijf onder de drempelwaarden valt. Start met een nulmeting van energieverbruik en CO₂.",
    watKostHet: "Eerste rapportage: externe advieskosten ca. €2.000–8.000 afhankelijk van bedrijfsgrootte",
    wieRaaktDit: "Bedrijven met meer dan 50 medewerkers of €10M omzet.",
    wanneer: "2025–2026 gefaseerd",
    urgentie: "6maanden",
    categorie: "EU",
  },
  {
    id: "subsidies",
    icon: Coins,
    titel: "Nieuwe subsidie-rondes ISDE & SLIM",
    watVerandert: "Extra investeringssubsidie voor verduurzaming en leertrajecten voor mkb'ers.",
    watMoetJeDoen: "Dien je aanvraag in vóór het budget op is. SLIM-subsidie sluit zodra het plafond bereikt is.",
    watKostHet: "Gratis aan te vragen. SLIM dekt 80% van opleidingskosten tot €25.000",
    wieRaaktDit: "MKB-ondernemers die willen verduurzamen of personeel opleiden.",
    wanneer: "Q1 2025",
    urgentie: "actie",
    categorie: "Subsidie",
  },
  {
    id: "gemeenteverordeningen",
    icon: Building2,
    titel: "Gemeentelijke verordeningen Omgevingswet",
    watVerandert: "Gemeenten herzien lokale regels in het kader van de Omgevingswet. Vergunningsregels kunnen veranderen.",
    watMoetJeDoen: "Controleer het Omgevingsloket van jouw gemeente. Vraag na of bestaande vergunningen nog geldig zijn.",
    watKostHet: "Hervergunning bij wijziging: ca. €150–500 leges",
    wieRaaktDit: "Bedrijven met een omgevingsvergunning of bouwplannen.",
    wanneer: "2025–2026",
    urgentie: "volgend-jaar",
    categorie: "Gemeentelijk",
  },
  {
    id: "milieu",
    icon: Leaf,
    titel: "Verscherpte milieuregels stikstof",
    watVerandert: "Nieuwe drempelwaarden voor stikstofdeposities en verplichte compensatiemaatregelen.",
    watMoetJeDoen: "Voer een AERIUS-berekening uit voor jouw locatie. Vraag bij twijfel een omgevingsadvies aan.",
    watKostHet: "AERIUS-berekening: ca. €300–800 via extern bureau",
    wieRaaktDit: "Agrarische bedrijven, bouwbedrijven en industrie.",
    wanneer: "2025",
    urgentie: "actie",
    categorie: "Milieu",
  },
  {
    id: "belasting",
    icon: Receipt,
    titel: "Belastingwijzigingen 2025",
    watVerandert: "Aanpassing mkb-winstvrijstelling (12,7% → 12,03%), hogere WW-premies, nieuwe btw-regels diensten.",
    watMoetJeDoen: "Bespreek de impact met je boekhouder. Pas je administratie en jaarplanning aan op de nieuwe percentages.",
    watKostHet: "Hogere belastingdruk: netto verschil ca. €200–800 per jaar voor gemiddelde zzp'er",
    wieRaaktDit: "Alle zelfstandigen en mkb-ondernemers.",
    wanneer: "1 januari 2025",
    urgentie: "actie",
    categorie: "Belasting",
  },
];

const FILTER_OPTIONS: { label: string; value: Urgentie | "all" }[] = [
  { label: "Alle", value: "all" },
  { label: "Nu actie", value: "actie" },
  { label: "Binnen 6 maanden", value: "6maanden" },
  { label: "Volgend jaar", value: "volgend-jaar" },
  { label: "In onderzoek", value: "onderzoek" },
];

const REKENING_ITEMS = [
  { icon: ShieldAlert, label: "Nieuwe verplichtingen" },
  { icon: CircleDollarSign, label: "Subsidiekansen" },
  { icon: TrendingUp, label: "Marktontwikkelingen" },
  { icon: Building2, label: "Lokale besluiten" },
  { icon: ClipboardList, label: "Actievereisten" },
];

export default function RegelsOntwikkelingenPage() {
  usePageTitle("Wat komt eraan? – Grip op Regels");
  const [filter, setFilter] = useState<Urgentie | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "all" ? ONTWIKKELINGEN : ONTWIKKELINGEN.filter((o) => o.urgentie === filter);

  const actieTelling = ONTWIKKELINGEN.filter((o) => o.urgentie === "actie").length;
  const zesmaandenTelling = ONTWIKKELINGEN.filter((o) => o.urgentie === "6maanden").length;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/regels" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", marginBottom: 18 }}>
            <ArrowLeft size={13} /> Grip op Regels
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell style={{ width: 24, height: 24, color: "#f28a1a" }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Wat komt eraan?</h1>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
                  Nieuwe wetten, subsidies en lokale besluiten — vertaald naar wat jij moet doen.
                </p>
              </div>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #dce6f0", borderRadius: 12, padding: "14px 18px", minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Stand van zaken</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#dc2626" }}>Nu actie</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#0b2240" }}>{actieTelling}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#d97706" }}>6 maanden</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#0b2240" }}>{zesmaandenTelling}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Volgend jaar</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#0b2240" }}>{ONTWIKKELINGEN.filter((o) => o.urgentie === "volgend-jaar").length}</span>
              </div>
            </div>
          </div>
        </div>

      <div style={{ maxWidth: 1060 }}>
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
              {opt.value !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {ONTWIKKELINGEN.filter((o) => o.urgentie === opt.value).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* ── Ontwikkelingen lijst ──────────────────────────────────── */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            const urg = URGENTIE_CONFIG[item.urgentie];
            const UrgIcon = urg.icon;
            const cat = CATEGORIE_CONFIG[item.categorie];
            const isOpen = expanded === item.id;

            return (
              <Card key={item.id} className="overflow-hidden" data-testid={`card-ontwikkeling-${item.id}`}>
                <CardContent className="p-0">
                  {/* ── Hoofdrij ─── */}
                  <button
                    className="w-full text-left p-5 hover-elevate"
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    data-testid={`toggle-ontwikkeling-${item.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-sm">{item.titel}</h3>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${urg.badgeClass}`}>
                            <UrgIcon className="w-2.5 h-2.5 mr-1" />
                            {urg.label}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${cat.colorClass}`}>
                            {cat.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.watVerandert}
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-0.5 mt-2 text-xs text-muted-foreground">
                          <span><span className="font-medium">Wie:</span> {item.wieRaaktDit}</span>
                          <span><span className="font-medium">Wanneer:</span> {item.wanneer}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 mt-1">
                        {isOpen ? "Verberg" : "Wat doen?"}
                      </span>
                    </div>
                  </button>

                  {/* ── Uitklapblok: wat moet je doen ─── */}
                  {isOpen && (
                    <div className="border-t bg-muted/30 px-5 py-4 space-y-3">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            <ClipboardList className="w-3 h-3" />
                            Wat moet je doen?
                          </div>
                          <p className="text-sm">{item.watMoetJeDoen}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            <CircleDollarSign className="w-3 h-3" />
                            Wat kost het?
                          </div>
                          <p className="text-sm">{item.watKostHet}</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end sm:justify-end">
                          <Button size="sm" asChild>
                            <Link href="/regels/check">
                              Raakt dit mij?
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/regels/documenten">
                              Document analyseren
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
              Volg regel-updates en ontvang meldingen zodra er iets nieuws is voor jouw sector.
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
    </div>
  );
}
