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
    title: "Welke regels gelden voor jouw bedrijf?",
    description:
      "Vergunningen, meldingen, verplichtingen en controles — per sector direct inzichtelijk.",
    cta: "Bekijk sectorregels",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "ontwikkelingen",
    href: "/regels/ontwikkelingen",
    icon: Bell,
    badge: "Nieuw",
    title: "Welke veranderingen komen eraan?",
    description:
      "Nieuwe wetten, Europese regels, subsidies en lokale verordeningen die jouw bedrijf raken.",
    cta: "Bekijk wat er komt",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "documenten",
    href: "/regels/documenten",
    icon: FileSearch,
    badge: "AI-analyse",
    title: "Openbaar maken en controleren",
    description:
      "Upload een brief of besluit. AI maakt automatisch een WOO-verzoek of AVG-analyse.",
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
        <div className="relative z-10 px-6 py-12 md:py-16 max-w-5xl mx-auto">
          <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/10">
            Sectie 3 — Regels
          </Badge>
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
            <div className="shrink-0">
              <img
                src="/regels-hero.png"
                alt="OpenRegio infographic"
                className="w-full max-w-xs rounded-lg border shadow-sm object-cover"
              />
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
