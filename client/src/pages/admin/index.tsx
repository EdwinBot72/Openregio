import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, Gavel, MapPin, TrendingUp, ArrowRight,
  FileText, BarChart2, ShieldCheck, Landmark, Building2, BookOpen,
  TrendingDown, Euro, Activity, Sparkles, Lock,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

type AdminStats = {
  users: { total: number; byPlan: Record<string, number> };
  woo: { total: number; byStatus: Record<string, number>; thisMonth: number };
  regions: number;
  crewProfiles: number;
  newUsersLast30Days: number;
  growthPct: number | null;
  revenueMonthly: number;
  dailySignups: { day: string; cnt: number }[];
  recentUsers: { email: string; firstName: string; lastName: string; plan: string; createdAt: string }[];
};

function initials(first: string, last: string, email: string) {
  if (first || last) return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
  return email[0]?.toUpperCase() || "?";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u geleden`;
  return `${Math.floor(hrs / 24)}d geleden`;
}

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const sections = [
  { id: "woo", href: "/admin/woo", icon: Gavel, title: "Woo-monitoring", description: "Verzoeken per status, regio en categorie.", color: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" },
  { id: "regios", href: "/admin/regios", icon: MapPin, title: "Regio-beheer", description: "Regio's toevoegen en beheren.", color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
  { id: "inzicht", href: "/admin/inzicht", icon: BarChart2, title: "Platform-inzicht", description: "Groei en trends in detail.", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
  { id: "users", href: "/admin/users", icon: Users, title: "Gebruikers", description: "Accounts aanmaken en beheren.", color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
  { id: "blogs", href: "/admin/blogs", icon: FileText, title: "Blogs", description: "Publiceer redactionele content.", color: "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400" },
  { id: "commissions", href: "/admin/commissions", icon: TrendingUp, title: "Affiliates & Commissies", description: "Overzicht en uitbetaling.", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
  { id: "regio-deals", href: "/admin/regio-deals", icon: Landmark, title: "Regio Deals", description: "Collectieve deals voor leden.", color: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400" },
  { id: "ondernemers", href: "/admin/ondernemers", icon: Building2, title: "Ondernemers", description: "Leden met activiteits- en planstatus.", color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
  { id: "wetgeving", href: "/admin/wetgeving", icon: BookOpen, title: "Wetgeving Inzendingen", description: "Verwerk brieven van leden.", color: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400" },
  { id: "betalingen", href: "/admin/betalingen", icon: Euro, title: "Betalingen", description: "Mollie-subscriptions en betalingsstatus.", color: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" },
];

function KpiCard({
  title, value, sub, icon: Icon, iconColor, trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: { value: number | null; label: string };
}) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className={`rounded-lg p-2 ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          {trend?.value !== null && trend?.value !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SparklineCard({
  title, value, sub, data, color, icon: Icon, iconColor,
}: {
  title: string;
  value: string | number;
  sub?: string;
  data: { day: string; cnt: number }[];
  color: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card data-testid={`sparkline-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="pt-5 pb-3 px-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className={`rounded-lg p-2 ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight mb-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mb-3">{sub}</p>}
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cnt"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${title})`}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border rounded-md shadow-sm px-2 py-1 text-xs">
                      <p className="font-medium">{payload[0].payload.day}</p>
                      <p className="text-muted-foreground">{payload[0].value} aanmeldingen</p>
                    </div>
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminIndexPage() {
  usePageTitle("Admin Cockpit");
  const { user, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !authLoading && (user?.role === "admin" || user?.role === "master" || !!user?.isAdmin),
  });

  const isAdmin = user?.role === "admin" || user?.role === "master" || !!user?.isAdmin;

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-1 py-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4" data-testid="page-admin-gate">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Geen toegang</h1>
        <p className="text-muted-foreground">
          Deze pagina is alleen toegankelijk voor platformbeheerders.
        </p>
        <Button asChild>
          <Link href="/vandaag">Terug naar dashboard</Link>
        </Button>
      </div>
    );
  }

  const proCount = stats?.users.byPlan?.pro ?? 0;
  const basicCount = stats?.users.byPlan?.basic ?? 0;
  const totalUsers = stats?.users.total ?? 0;
  const proPct = totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-1">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(213,70%,36%)] to-[hsl(213,70%,24%)] text-white px-6 py-7 shadow-md">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 opacity-80" />
            <h1 className="text-xl font-bold" data-testid="heading-admin">Admin Cockpit</h1>
            <Badge className="bg-white/20 text-white border-0 text-xs">OpenRegio</Badge>
          </div>
          <p className="text-sm text-white/70">Overzicht van het platform, leden en activiteit.</p>

          {isLoading ? null : (
            <div className="flex flex-wrap gap-6 mt-5">
              <div>
                <p className="text-3xl font-bold">{stats?.users.total ?? 0}</p>
                <p className="text-xs text-white/60 mt-0.5">Totaal leden</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold">{proCount}</p>
                <p className="text-xs text-white/60 mt-0.5">Pro bijdragers</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold">€{stats?.revenueMonthly.toFixed(0) ?? "0"}</p>
                <p className="text-xs text-white/60 mt-0.5">Geschatte omzet / maand</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold">+{stats?.newUsersLast30Days ?? 0}</p>
                <p className="text-xs text-white/60 mt-0.5">Nieuwe leden (30d)</p>
              </div>
            </div>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-16 top-12 h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-6 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="grid-stats">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 pb-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <KpiCard
              title="Woo-verzoeken"
              value={stats?.woo.total ?? 0}
              sub={`+${stats?.woo.thisMonth ?? 0} deze maand`}
              icon={Gavel}
              iconColor="bg-orange-100 dark:bg-orange-950/50 text-orange-600"
              data-testid="kpi-woo"
            />
            <KpiCard
              title="Pro / Basis"
              value={`${proCount} / ${basicCount}`}
              sub={`${proPct}% is Pro`}
              icon={ShieldCheck}
              iconColor="bg-violet-100 dark:bg-violet-950/50 text-violet-600"
            />
            <KpiCard
              title="Regio's actief"
              value={stats?.regions ?? 0}
              sub={`Crew: ${stats?.crewProfiles ?? 0} profielen`}
              icon={MapPin}
              iconColor="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600"
            />
            <KpiCard
              title="Groei (30 dagen)"
              value={`+${stats?.newUsersLast30Days ?? 0}`}
              sub="nieuwe leden"
              icon={Sparkles}
              iconColor="bg-blue-100 dark:bg-blue-950/50 text-blue-600"
              trend={stats?.growthPct !== null ? { value: stats?.growthPct ?? null, label: "vs vorige maand" } : undefined}
            />
          </>
        )}
      </div>

      {/* ── Sparkline + recent users ── */}
      <div className="grid sm:grid-cols-5 gap-4">
        {/* Daily signups sparkline */}
        <div className="sm:col-span-3">
          {isLoading ? (
            <Card><CardContent className="pt-5 pb-5"><Skeleton className="h-36 w-full" /></CardContent></Card>
          ) : (
            <SparklineCard
              title="Aanmeldingen (14 dagen)"
              value={stats?.newUsersLast30Days ?? 0}
              sub="leden in de afgelopen 30 dagen"
              data={stats?.dailySignups ?? []}
              color="hsl(213, 70%, 50%)"
              icon={Activity}
              iconColor="bg-blue-100 dark:bg-blue-950/50 text-blue-600"
            />
          )}
        </div>

        {/* Recent users */}
        <Card className="sm:col-span-2" data-testid="card-recent-users">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Nieuwste leden</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
            ) : !stats?.recentUsers.length ? (
              <p className="text-xs text-muted-foreground">Nog geen leden</p>
            ) : (
              stats.recentUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2.5" data-testid={`recent-user-${i}`}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[11px] bg-muted">
                      {initials(u.firstName, u.lastName, u.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.email}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(u.createdAt)}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] shrink-0 ${PLAN_COLORS[u.plan] ?? ""}`}>
                    {u.plan}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Plan distribution bar ── */}
      {!isLoading && totalUsers > 0 && (
        <Card data-testid="card-plan-bar">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-semibold">Plan-verdeling</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span className="text-xs text-muted-foreground">Pro ({proCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Basis ({basicCount})</span>
                </div>
              </div>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
              {proCount > 0 && (
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${proPct}%` }}
                  title={`Pro: ${proCount} (${proPct}%)`}
                />
              )}
              {basicCount > 0 && (
                <div
                  className="h-full bg-blue-500 flex-1"
                  title={`Basis: ${basicCount}`}
                />
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">{proPct}% Pro</span>
              <span className="text-xs text-muted-foreground">{100 - proPct}% Basis</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Sections grid ── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Beheersecties</h2>
        <div className="grid sm:grid-cols-3 gap-3" data-testid="grid-sections">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.id} href={s.href}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-section-${s.id}`}>
                  <CardContent className="pt-4 pb-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 rounded-lg p-2.5 ${s.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
