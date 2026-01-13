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

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{
    naam: string;
    status: string;
    cashMogelijk?: boolean;
    bonnenblok?: boolean;
    papierenTelefoonlijst?: boolean;
    offlineWerken?: boolean;
    noodstroom?: boolean;
    basischeckIngevuld?: boolean;
  } | null>({
    queryKey: ["/api/business-profile/me"],
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

  // Bereken score uit bedrijfsprofiel data
  const basischeckScore = [
    bedrijfsprofiel?.cashMogelijk,
    bedrijfsprofiel?.bonnenblok,
    bedrijfsprofiel?.papierenTelefoonlijst,
    bedrijfsprofiel?.offlineWerken,
    bedrijfsprofiel?.noodstroom,
  ].filter(Boolean).length;
  const basischeckDone = !!bedrijfsprofiel?.basischeckIngevuld;

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
              <div className="p-2 rounded-full bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
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

        {/* Netwerk */}
        <Card data-testid="card-netwerk">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Netwerk</h2>
                <p className="text-sm text-muted-foreground">
                  Deel vragen, aanbiedingen, leads en events met ondernemers in jouw regio.
                </p>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              <li>Plaats een vraag of aanbod</li>
              <li>Deel leads met andere ondernemers</li>
              <li>Organiseer lokale events</li>
            </ul>
            <div className="mt-2">
              <Link href="/community">
                <Button size="sm" data-testid="button-view-network">
                  Naar Netwerk
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Basischeck / offline modus */}
        <Card data-testid="card-basischeck">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
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
              <div className="p-2 rounded-full bg-primary/10">
                <Printer className="w-5 h-5 text-primary" />
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
              <div className="p-2 rounded-full bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
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
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
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
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Admin Tools</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card data-testid="card-admin-export">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Download className="w-5 h-5 text-primary" />
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
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
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
