import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  UserPlus,
  Shield,
  Radio,
  BookOpen,
  Euro,
  TrendingUp,
  MapPin,
  Building2,
  AlertTriangle,
  Zap,
  BarChart3,
  ChevronRight,
  FileText,
  Search,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { IntelSignaal } from "@shared/schema";

// ─── Essentiële tools definitie ───────────────────────────────────────────────
const ESSENTIELE_TOOLS = [
  {
    id: "intel",
    title: "Intel Dashboard",
    description: "Laatste signalen voor ondernemers",
    icon: Radio,
    href: "/intel",
  },
  {
    id: "wetgeving",
    title: "Wet & Regelgeving",
    description: "Belangrijke regels en wijzigingen",
    icon: BookOpen,
    href: "/regelgeving-verkenner",
  },
  {
    id: "lokale-regels",
    title: "Lokale Regels",
    description: "Bekijk regels in jouw regio",
    icon: MapPin,
    href: "/beleidsmonitor",
  },
  {
    id: "subsidies",
    title: "Subsidies",
    description: "Kansen die je niet wilt missen",
    icon: Euro,
    href: "/kansen/aanbestedingen",
  },
  {
    id: "regio-kansen",
    title: "Regio Kansen",
    description: "Nieuwe kansen voor lokale ondernemers",
    icon: TrendingUp,
    href: "/kansen/gemeente-updates",
  },
] as const;

// ─── Statische fallback voor "Vandaag belangrijk" ─────────────────────────────
const FALLBACK_SIGNALEN = [
  {
    id: "f1",
    titel: "Nieuwe Subsidie",
    samenvatting: "Voor verduurzaming MKB",
    cta: "Bekijk nu",
    href: "/kansen/aanbestedingen",
    categorie: "subsidies",
  },
  {
    id: "f2",
    titel: "Lokale Verordening Gewijzigd",
    samenvatting: "Nieuwe regels per 1 mei",
    cta: "Lees meer",
    href: "/beleidsmonitor",
    categorie: "beleid",
  },
  {
    id: "f3",
    titel: "Kosten Stijgen",
    samenvatting: "Hoger energietarief verwacht",
    cta: "Bekijk impact",
    href: "/intel",
    categorie: "financieel",
  },
  {
    id: "f4",
    titel: "Inkopen bij het Rijk",
    samenvatting: "Nieuwe aanbestedingskans",
    cta: "Pak kans",
    href: "/kansen/aanbestedingen",
    categorie: "subsidies",
  },
];

// ─── Acties voor jou ──────────────────────────────────────────────────────────
const ACTIES = [
  {
    id: "kansen",
    title: "Bekijk kansen",
    description: "Ontdek nieuwe zakelijke mogelijkheden.",
    icon: TrendingUp,
    href: "/kansen/gemeente-updates",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "regels",
    title: "Check regels",
    description: "Bekijk regels voor jouw sector.",
    icon: Search,
    href: "/regelgeving-verkenner",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "subsidies",
    title: "Ontdek subsidies",
    description: "Zie welke steun jij kunt krijgen.",
    icon: Euro,
    href: "/kansen/aanbestedingen",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
] as const;

// ─── Categorie badge kleur ─────────────────────────────────────────────────────
function categorieBadgeVariant(categorie: string): "default" | "secondary" | "outline" {
  if (categorie === "subsidies" || categorie === "financieel") return "default";
  if (categorie === "wetgeving") return "secondary";
  return "outline";
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: intelSignalen = [] } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";

  // ─── Radar telgegevens (op basis van echte data, fallback 0) ───────────────
  const totaalSignalen = intelSignalen.length;
  const hogeImpactCount = intelSignalen.filter(
    (s) => s.categorie === "wetgeving" || s.categorie === "beleid"
  ).length;
  const directeKansCount = intelSignalen.filter(
    (s) => s.categorie === "subsidies" || s.categorie === "financieel"
  ).length;

  // ─── Vandaag belangrijk: echte data of fallback ────────────────────────────
  const vandaagSignalen =
    intelSignalen.length >= 4
      ? intelSignalen.slice(0, 4).map((s) => ({
          id: String(s.id),
          titel: s.titel,
          samenvatting: s.samenvatting || s.titel,
          cta: "Lees meer",
          href: `/intel`,
          categorie: s.categorie,
        }))
      : FALLBACK_SIGNALEN;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-welcome">
            Welkom terug, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Informatie is openbaar. Slimme ondernemers gebruiken het.
          </p>
        </div>
        <Badge
          variant={isPro ? "default" : "outline"}
          className="text-xs"
          data-testid="badge-plan"
        >
          {isPro ? "Pro" : "Basis"}
        </Badge>
      </div>

      {/* ── Ondernemersradar ────────────────────────────────────────────────── */}
      <section data-testid="section-radar">
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold">Ondernemersradar voor jouw regio</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Regels, kansen en signalen die vandaag impact hebben op jouw bedrijf.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-md border bg-background p-4 space-y-1 text-center"
                  data-testid="radar-nieuwe-signalen"
                >
                  <div className="flex justify-center">
                    <Radio className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{totaalSignalen}</p>
                  <p className="text-xs text-muted-foreground">Nieuwe signalen</p>
                </div>
                <div
                  className="rounded-md border bg-background p-4 space-y-1 text-center"
                  data-testid="radar-hoge-impact"
                >
                  <div className="flex justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">{hogeImpactCount}</p>
                  <p className="text-xs text-muted-foreground">Hoge impact</p>
                </div>
                <div
                  className="rounded-md border bg-background p-4 space-y-1 text-center"
                  data-testid="radar-directe-kans"
                >
                  <div className="flex justify-center">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold">{directeKansCount}</p>
                  <p className="text-xs text-muted-foreground">Directe kans</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Vandaag belangrijk ──────────────────────────────────────────────── */}
      <section className="space-y-3" data-testid="section-vandaag-belangrijk">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Vandaag belangrijk
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {vandaagSignalen.map((signaal) => (
            <Card
              key={signaal.id}
              className="hover-elevate"
              data-testid={`card-signaal-${signaal.id}`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge
                    variant={categorieBadgeVariant(signaal.categorie)}
                    className="text-[10px]"
                  >
                    {signaal.categorie}
                  </Badge>
                  <p className="text-sm font-semibold leading-snug">{signaal.titel}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {signaal.samenvatting}
                  </p>
                </div>
                <Link href={signaal.href}>
                  <Button size="sm" variant="outline" className="w-full" data-testid={`button-signaal-${signaal.id}`}>
                    {signaal.cta}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Essentiële tools ────────────────────────────────────────────────── */}
      <section className="space-y-3" data-testid="section-essentiele-tools">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Essentiële tools
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {ESSENTIELE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link href={tool.href} key={tool.id}>
                <div
                  className="flex-none w-40 rounded-md border bg-card p-3.5 space-y-2 cursor-pointer hover-elevate active-elevate-2"
                  data-testid={`card-tool-${tool.id}`}
                >
                  <div className="rounded-md bg-primary/10 p-1.5 w-fit">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-snug">{tool.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Acties voor jou ─────────────────────────────────────────────────── */}
      <section className="space-y-3" data-testid="section-acties">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Acties voor jou
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {ACTIES.map((actie) => {
            const Icon = actie.icon;
            return (
              <Card key={actie.id} className="hover-elevate" data-testid={`card-actie-${actie.id}`}>
                <CardContent className="p-5 space-y-4">
                  <div className={`rounded-md p-2.5 w-fit ${actie.bg}`}>
                    <Icon className={`h-5 w-5 ${actie.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{actie.title}</p>
                    <p className="text-xs text-muted-foreground">{actie.description}</p>
                  </div>
                  <Link href={actie.href}>
                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-actie-${actie.id}`}>
                      Ga naar
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Extra / Admin ───────────────────────────────────────────────────── */}
      {isAdmin && (
        <section className="space-y-3 pt-4 border-t" data-testid="section-admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Extra / Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card data-testid="card-admin-export">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Leden export</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/api/export/nieuwe-leden?days=7&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-7">
                      CSV 7d
                    </Button>
                  </a>
                  <a href="/api/export/nieuwe-leden?days=30&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-30">
                      CSV 30d
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-create-user">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Gebruiker aanmaken</p>
                </div>
                <Link href="/admin/users">
                  <Button size="sm" data-testid="button-admin-create-user">
                    Nieuw account
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-cockpit">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Rapporten</p>
                </div>
                <Link href="/admin/inzicht">
                  <Button size="sm" variant="outline" data-testid="button-admin-rapporten">
                    Bekijk
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-beheer">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Beheer</p>
                </div>
                <Link href="/admin">
                  <Button size="sm" variant="outline" data-testid="button-admin-beheer">
                    Naar beheer
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
