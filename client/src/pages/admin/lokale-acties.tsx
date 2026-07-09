import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Play, Clock, CheckCircle2, RefreshCw, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

type CleanupLogEntry = {
  timestamp: string;
  markedVerlopen: number;
  deletedOld: number;
  triggeredBy: "cron" | "manual";
};

function formatTs(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy 'om' HH:mm", { locale: nl });
  } catch {
    return iso;
  }
}

export default function AdminLokaleActiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: log, isLoading } = useQuery<CleanupLogEntry[]>({
    queryKey: ["/api/admin/lokale-acties-cleanup-log"],
  });

  const { mutate: triggerCleanup, isPending } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/lokale-acties-cleanup"),
    onSuccess: async (res) => {
      const result = await res.json() as { markedVerlopen: number; deletedOld: number };
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/lokale-acties-cleanup-log"] });
      toast({
        title: "Opschoning uitgevoerd",
        description: `${result.markedVerlopen} acties op verlopen gezet, ${result.deletedOld} definitief verwijderd.`,
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "De opschoning kon niet worden uitgevoerd.",
        variant: "destructive",
      });
    },
  });

  const latest = log?.[0];

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#ffffff", border: "1px solid #dce6f0", color: "#64748b", flexShrink: 0 }} data-testid="button-back">
          <ArrowLeft size={14} />
        </Link>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarDays style={{ width: 24, height: 24, color: "#f28a1a" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-lokale-acties-cleanup">Lokale Acties beheren</h1>
          <div>
          </div>
          <p className="text-sm text-muted-foreground">
            Verlopen acties markeren en verouderde acties definitief verwijderen.
          </p>
        </div>
      </div>

      {/* Latest result + trigger */}
      <Card data-testid="card-cleanup-latest">
        <CardHeader className="pb-3 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold">Laatste opschoning</CardTitle>
            <Button
              size="default"
              onClick={() => triggerCleanup()}
              disabled={isPending}
              data-testid="button-run-cleanup"
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Nu opschonen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : !latest ? (
            <p className="text-sm text-muted-foreground">Nog geen opschoning uitgevoerd.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{formatTs(latest.timestamp)}</span>
                <Badge
                  variant="secondary"
                  className={latest.triggeredBy === "manual"
                    ? "bg-[#0b2240]/10 text-[#0b2240] dark:bg-[#0b2240]/30 dark:text-[#0b2240]/30"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}
                  data-testid="badge-triggered-by"
                >
                  {latest.triggeredBy === "manual" ? "Handmatig" : "Automatisch"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border bg-muted/30 px-4 py-3" data-testid="stat-marked-verlopen">
                  <p className="text-2xl font-bold">{latest.markedVerlopen}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Op verlopen gezet</p>
                </div>
                <div className="rounded-md border bg-muted/30 px-4 py-3" data-testid="stat-deleted-old">
                  <p className="text-2xl font-bold">{latest.deletedOld}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Definitief verwijderd</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History log */}
      <Card data-testid="card-cleanup-log">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-semibold">Opschoning-geschiedenis</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !log?.length ? (
            <p className="text-sm text-muted-foreground">Nog geen geschiedenis beschikbaar.</p>
          ) : (
            <div className="space-y-1.5" data-testid="list-cleanup-log">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 bg-muted/30 text-sm"
                  data-testid={`log-entry-${i}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#f28a1a] shrink-0" />
                    <span className="text-muted-foreground truncate">{formatTs(entry.timestamp)}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] shrink-0 ${entry.triggeredBy === "manual"
                        ? "bg-[#0b2240]/10 text-[#0b2240] dark:bg-[#0b2240]/30 dark:text-[#0b2240]/30"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {entry.triggeredBy === "manual" ? "Handmatig" : "Cron"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs">
                      <strong>{entry.markedVerlopen}</strong>
                      <span className="text-muted-foreground ml-1">verlopen</span>
                    </span>
                    <span className="text-xs">
                      <strong>{entry.deletedOld}</strong>
                      <span className="text-muted-foreground ml-1">verwijderd</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  </div>
  );
}
