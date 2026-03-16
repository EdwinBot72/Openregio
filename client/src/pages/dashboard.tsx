import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  FileSearch,
  Gavel,
  Eye,
  Users,
  Shield,
  UserPlus,
  Activity,
  Lock,
  ChevronRight,
  Globe,
  Search,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

type ActionCard = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  cta: string;
  color: string;
  bg: string;
  proOnly?: boolean;
  badge?: string;
};

function buildActions(isPro: boolean): ActionCard[] {
  return [
    {
      id: "brief",
      label: "Brief of besluit begrijpen",
      description: "Plak een overheidsbrief en ontvang direct uitleg, termijnen en aanbevolen acties. Geen verrassingen meer — alleen inzicht.",
      icon: FileSearch,
      href: "/tools/brief-analyse",
      cta: isPro ? "Brief analyseren" : "Analyse starten",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      badge: isPro ? undefined : "Beperkt",
    },
    {
      id: "woo",
      label: "Verborgen informatie opvragen",
      description: isPro
        ? "Vraag officiële overheidsinformatie op die anderen niet gebruiken. Bouw dossiers op en creëer een strategisch voordeel."
        : "Haal marktinformatie op bij overheden die publiek beschikbaar is maar moeilijk toegankelijk. Beschikbaar voor Pro-bijdragers.",
      icon: Gavel,
      href: isPro ? "/woo-wizard" : "/lidmaatschap?plan=pro",
      cta: isPro ? "Verzoek starten" : "Ontgrendelen",
      color: isPro
        ? "text-orange-600 dark:text-orange-400"
        : "text-muted-foreground",
      bg: isPro
        ? "bg-orange-50 dark:bg-orange-950/40"
        : "bg-muted/40",
      proOnly: !isPro,
      badge: !isPro ? "Pro" : undefined,
    },
    {
      id: "regio",
      label: "Als eerste weten wat er speelt",
      description: "Beleidsupdates, aanbestedingen en subsidies in jouw gemeente — dagelijks ververst. Wie het eerst weet, heeft een voorsprong.",
      icon: Activity,
      href: "/kansen/gemeente-updates",
      cta: "Regio volgen",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      id: "website-scan",
      label: "Website scan",
      description: isPro
        ? "Analyseer jouw website op vindbaarheid, lokale aanwezigheid en technische kwaliteit. Krijg concrete verbeterpunten."
        : "Uitgebreide scan van jouw website: vindbaarheid, lokale aanwezigheid, technische kwaliteit. Beschikbaar voor Pro-bijdragers.",
      icon: Globe,
      href: isPro ? "/tools/website-scan" : "/lidmaatschap?plan=pro",
      cta: isPro ? "Scan starten" : "Ontgrendelen",
      color: isPro ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground",
      bg: isPro ? "bg-blue-50 dark:bg-blue-950/40" : "bg-muted/40",
      proOnly: !isPro,
      badge: !isPro ? "Pro" : undefined,
    },
    {
      id: "regelgeving",
      label: "Regelgeving verkenner",
      description: "Zoek door officiële verordeningen, beleidsregels en besluiten van gemeenten door heel Nederland. Gebruik als basis voor een Woo-verzoek.",
      icon: Search,
      href: "/regelgeving-verkenner",
      cta: "Verkenner openen",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      id: "samenwerken",
      label: "Samenwerking starten",
      description: isPro
        ? "Start projecten, plaats aanvragen bij RegioCrew en lanceer initiatieven in jouw regio."
        : "Bekijk samenwerkingen en join bestaande RegioCrew projecten.",
      icon: Users,
      href: "/regiocrew",
      cta: "Naar RegioCrew",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
  ];
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";
  const actions = buildActions(isPro);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-welcome">
            Hallo, {displayName}
          </h1>
          <Badge variant={isPro ? "default" : "outline"} className="text-xs" data-testid="badge-plan">
            {isPro ? "Pro" : "Basis"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Informatie is openbaar. Slimme ondernemers gebruiken het.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Wat wil je doen?
        </h2>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const locked = action.proOnly;
            return (
              <Card
                key={action.id}
                data-testid={`card-action-${action.id}`}
                className={locked ? "opacity-80" : "hover-elevate"}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 rounded-md p-2.5 ${action.bg}`}>
                      {locked
                        ? <Lock className={`h-5 w-5 text-muted-foreground`} />
                        : <Icon className={`h-5 w-5 ${action.color}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm leading-snug">{action.label}</p>
                        {action.badge && (
                          <Badge
                            variant={action.badge === "Pro" ? "default" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-action-${action.id}`}
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <Link href={action.href}>
                      <Button
                        size="sm"
                        variant={locked ? "default" : "outline"}
                        className="shrink-0"
                        data-testid={`button-action-${action.id}`}
                      >
                        {action.cta}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t" data-testid="section-secondary">
        <p className="text-xs text-muted-foreground">Meer tools</p>
        <div className="flex flex-wrap gap-1">
          <Link href="/bedrijfsprofiel">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" data-testid="link-secondary-profiel">
              <Eye className="h-3.5 w-3.5" />
              Zichtbaarheid
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </Link>
          <Link href="/regiobot">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" data-testid="link-secondary-regiobot">
              RegioBot
              {!isPro && <Badge variant="secondary" className="text-xs ml-0.5">Beperkt</Badge>}
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </Link>
          <Link href="/kansen/aanbestedingen">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" data-testid="link-secondary-aanbestedingen">
              Aanbestedingen
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>

      {isAdmin && (
        <section className="space-y-4 pt-4 border-t" data-testid="section-admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Beheer</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Card data-testid="card-admin-export">
              <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Leden export</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/api/export/nieuwe-leden?days=7&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-7">
                      CSV (7 dagen)
                    </Button>
                  </a>
                  <a href="/api/export/nieuwe-leden?days=30&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-30">
                      CSV (30 dagen)
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-create-user">
              <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Gebruiker aanmaken</h3>
                </div>
                <Link href="/admin/users">
                  <Button size="sm" data-testid="button-admin-create-user">
                    Nieuw account
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

    </div>
  );
}
