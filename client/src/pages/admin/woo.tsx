import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gavel, AlertCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

type WooStats = {
  byRegion: { name: string; cnt: number }[];
  byCategory: { name: string; cnt: number }[];
  byMonth: { month: string; cnt: number }[];
};

type WooRequest = {
  id: number;
  title: string;
  status: string;
  reference_code: string | null;
  created_at: string;
  region: string;
  authority: string;
  category: string;
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  sent:        { label: "Verzonden", variant: "outline" },
  received:    { label: "Ontvangen", variant: "secondary" },
  in_progress: { label: "In behandeling", variant: "default" },
  completed:   { label: "Afgerond", variant: "default" },
  rejected:    { label: "Afgewezen", variant: "outline" },
};

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1" data-testid={`bar-row-${label}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate max-w-[160px]">{label}</span>
        <span className="text-xs font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type OverdueDossier = {
  id: number;
  authority: string;
  subject: string;
  status: string;
  created_at: string;
  user_email: string;
  ingebreke_sent_at: string | null;
  dwangsom_contract_accepted_at: string | null;
};

export default function AdminWooPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<WooStats>({
    queryKey: ["/api/admin/woo/stats"],
  });

  const { data: reqData, isLoading: reqLoading } = useQuery<{ requests: WooRequest[]; total: number }>({
    queryKey: ["/api/admin/woo/requests"],
  });

  const { data: overdueData, isLoading: overdueLoading } = useQuery<{ overdue: OverdueDossier[] }>({
    queryKey: ["/api/admin/woo/dossiers/overdue"],
  });

  const maxRegion = Math.max(...(stats?.byRegion.map((r) => r.cnt) || [1]));
  const maxCat = Math.max(...(stats?.byCategory.map((c) => c.cnt) || [1]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-orange-600" />
            <h1 className="text-xl font-semibold" data-testid="heading-woo-monitoring">Woo-monitoring</h1>
          </div>
          <p className="text-sm text-muted-foreground">Platformoverzicht van alle Woo-verzoeken.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* By region */}
        <Card data-testid="card-woo-by-region">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Per regio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
              : stats?.byRegion.length === 0
              ? <p className="text-xs text-muted-foreground">Nog geen data</p>
              : stats?.byRegion.map((r) => (
                  <BarRow key={r.name} label={r.name} value={r.cnt} max={maxRegion} />
                ))}
          </CardContent>
        </Card>

        {/* By category */}
        <Card data-testid="card-woo-by-category">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Per categorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
              : stats?.byCategory.length === 0
              ? <p className="text-xs text-muted-foreground">Nog geen data</p>
              : stats?.byCategory.map((c) => (
                  <BarRow key={c.name} label={c.name} value={c.cnt} max={maxCat} />
                ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend */}
      <Card data-testid="card-woo-trend">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-semibold">Verzoeken per maand (6 maanden)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : stats?.byMonth.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nog geen data</p>
          ) : (
            <div className="flex items-end gap-2 h-20" data-testid="chart-monthly">
              {stats?.byMonth.map((m) => {
                const maxM = Math.max(...(stats.byMonth.map((x) => x.cnt) || [1]));
                const pct = maxM > 0 ? Math.round((m.cnt / maxM) * 100) : 0;
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-semibold">{m.cnt}</span>
                    <div className="w-full rounded-t-sm bg-primary/80" style={{ height: `${Math.max(pct, 4)}%` }} />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue controleslag dossiers */}
      <Card data-testid="card-woo-overdue">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-semibold">Vervallen controleslag-termijnen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {overdueLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
          ) : (overdueData?.overdue.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground">Geen vervallen dossiers.</p>
          ) : (
            <div className="space-y-2">
              {overdueData!.overdue.map((d) => {
                const daysOver = Math.ceil((Date.now() - new Date(d.created_at).getTime()) / 86400000) - 28;
                return (
                  <div
                    key={d.id}
                    className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20"
                    data-testid={`row-overdue-${d.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.authority} · <span className="text-destructive font-medium">{daysOver} dag{daysOver !== 1 ? "en" : ""} te laat</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{d.user_email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      {d.ingebreke_sent_at ? (
                        <>
                          <Badge variant="secondary" className="text-[10px]">In gebreke gesteld</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(d.ingebreke_sent_at).toLocaleDateString("nl-NL")}
                          </span>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">Actie vereist</Badge>
                      )}
                      {d.dwangsom_contract_accepted_at && (
                        <span className="text-[10px] text-muted-foreground">
                          Contract: {new Date(d.dwangsom_contract_accepted_at).toLocaleDateString("nl-NL")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests list */}
      <Card data-testid="card-woo-requests">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm font-semibold">Recente verzoeken</CardTitle>
            {reqData && (
              <span className="text-xs text-muted-foreground">Totaal: {reqData.total}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {reqLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
          ) : reqData?.requests.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Nog geen Woo-verzoeken ingediend.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reqData?.requests.map((r) => {
                const status = STATUS_LABELS[r.status] || { label: r.status, variant: "outline" as const };
                return (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
                    data-testid={`row-woo-${r.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.region && <span>{r.region} · </span>}
                        {r.category && <span>{r.category} · </span>}
                        {new Date(r.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="shrink-0 text-xs">
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
