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
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const actions = [
  {
    id: "brief",
    label: "Brief of besluit begrijpen",
    description: "Plak een overheidsbrief en ontvang direct uitleg, termijnen en aanbevolen acties.",
    icon: FileSearch,
    href: "/tools/brief-analyse",
    cta: "Brief analyseren",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "woo",
    label: "Woo-verzoek schrijven",
    description: "Vraag officieel informatie op bij een gemeente of overheidsinstantie.",
    icon: Gavel,
    href: "/woo-wizard",
    cta: "Verzoek starten",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    id: "zichtbaarheid",
    label: "Zichtbaarheid verbeteren",
    description: "Beheer je bedrijfsprofiel, controleer je website en versterk lokale vindbaarheid.",
    icon: Eye,
    href: "/bedrijfsprofiel",
    cta: "Profiel bekijken",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "samenwerken",
    label: "Samenwerking starten",
    description: "Zoek vakspecialisten in de regio via RegioCrew of ontdek collectieve deals.",
    icon: Users,
    href: "/regiocrew",
    cta: "Naar RegioCrew",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
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
          Begrijp regels, brieven en besluiten.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Wat wil je doen?
        </h2>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                data-testid={`card-action-${action.id}`}
                className="hover-elevate"
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 rounded-md p-2.5 ${action.bg}`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-sm leading-snug">{action.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <Link href={action.href}>
                      <Button
                        size="sm"
                        variant="outline"
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
