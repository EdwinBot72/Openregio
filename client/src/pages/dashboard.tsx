import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  FileSearch,
  Globe,
  MapPin,
  MessageSquare,
  Shield,
  UserPlus,
  Activity,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const REGELS_DATA = [
  { datum: "12-02", onderwerp: "Herinrichting Marktplein", type: "Aanbesteding" },
  { datum: "10-02", onderwerp: "Subsidie Verduurzaming Bedrijfspanden", type: "Subsidie" },
  { datum: "08-02", onderwerp: "Nieuwe aanbesteding gemeentelijk groen", type: "Aanbesteding" },
];

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string; status: string; regio: string } | null>({
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-welcome">
            Hallo, {displayName}
          </h1>
          <Badge variant={isPro ? "default" : "outline"} className="text-xs" data-testid="badge-plan">
            {isPro ? "Pro" : "Basis"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Begrijp regels, brieven en besluiten.
        </p>
      </div>

      {/* Kaarten */}
      <div className="space-y-3">

        {/* 1. Regels */}
        <Card data-testid="card-regels">
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-medium text-sm">Regels in jouw regio</h2>
                </div>
                <p className="text-xs text-muted-foreground">Recente publicaties van de gemeente</p>
              </div>
              <Link href="/beleidsmonitor">
                <Button size="sm" variant="ghost" className="text-xs shrink-0" data-testid="button-naar-regelmonitor">
                  Alles zien <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="divide-y rounded-md border">
              {REGELS_DATA.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0" data-testid={`text-regel-datum-${i}`}>{r.datum}</span>
                    <span className="truncate font-medium" data-testid={`text-regel-onderwerp-${i}`}>{r.onderwerp}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2 shrink-0" data-testid={`badge-regel-type-${i}`}>{r.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. Brief analyse */}
        <Card data-testid="card-brief">
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-medium text-sm">Begrijp een brief</h2>
                </div>
                <p className="text-xs text-muted-foreground">Plak een overheidsbrief en ontvang direct uitleg</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm rounded-md bg-muted/40 px-4 py-3">
              <span className="text-muted-foreground text-xs">Afzender</span>
              <span className="text-xs font-medium">Gemeente Utrecht</span>
              <span className="text-muted-foreground text-xs">Type</span>
              <span className="text-xs font-medium">Besluit</span>
              <span className="text-muted-foreground text-xs">Termijn</span>
              <span className="text-xs font-medium">Bezwaar binnen 6 weken</span>
              <span className="text-muted-foreground text-xs">Aanbevolen actie</span>
              <span className="text-xs font-medium">Controleer inhoud</span>
            </div>

            <Link href="/tools/brief-analyse">
              <Button size="sm" data-testid="button-analyseer-document">
                Analyseer een document
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. RegioBot */}
        <Card data-testid="card-vraag">
          <CardContent className="pt-5 pb-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-medium text-sm">Stel een vraag</h2>
              </div>
              <p className="text-xs text-muted-foreground">RegioBot zoekt in officiële WOO-documenten</p>
            </div>

            <ul className="text-xs text-muted-foreground space-y-1 pl-1">
              <li>"Mag mijn terras groter?"</li>
              <li>"Moet ik reageren op deze brief?"</li>
              <li>"Welke subsidie bestaat er voor verduurzaming?"</li>
            </ul>

            <Link href="/regiobot">
              <Button size="sm" variant="outline" data-testid="button-naar-regiobot">
                Naar RegioBot
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 4. Zichtbaarheid */}
        <Card data-testid="card-zichtbaarheid">
          <CardContent className="pt-5 pb-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-medium text-sm">Digitale zichtbaarheid</h2>
              </div>
              <p className="text-xs text-muted-foreground">Controleer je aanwezigheid online</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/zichtbaarheid/website-onderhoud">
                <Button size="sm" variant="outline" data-testid="button-website-check">
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  Website check
                </Button>
              </Link>
              <Link href="/zichtbaarheid/vindbaarheid">
                <Button size="sm" variant="outline" data-testid="button-lokale-vindbaarheid">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  Lokale vindbaarheid
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Admin sectie */}
      {isAdmin && (
        <section className="space-y-4 pt-4 border-t">
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
                    <Button size="sm" variant="outline" data-testid="button-export-csv-7">CSV (7 dagen)</Button>
                  </a>
                  <a href="/api/export/nieuwe-leden?days=30&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-30">CSV (30 dagen)</Button>
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
