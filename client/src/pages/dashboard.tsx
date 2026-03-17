import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  Eye,
  Shield,
  UserPlus,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_ACTIONS } from "@/config/dashboardActions";

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

  const actions = DASHBOARD_ACTIONS.map((action) => ({
    id: action.id,
    label: action.label,
    description: action.description(isPro),
    icon: action.icon,
    href: action.href(isPro),
    cta: action.cta(isPro),
    color: action.color(isPro),
    bg: action.bg(isPro),
    proOnly: action.proOnly(isPro),
    badge: action.badge(isPro),
  }));

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
                        ? <Lock className="h-5 w-5 text-muted-foreground" />
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
