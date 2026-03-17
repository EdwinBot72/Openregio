import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Gavel, MapPin, Users2, TrendingUp, ArrowRight,
  FileText, BarChart2, ShieldCheck, Landmark, Building2,
} from "lucide-react";
import { Link } from "wouter";

type AdminStats = {
  users: { total: number; byPlan: Record<string, number> };
  woo: { total: number; byStatus: Record<string, number> };
  regions: number;
  crewProfiles: number;
  newUsersLast30Days: number;
};

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-md p-2.5 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const sections = [
  {
    id: "woo",
    href: "/admin/woo",
    icon: Gavel,
    title: "Woo-monitoring",
    description: "Verzoeken per status, regio en categorie. Zie waar ondernemers tegenaan lopen.",
    color: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
  },
  {
    id: "regios",
    href: "/admin/regios",
    icon: MapPin,
    title: "Regio-beheer",
    description: "Regio's toevoegen, aanpassen en koppelen aan de rest van het platform.",
    color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  },
  {
    id: "inzicht",
    href: "/admin/inzicht",
    icon: BarChart2,
    title: "Platform-inzicht",
    description: "Gebruikersgroei, Woo-trends en ondernemersproblematiek in kaart.",
    color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "users",
    href: "/admin/users",
    icon: Users,
    title: "Gebruikers",
    description: "Accounts aanmaken, activatielinks sturen.",
    color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  },
  {
    id: "blogs",
    href: "/admin/blogs",
    icon: FileText,
    title: "Blogs",
    description: "Publiceer en beheer redactionele content.",
    color: "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400",
  },
  {
    id: "commissions",
    href: "/admin/commissions",
    icon: TrendingUp,
    title: "Affiliates & Commissies",
    description: "Overzicht en uitbetaling van affiliate commissies.",
    color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  },
  {
    id: "regio-deals",
    href: "/admin/regio-deals",
    icon: Landmark,
    title: "Regio Deals",
    description: "Beheer collectieve deals en voordelen voor leden.",
    color: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
  },
  {
    id: "ondernemers",
    href: "/admin/ondernemers",
    icon: Building2,
    title: "Ondernemers",
    description: "Overzicht van geregistreerde leden met activiteits- en planstatus.",
    color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  },
];

export default function AdminIndexPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold" data-testid="heading-admin">Admin Cockpit</h1>
        </div>
        <p className="text-sm text-muted-foreground">Platformoverzicht en beheer van OpenRegio.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="grid-stats">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 pb-5"><Skeleton className="h-14 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard
              title="Leden totaal"
              value={stats?.users.total ?? 0}
              sub={`+${stats?.newUsersLast30Days ?? 0} deze maand`}
              icon={Users}
              color="bg-blue-50 dark:bg-blue-950/40 text-blue-600"
            />
            <StatCard
              title="Pro-bijdragers"
              value={stats?.users.byPlan?.pro ?? 0}
              sub={`Basis: ${stats?.users.byPlan?.basic ?? 0}`}
              icon={ShieldCheck}
              color="bg-orange-50 dark:bg-orange-950/40 text-orange-600"
            />
            <StatCard
              title="Woo-verzoeken"
              value={stats?.woo.total ?? 0}
              sub={`Actief: ${(stats?.woo.byStatus?.sent ?? 0) + (stats?.woo.byStatus?.in_progress ?? 0)}`}
              icon={Gavel}
              color="bg-amber-50 dark:bg-amber-950/40 text-amber-600"
            />
            <StatCard
              title="Regio's"
              value={stats?.regions ?? 0}
              sub={`Crew: ${stats?.crewProfiles ?? 0}`}
              icon={MapPin}
              color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
            />
          </>
        )}
      </div>

      {/* Sections */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Beheersecties</h2>
        <div className="grid sm:grid-cols-2 gap-3" data-testid="grid-sections">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.id} className="hover-elevate" data-testid={`card-section-${s.id}`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 rounded-md p-2 ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.description}</p>
                    </div>
                    <Link href={s.href}>
                      <Button size="icon" variant="ghost" data-testid={`button-section-${s.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
}
