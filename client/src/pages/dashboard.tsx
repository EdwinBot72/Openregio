import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Download,
  FileSearch,
  Globe,
  MapPin,
  MessageSquare,
  Shield,
  UserPlus,
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
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
        </Card>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold" data-testid="text-welcome">
            Hallo, {displayName}
          </h1>
          <Badge variant={isPro ? "default" : "secondary"} data-testid="badge-plan">
            {isPro ? "Pro" : "Basis"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Begrijp regels, brieven en besluiten.
        </p>
      </header>

      <div className="space-y-4">
        {/* Blok 1: Regels in jouw regio */}
        <Card data-testid="card-regels">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#1f5fae]/10">
                <Activity className="h-5 w-5 text-[#1f5fae]" />
              </div>
              <div>
                <h2 className="font-semibold">Regels in jouw regio</h2>
                <p className="text-sm text-muted-foreground">Wat verandert er bij de gemeente</p>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Datum</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Onderwerp</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {REGELS_DATA.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 text-muted-foreground whitespace-nowrap" data-testid={`text-regel-datum-${i}`}>{r.datum}</td>
                      <td className="p-3 font-medium" data-testid={`text-regel-onderwerp-${i}`}>{r.onderwerp}</td>
                      <td className="p-3">
                        <Badge variant="secondary" data-testid={`badge-regel-type-${i}`}>{r.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link href="/beleidsmonitor">
              <Button size="sm" variant="outline" data-testid="button-naar-regelmonitor">
                Bekijk regelmonitor
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Blok 2: Begrijp een brief */}
        <Card data-testid="card-brief">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#f28a1a]/10">
                <FileSearch className="h-5 w-5 text-[#f28a1a]" />
              </div>
              <div>
                <h2 className="font-semibold">Begrijp een brief</h2>
                <p className="text-sm text-muted-foreground">Analyseer een overheidsbrief of besluit</p>
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-muted-foreground">Afzender</span>
                <span className="font-medium">Gemeente Utrecht</span>
                <span className="text-muted-foreground">Type document</span>
                <span className="font-medium">Besluit</span>
                <span className="text-muted-foreground">Termijn</span>
                <span className="font-medium">Bezwaar binnen 6 weken</span>
                <span className="text-muted-foreground">Aanbevolen actie</span>
                <span className="font-medium">Controleer inhoud</span>
              </div>
            </div>

            <Link href="/tools/brief-analyse">
              <Button size="sm" data-testid="button-analyseer-document">
                Analyseer een document
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Blok 3: Stel een vraag */}
        <Card data-testid="card-vraag">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#1f5fae]/10">
                <MessageSquare className="h-5 w-5 text-[#1f5fae]" />
              </div>
              <div>
                <h2 className="font-semibold">Stel een vraag</h2>
                <p className="text-sm text-muted-foreground">RegioBot beantwoordt vragen over regels en brieven</p>
              </div>
            </div>

            <div className="rounded-md bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Voorbeeldvragen:</p>
              <ul className="space-y-1 list-none">
                <li>"Mag mijn terras groter?"</li>
                <li>"Moet ik reageren op deze brief?"</li>
                <li>"Welke subsidie bestaat er voor verduurzaming?"</li>
              </ul>
            </div>

            <Link href="/regiobot">
              <Button size="sm" variant="outline" data-testid="button-naar-regiobot">
                Naar RegioBot
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Blok 4: Digitale zichtbaarheid */}
        <Card data-testid="card-zichtbaarheid">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold">Digitale zichtbaarheid</h2>
                <p className="text-sm text-muted-foreground">Controleer je aanwezigheid online</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/zichtbaarheid/website-onderhoud">
                <Button size="sm" variant="outline" data-testid="button-website-check">
                  <Globe className="h-4 w-4 mr-1.5" />
                  Website check
                </Button>
              </Link>
              <Link href="/zichtbaarheid/vindbaarheid">
                <Button size="sm" variant="outline" data-testid="button-lokale-vindbaarheid">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Lokale vindbaarheid
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <section className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card data-testid="card-admin-export">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Leden export</h3>
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
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Gebruiker aanmaken</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maak gratis accounts aan voor vrienden en kennissen.
                </p>
                <Link href="/admin/users">
                  <Button size="sm" data-testid="button-admin-create-user">
                    Nieuw account
                    <ArrowRight className="w-4 h-4 ml-1" />
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
