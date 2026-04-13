import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart2, TrendingUp, Users, Gavel, PieChart as PieIcon } from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type InzichtData = {
  userGrowth: { month: string; cnt: number }[];
  wooGrowth: { month: string; cnt: number }[];
  topWooCategories: { name: string; cnt: number }[];
  planDistribution: { plan: string; cnt: number }[];
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

export default function AdminInzichtPage() {
  const { data, isLoading } = useQuery<InzichtData>({
    queryKey: ["/api/admin/inzicht"],
  });

  const totalUsers = data?.planDistribution.reduce((a, b) => a + b.cnt, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-1">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-semibold" data-testid="heading-inzicht">Platform-inzicht</h1>
          </div>
          <p className="text-sm text-muted-foreground">Gebruikersgroei, Woo-trends en ondernemersproblematiek.</p>
        </div>
      </div>

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
  );
}
