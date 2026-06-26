import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart2, TrendingUp, Users, Gavel, PieChart as PieIcon, Mail, Play, CheckCircle2, XCircle, UserX, UserMinus, Clock } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type InzichtData = {
  userGrowth: { month: string; cnt: number }[];
  wooGrowth: { month: string; cnt: number }[];
  topWooCategories: { name: string; cnt: number }[];
  planDistribution: { plan: string; cnt: number }[];
};

type NotificationLogEntry = {
  timestamp: string;
  triggeredBy: "cron" | "manual";
  scanned: number;
  sent: number;
  skippedNoMatch: number;
  skippedOptOut: number;
  skippedNoRegion: number;
  skippedNoEmail: number;
  failed: number;
};

const PLAN_COLORS = ["#3b82f6", "#f97316"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("nl-NL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminInzichtPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<InzichtData>({
    queryKey: ["/api/admin/inzicht"],
  });

  const { data: notifLog, isLoading: notifLogLoading } = useQuery<NotificationLogEntry[]>({
    queryKey: ["/api/admin/lokale-acties-notification-log"],
  });

  const triggerMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/lokale-acties-notifications"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lokale-acties-notification-log"] });
      toast({ title: "Notificatie-ronde gestart", description: "De mails worden nu verstuurd. Ververs de pagina over een moment voor de stats." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon de notificatie-ronde niet starten.", variant: "destructive" });
    },
  });

  const totalUsers = data?.planDistribution.reduce((a, b) => a + b.cnt, 0) || 0;
  const lastRun = notifLog?.[0];

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#ffffff", border: "1px solid #dce6f0", color: "#64748b", flexShrink: 0 }} data-testid="button-back">
          <ArrowLeft size={14} />
        </Link>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BarChart2 style={{ width: 24, height: 24, color: "#1f5fae" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-inzicht">Inzicht</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Gebruikersgroei, Woo-trends en ondernemersproblematiek.</p>
        </div>
      </div>

      {/* Lokale Acties notificatie-stats */}
      <Card data-testid="card-notification-stats">
        <CardHeader className="pb-2 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-sky-100 dark:bg-sky-950/50 text-sky-600">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Lokale Acties notificatie-mails</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending}
              data-testid="button-trigger-notifications"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Nu versturen
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Wordt wekelijks automatisch verstuurd (maandag 07:00). Laatste {notifLog?.length ?? 0} runs opgeslagen.
          </p>
        </CardHeader>
        <CardContent className="pb-4 space-y-4">
          {notifLogLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !notifLog?.length ? (
            <div className="flex items-center justify-center py-6">
              <p className="text-xs text-muted-foreground">Nog geen notificatie-ronde uitgevoerd.</p>
            </div>
          ) : (
            <>
              {/* Last run summary */}
              {lastRun && (
                <div className="rounded-md border p-3 space-y-3" data-testid="last-run-summary">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">Laatste run</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {lastRun.triggeredBy === "manual" ? "Handmatig" : "Automatisch"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(lastRun.timestamp)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-0.5" data-testid="stat-sent">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-medium">Verstuurd</span>
                      </div>
                      <span className="text-lg font-bold pl-5">{lastRun.sent}</span>
                    </div>
                    <div className="flex flex-col gap-0.5" data-testid="stat-no-region">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <UserX className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-medium">Zonder regio</span>
                      </div>
                      <span className="text-lg font-bold pl-5">{lastRun.skippedNoRegion}</span>
                    </div>
                    <div className="flex flex-col gap-0.5" data-testid="stat-opt-out">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <UserMinus className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-medium">Opt-out</span>
                      </div>
                      <span className="text-lg font-bold pl-5">{lastRun.skippedOptOut}</span>
                    </div>
                    <div className="flex flex-col gap-0.5" data-testid="stat-failed">
                      <div className="flex items-center gap-1.5 text-destructive">
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-medium">Mislukt</span>
                      </div>
                      <span className="text-lg font-bold pl-5">{lastRun.failed}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lastRun.scanned} leden gescand — {lastRun.skippedNoMatch} zonder passende acties in hun regio.
                  </p>
                </div>
              )}

              {/* History table */}
              {notifLog.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Geschiedenis</p>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tijdstip</th>
                          <th className="text-center px-3 py-2 font-medium text-muted-foreground">Verstuurd</th>
                          <th className="text-center px-3 py-2 font-medium text-muted-foreground">Opt-out</th>
                          <th className="text-center px-3 py-2 font-medium text-muted-foreground">Geen regio</th>
                          <th className="text-center px-3 py-2 font-medium text-muted-foreground">Mislukt</th>
                          <th className="text-center px-3 py-2 font-medium text-muted-foreground">Hoe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifLog.slice(1).map((entry, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`notif-log-row-${idx}`}>
                            <td className="px-3 py-2 text-muted-foreground">{formatTimestamp(entry.timestamp)}</td>
                            <td className="px-3 py-2 text-center font-medium text-emerald-600 dark:text-emerald-400">{entry.sent}</td>
                            <td className="px-3 py-2 text-center text-muted-foreground">{entry.skippedOptOut}</td>
                            <td className="px-3 py-2 text-center text-amber-600 dark:text-amber-400">{entry.skippedNoRegion}</td>
                            <td className="px-3 py-2 text-center text-destructive">{entry.failed}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant="secondary" className="text-[10px]">
                                {entry.triggeredBy === "manual" ? "Handmatig" : "Auto"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Growth charts side by side */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* User growth area chart */}
        <Card data-testid="card-user-growth">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                <Users className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Ledengroei (6 maanden)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : !data?.userGrowth.length ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Nog geen data beschikbaar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={data.userGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cnt"
                    name="Leden"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gradUsers)"
                    dot={{ fill: "#3b82f6", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Woo growth area chart */}
        <Card data-testid="card-woo-growth">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-orange-100 dark:bg-orange-950/50 text-orange-600">
                <Gavel className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Woo-verzoeken (6 maanden)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : !data?.wooGrowth.length ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Nog geen data beschikbaar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={data.wooGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradWoo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cnt"
                    name="Verzoeken"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#gradWoo)"
                    dot={{ fill: "#f97316", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Pie + Bar */}
      <div className="grid sm:grid-cols-5 gap-4">

        {/* Plan pie chart */}
        <Card className="sm:col-span-2" data-testid="card-plan-distribution">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-violet-100 dark:bg-violet-950/50 text-violet-600">
                <PieIcon className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Plan-verdeling</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : !data?.planDistribution.length ? (
              <p className="text-xs text-muted-foreground">Nog geen data</p>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={data.planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      dataKey="cnt"
                      nameKey="plan"
                      paddingAngle={3}
                    >
                      {data.planDistribution.map((_, i) => (
                        <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        const pct = totalUsers > 0 ? Math.round((d.cnt / totalUsers) * 100) : 0;
                        return (
                          <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-xs">
                            <p className="font-semibold capitalize">{d.plan}</p>
                            <p className="text-muted-foreground">{d.cnt} leden ({pct}%)</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {data.planDistribution.map((d, i) => {
                    const pct = totalUsers > 0 ? Math.round((d.cnt / totalUsers) * 100) : 0;
                    return (
                      <div key={d.plan} className="flex items-center justify-between gap-2" data-testid={`plan-row-${d.plan}`}>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                          <span className="text-xs capitalize font-medium">{d.plan}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{d.cnt} leden</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5">{pct}%</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top WOO categories bar chart */}
        <Card className="sm:col-span-3" data-testid="card-top-categories">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Trending Woo-onderwerpen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : !data?.topWooCategories.length ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Nog geen data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={188}>
                <BarChart
                  data={data.topWooCategories}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={100}
                    tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 14) + "…" : v}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cnt" name="Verzoeken" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  </div>
  );
}
