import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  MessageCircle,
  ShieldCheck,
  Printer,
  Coins,
  Bot,
  Download,
  Shield,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Bedrijfsprofiel } from "@shared/schema";

interface RegionStats {
  count: number;
  latestMember: Bedrijfsprofiel | null;
  region: string | null;
}

interface PostStats {
  openPosts: number;
  userPosts: number;
  region: string | null;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string; status: string; regio: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: regionStats } = useQuery<RegionStats>({
    queryKey: ["/api/region-stats/me"],
    enabled: !!user,
  });

  const { data: postStats } = useQuery<PostStats>({
    queryKey: ["/api/post-stats/me"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
        </Card>
      </div>
    );
  }

  // TODO: haal dit later uit de API
  const basischeckScore = 3; // 0–5
  const basischeckDone = basischeckScore > 0;

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-welcome">
            Welkom, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Dit is je cockpit: profiel, netwerk, vraag & aanbod en je basisprofiel.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-muted">
          <span className="font-semibold">Lidmaatschap:</span>
          <Badge variant={isPro ? "default" : "outline"} data-testid="badge-plan">
            {isPro ? "Pro" : "Basis"}
          </Badge>
        </div>
      </header>

      {/* Hoofdtegels */}
      <section className="grid md:grid-cols-2 gap-4">
        {/* Mijn bedrijf */}
        <Card data-testid="card-mijn-bedrijf">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <Building2 className="w-5 h-5 text-regio-blue" />
              </div>
              <div>
                <h2 className="font-semibold">Mijn bedrijf</h2>
                <p className="text-sm text-muted-foreground">
                  Zo zien andere leden jouw profiel in OpenRegio.
                </p>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              <li>
                Profielstatus:{" "}
                <span className="font-medium text-foreground">
                  {bedrijfsprofiel?.status === "actief" ? "actief" : "bijna compleet"}
                </span>
              </li>
              <li>Laatst bijgewerkt: recent</li>
            </ul>
            <div className="mt-2">
              <Link href="/bedrijfsprofiel">
                <Button size="sm" data-testid="button-edit-profile">
                  Bewerk bedrijfsprofiel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Leden in jouw regio */}
        <Card data-testid="card-leden">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <Users className="w-5 h-5 text-regio-blue" />
              </div>
              <div>
                <h2 className="font-semibold">Leden in jouw regio</h2>
                <p className="text-sm text-muted-foreground">
                  Ondernemers in jouw omgeving die je direct kunt bellen of benaderen.
                </p>
              </div>
            </div>
            {regionStats?.region ? (
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>Actieve leden in {regionStats.region}: {regionStats.count}</li>
                {regionStats.latestMember && (
                  <li>Nieuwste lid: {regionStats.latestMember.naam}</li>
                )}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Vul eerst je bedrijfsprofiel in om leden in jouw regio te zien.
              </p>
            )}
            <div className="mt-2">
              {regionStats?.region ? (
                <Link href={`/network?regio=${encodeURIComponent(regionStats.region)}`}>
                  <Button size="sm" data-testid="button-view-network">
                    Bekijk ledenlijst
                  </Button>
                </Link>
              ) : (
                <Link href="/bedrijfsprofiel">
                  <Button size="sm" variant="outline" data-testid="button-create-profile">
                    Maak bedrijfsprofiel
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vraag & aanbod */}
        <Card data-testid="card-vraag-aanbod">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <MessageCircle className="w-5 h-5 text-regio-blue" />
              </div>
              <div>
                <h2 className="font-semibold">Vraag & aanbod</h2>
                <p className="text-sm text-muted-foreground">
                  Waar kun jij nu iets halen of brengen binnen het netwerk?
                </p>
              </div>
            </div>
            {postStats?.region ? (
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>Berichten in {postStats.region}: {postStats.openPosts}</li>
                <li>Jouw eigen berichten: {postStats.userPosts}</li>
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Vul eerst je bedrijfsprofiel in om berichten in jouw regio te zien.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/network?tab=bord">
                <Button size="sm" data-testid="button-view-board">
                  Naar bord
                </Button>
              </Link>
              <Link href="/network?tab=nieuw">
                <Button variant="outline" size="sm" data-testid="button-new-post">
                  Plaats nieuw bericht
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Basischeck / offline modus */}
        <Card data-testid="card-basischeck">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-graph/10">
                <ShieldCheck className="w-5 h-5 text-regio-graph" />
              </div>
              <div>
                <h2 className="font-semibold">Ondernemen terug naar de basis</h2>
                <p className="text-sm text-muted-foreground">
                  Je basischeck: cash, papieren bonnen, bereikbaarheid en offline werken.
                </p>
              </div>
            </div>

            {basischeckDone ? (
              <>
                <p className="text-sm">
                  Jouw basisprofiel: <span className="font-semibold">{basischeckScore}/5 punten</span>.
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  <li>Cash mogelijk: ja</li>
                  <li>Bonnenblok: ja</li>
                  <li>Papieren telefoonlijst: nog niet ingesteld</li>
                </ul>
                <div className="mt-2">
                  <Link href="/basischeck">
                    <Button size="sm" data-testid="button-view-basischeck">
                      Bekijk en verbeter
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Je basischeck is nog niet ingevuld. Met 5 simpele vragen zie je hoe stevig
                  jouw bedrijf blijft draaien als systemen even niet meewerken.
                </p>
                <div className="mt-2">
                  <Link href="/basischeck">
                    <Button size="sm" data-testid="button-do-basischeck">
                      Doe de Basischeck
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Onderste rij: print, RegioPunten & RegioBot */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card data-testid="card-print">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-graph/10">
                <Printer className="w-5 h-5 text-regio-graph" />
              </div>
              <div>
                <h2 className="font-semibold">Printbare overzichten</h2>
                <p className="text-sm text-muted-foreground">
                  Voor als je met pen, papier en telefoon wilt werken.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <Button size="sm" variant="outline" data-testid="button-print-members">
                Ledenlijst printen
              </Button>
              <Button size="sm" variant="outline" data-testid="button-print-basischeck">
                Basischeck printen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-regiopunten">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-alert/10">
                <Coins className="w-5 h-5 text-regio-alert" />
              </div>
              <div>
                <h2 className="font-semibold">RegioPunten (pilot)</h2>
                <p className="text-sm text-muted-foreground">
                  Interne strippenkaart voor doorverwijzingen en hulp.
                </p>
              </div>
            </div>
            <p className="text-sm">
              Jouw saldo: <span className="font-semibold">0 RegioPunten</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Later voor beloningen en korting binnen OpenRegio.
            </p>
          </CardContent>
        </Card>

        {/* RegioBot - alleen voor Pro */}
        <Card data-testid="card-regiobot" className={!isPro ? "opacity-60" : ""}>
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-purple/10">
                <Bot className="w-5 h-5 text-regio-purple" />
              </div>
              <div>
                <h2 className="font-semibold">RegioBot AI</h2>
                <p className="text-sm text-muted-foreground">
                  Je persoonlijke AI-assistent voor marketing en juridisch.
                </p>
              </div>
            </div>
            {isPro ? (
              <div className="mt-2">
                <Link href="/regiobot">
                  <Button size="sm" data-testid="button-open-regiobot">
                    Open RegioBot
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Upgrade naar Pro om RegioBot te gebruiken.
                </p>
                <div className="mt-2">
                  <Link href="/lidmaatschap">
                    <Button size="sm" variant="outline" data-testid="button-upgrade-pro">
                      Upgrade naar Pro
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Admin sectie - alleen voor admin */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-regio-purple" />
            <h2 className="font-semibold text-lg">Admin Tools</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card data-testid="card-admin-export">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-regio-purple/10">
                    <Download className="w-5 h-5 text-regio-purple" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Nieuwe leden deze week</h2>
                    <p className="text-sm text-muted-foreground">
                      Download een lijst van ondernemers die deze week zijn aangesloten.
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href="/api/export/nieuwe-leden?days=7&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-7">
                      <Download className="w-4 h-4 mr-2" />
                      CSV (7 dagen)
                    </Button>
                  </a>
                  <a href="/api/export/nieuwe-leden?days=30&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-30">
                      <Download className="w-4 h-4 mr-2" />
                      CSV (30 dagen)
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-stats">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-regio-purple/10">
                    <Users className="w-5 h-5 text-regio-purple" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Platform statistieken</h2>
                    <p className="text-sm text-muted-foreground">
                      Overzicht van leden en activiteit op het platform.
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  <li>Totaal leden: wordt geladen...</li>
                  <li>Actieve profielen: wordt geladen...</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
