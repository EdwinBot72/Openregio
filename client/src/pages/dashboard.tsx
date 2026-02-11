import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  FileUp,
  FileText,
  Download,
  Shield,
  Users,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string; status: string; regio: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
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
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold" data-testid="text-welcome">
            Welkom, {displayName}
          </h1>
          <Badge variant={isPro ? "default" : "secondary"} data-testid="badge-plan">
            {isPro ? "Pro-bijdrager" : "Basis-lid"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Kies wat je wilt doen. Geen omwegen, direct aan de slag.
        </p>
      </header>

      <section className="space-y-4">
        <Card data-testid="card-regio-analyse" className="hover-elevate">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <BarChart3 className="w-5 h-5 text-regio-blue" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Regio-analyse</h2>
                <p className="text-sm text-muted-foreground">
                  Ontdek in 8 vragen waar jouw regio sterk in is en waar kansen liggen.
                </p>
              </div>
            </div>
            <div className="mt-1">
              <Link href="/regio-analyse">
                <Button size="sm" data-testid="button-start-analyse">
                  Start analyse
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-upload-brief" className="hover-elevate">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <FileUp className="w-5 h-5 text-regio-blue" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Brief uploaden</h2>
                <p className="text-sm text-muted-foreground">
                  Upload een brief of document. We checken het en geven verbetersuggesties.
                </p>
              </div>
              {!isPro && (
                <Badge variant="secondary" className="text-[10px] shrink-0">1x per dag</Badge>
              )}
            </div>
            <div className="mt-1">
              <Link href="/woo-bibliotheek">
                <Button size="sm" data-testid="button-upload-brief">
                  Upload document
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-woo-verzoek" className="hover-elevate">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-regio-blue/10">
                <FileText className="w-5 h-5 text-regio-blue" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Signaalinstrument</h2>
                <p className="text-sm text-muted-foreground">
                  Stel bestuursorganen op scherp met een juridische kennisgeving over bevoegdheid en mandaat.
                </p>
              </div>
            </div>
            <div className="mt-1">
              <Link href="/woo-wizard">
                <Button size="sm" data-testid="button-woo-wizard">
                  Brief opstellen
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {isAdmin && (
        <section className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card data-testid="card-admin-export">
              <CardContent className="p-5 flex flex-col gap-3">
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
              <CardContent className="p-5 flex flex-col gap-3">
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
