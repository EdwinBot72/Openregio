import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Users, Activity } from "lucide-react";
import { useState } from "react";

interface OndernemenRow {
  id: string;
  business_name: string;
  region: string;
  plan: string;
  member_since: string;
  is_recently_active: boolean;
}

export default function AdminOndernemersPage() {
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery<OndernemenRow[]>({
    queryKey: ["/api/admin/ondernemers"],
  });

  const filtered = data.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.business_name.toLowerCase().includes(q) ||
      row.region.toLowerCase().includes(q) ||
      row.plan.toLowerCase().includes(q)
    );
  });

  const totalPro = data.filter((r) => r.plan === "pro").length;
  const totalActive = data.filter((r) => r.is_recently_active).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="heading-admin-ondernemers">
          <Building2 className="h-6 w-6" />
          Ondernemers
        </h1>
        <p className="text-sm text-muted-foreground">
          Overzicht van geregistreerde ondernemers. Geanonimiseerd conform AVG — geen e-mailadressen of volledige namen.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Totaal</p>
                <p className="text-2xl font-bold" data-testid="stat-total">{isLoading ? "—" : data.length}</p>
              </div>
              <div className="rounded-md p-2.5 bg-blue-50 dark:bg-blue-950/40">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pro-leden</p>
                <p className="text-2xl font-bold" data-testid="stat-pro">{isLoading ? "—" : totalPro}</p>
              </div>
              <div className="rounded-md p-2.5 bg-orange-50 dark:bg-orange-950/40">
                <Building2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Actief (30 dagen)</p>
                <p className="text-2xl font-bold" data-testid="stat-active">{isLoading ? "—" : totalActive}</p>
              </div>
              <div className="rounded-md p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Ondernemer lijst</CardTitle>
            <Input
              placeholder="Zoek op naam, regio of plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              data-testid="input-search-ondernemers"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {search ? "Geen resultaten gevonden." : "Geen ondernemers gevonden."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bedrijfsnaam</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Regio</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lid sinds</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actief</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0 hover-elevate"
                      data-testid={`row-ondernemer-${row.id}`}
                    >
                      <td className="px-4 py-3 font-medium" data-testid={`text-business-name-${row.id}`}>
                        {row.business_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.region}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={row.plan === "pro" ? "default" : "secondary"}
                          data-testid={`badge-plan-${row.id}`}
                        >
                          {row.plan === "pro" ? "Pro" : "Basis"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.member_since
                          ? new Date(row.member_since + "-01").toLocaleDateString("nl-NL", { year: "numeric", month: "long" })
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${row.is_recently_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                          data-testid={`status-active-${row.id}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${row.is_recently_active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                          {row.is_recently_active ? "Actief" : "Inactief"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        AVG-noot: dit overzicht toont geen e-mailadressen, volledige namen of exacte inlogtijden.
        "Actief" is gebaseerd op de aanwezigheid van een geldig vernieuwingstoken binnen de laatste 30 dagen.
      </p>
    </div>
  );
}
