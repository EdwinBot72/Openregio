import { Link } from "wouter";
import {
  Shield,
  Bell,
  FileSearch,
  ChevronRight,
  Scale,
  Upload,
  HelpCircle,
  BookOpen,
  Library,
  Newspaper,
  ArrowRight,
  Eye,
  Users,
  BookMarked,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";

const MAIN_CARDS = [
  {
    id: "sectorregels",
    href: "/regels/sectorregels",
    icon: Shield,
    badge: "7 sectoren",
    title: "Sectorregels",
    description:
      "Bekijk welke regels gelden voor jouw sector, per gemeente, en wat de impact is op kosten, verplichtingen, risico's en kansen.",
    cta: "Bekijk sectorregels",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "ontwikkelingen",
    href: "/regels/ontwikkelingen",
    icon: Bell,
    badge: "Nieuw",
    title: "Wat komt eraan?",
    description:
      "Volg aankomende wijzigingen zoals Digital ID, AI Act, AVG, Omgevingswet, subsidies en gemeentelijke besluiten.",
    cta: "Bekijk wat er komt",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "documenten",
    href: "/regels/documenten",
    icon: FileSearch,
    badge: "AI-analyse",
    title: "Documenten opvragen",
    description:
      "Stel je vraag of upload een brief. OpenRegio maakt er een AVG-controleslag of WOO-verzoek van met conceptbrief.",
    cta: "Document analyseren",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

const QUICK_LINKS = [
  { href: "/regels/updates", icon: Newspaper, label: "Regel-updates" },
  { href: "/regels/help", icon: HelpCircle, label: "Hulp bij regels" },
  { href: "/regels/check", icon: Scale, label: "Raakt dit mij?" },
  { href: "/regels/woo", icon: Library, label: "WOO-bibliotheek" },
  { href: "/regels/documenten", icon: Upload, label: "Upload document" },
  { href: "/regels/help", icon: BookOpen, label: "Dossiers" },
];

const PIJLERS = [
  {
    num: "1",
    label: "Grip op Regels",
    href: "/regels",
    icon: BookMarked,
    active: true,
    description: "Vergunningen, WOO, wetgeving",
  },
  {
    num: "2",
    label: "Zichtbaarheid",
    href: "/groei/zichtbaarheid",
    icon: Eye,
    active: false,
    description: "Profiel, website, vindbaar",
  },
  {
    num: "3",
    label: "Samenwerken",
    href: "/network",
    icon: Users,
    active: false,
    description: "Netwerk, opdrachten, deals",
  },
];

export default function RegelsOverzichtPage() {
  usePageTitle("Grip op Regels – OpenRegio");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        <img
          src="/regels-hero.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 px-6 py-10 md:py-14 max-w-5xl mx-auto">
          {/* Pijler-context */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {PIJLERS.map((p) => {
              const Icon = p.icon;
              return (
                <Link key={p.num} href={p.href}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      p.active
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                    data-testid={`link-pijler-${p.num}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        p.active ? "bg-primary text-white" : "bg-white/20 text-white"
                      }`}
                    >
                      {p.num}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{p.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Grip op Regels
          </h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Welke regels gelden voor jouw bedrijf? Wat verandert er binnenkort?
            En hoe vraag je documenten op?
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ── Drie hoofdblokken ────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.id} href={card.href}>
                <Card
                  className="h-full cursor-pointer hover-elevate transition-all"
                  data-testid={`card-regels-${card.id}`}
                >
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {card.badge}
                      </Badge>
                      <h2 className="font-semibold text-base leading-snug mb-2">
                        {card.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      {card.cta}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ── Drie pijlers blok ─────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            De drie pijlers van OpenRegio
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PIJLERS.map((p) => {
              const Icon = p.icon;
              return (
                <Link key={p.num} href={p.href}>
                  <div
                    className={`flex flex-col gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                      p.active
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`card-pijler-${p.num}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          p.active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.num}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${p.active ? "text-primary" : ""}`}>
                          {p.label}
                        </div>
                        {p.active && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                            Je bent hier
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.description}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Uitleg sectie ────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-muted/40 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">Waarom Grip op Regels?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Als ondernemer krijg je te maken met gemeentelijke regels,
                vergunningseisen, belastingverplichtingen en steeds nieuwe Europese
                wetgeving. OpenRegio maakt dit inzichtelijk — zonder juridisch
                jargon.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Sectorspecifiek", desc: "Alleen regels die voor jouw branche gelden" },
                  { label: "Actueel", desc: "Wijzigingen worden direct bijgehouden" },
                  { label: "Praktisch", desc: "Concrete stappen, geen abstracte tekst" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Snelle links ─────────────────────────────────────────────── */}
        <div>
          <h3 className="font-semibold text-base mb-4 text-muted-foreground uppercase tracking-wide text-xs">
            Snelle toegang
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href + link.label} href={link.href}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`link-quick-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-medium leading-tight">{link.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Workflow-uitleg ───────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-6 md:p-8">
          <h3 className="font-semibold text-lg mb-2">Hoe werkt documenten opvragen?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Upload een brief of besluit — de AI doet de rest.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              "Document uploaden",
              "OCR uitlezen",
              "AI analyse",
              "Risico's herkennen",
              "AVG of WOO",
              "Conceptbrief",
              "Jij controleert",
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/regels/documenten" data-testid="button-start-document-analyse">
                Document analyseren
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
