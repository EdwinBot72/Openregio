import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2 } from "lucide-react";
import { Link } from "wouter";

type InzichtData = {
  userGrowth: { month: string; cnt: number }[];
  wooGrowth: { month: string; cnt: number }[];
  topWooCategories: { name: string; cnt: number }[];
  planDistribution: { plan: string; cnt: number }[];
};

function MiniChart({ data, color = "bg-primary" }: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-muted-foreground">{d.value}</span>
            <div
              className={`w-full rounded-t-sm ${color}`}
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PlanDonut({ data }: { data: { plan: string; cnt: number }[] }) {
  const total = data.reduce((a, b) => a + b.cnt, 0);
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.cnt / total) * 100) : 0;
        return (
          <div key={d.plan} className="space-y-1" data-testid={`plan-row-${d.plan}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs capitalize font-medium">{d.plan || "basic"}</span>
              <span className="text-xs text-muted-foreground">{d.cnt} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${d.plan === "pro" ? "bg-orange-500" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminInzichtPage() {
  const { data, isLoading } = useQuery<InzichtData>({
    queryKey: ["/api/admin/inzicht"],
  });

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
            <BarChart2 className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-semibold" data-testid="heading-inzicht">Platform-inzicht</h1>
          </div>
          <p className="text-sm text-muted-foreground">Gebruikersgroei, Woo-trends en ondernemersproblematiek.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">

        {/* User growth */}
        <Card data-testid="card-user-growth">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Ledengroei (6 maanden)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !data?.userGrowth.length ? (
              <p className="text-xs text-muted-foreground">Nog geen data beschikbaar</p>
            ) : (
              <MiniChart
                color="bg-blue-500"
                data={data.userGrowth.map((d) => ({ label: d.month, value: d.cnt }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Woo growth */}
        <Card data-testid="card-woo-growth">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Woo-verzoeken (6 maanden)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !data?.wooGrowth.length ? (
              <p className="text-xs text-muted-foreground">Nog geen data beschikbaar</p>
            ) : (
              <MiniChart
                color="bg-orange-500"
                data={data.wooGrowth.map((d) => ({ label: d.month, value: d.cnt }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Plan distribution */}
        <Card data-testid="card-plan-distribution">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Plan-verdeling</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !data?.planDistribution.length ? (
              <p className="text-xs text-muted-foreground">Nog geen data</p>
            ) : (
              <PlanDonut data={data.planDistribution} />
            )}
          </CardContent>
        </Card>

        {/* Top woo categories */}
        <Card data-testid="card-top-categories">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Trending Woo-onderwerpen</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : !data?.topWooCategories.length ? (
              <p className="text-xs text-muted-foreground">Nog geen data</p>
            ) : (
              data.topWooCategories.map((c, i) => {
                const max = data.topWooCategories[0]?.cnt || 1;
                const pct = Math.round((c.cnt / max) * 100);
                return (
                  <div key={c.name} className="space-y-1" data-testid={`category-row-${i}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">{c.name}</span>
                      <span className="text-xs font-semibold">{c.cnt}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
