import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users, Activity, ArrowLeft, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { PROVINCES_GEMEENTEN } from "@shared/schema";

interface OndernemerRow {
  id: string;
  businessName: string;
  region: string;
  plan: string;
  memberSince: string;
  isRecentlyActive: boolean;
}

interface OndernemersStats {
  total: number;
  totalPro: number;
  totalActive: number;
  topRegion: string;
}

interface OndernemersResponse {
  items: OndernemerRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: OndernemersStats;
}

const ALL_REGIONS = Object.values(PROVINCES_GEMEENTEN).flat().sort();

export default function AdminOndernemersPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery<OndernemersResponse>({
    queryKey: ["/api/admin/ondernemers", debouncedSearch, regionFilter, planFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (regionFilter && regionFilter !== "all") params.set("region", regionFilter);
      if (planFilter && planFilter !== "all") params.set("plan", planFilter);
      params.set("page", String(page));
      return fetch(`/api/admin/ondernemers?${params.toString()}`, { credentials: "include" }).then(
        (r) => r.json()
      );
    },
  });

  const items = data?.items ?? [];
  const stats = data?.stats;
  const totalPages = data?.totalPages ?? 1;

  const resetPage = useCallback(() => setPage(1), []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-semibold" data-testid="heading-admin-ondernemers">
              Ondernemers
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Geregistreerde leden — AVG-conform (geen e-mail of volledige naam).
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5">
                <Skeleton className="h-14 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Totaal leden</p>
                    <p className="text-2xl font-bold" data-testid="stat-total">
                      {stats?.total ?? 0}
                    </p>
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
                    <p className="text-2xl font-bold" data-testid="stat-pro">
                      {stats?.totalPro ?? 0}
                    </p>
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
                    <p className="text-xs text-muted-foreground mb-1">Actief (30 d)</p>
                    <p className="text-2xl font-bold" data-testid="stat-active">
                      {stats?.totalActive ?? 0}
                    </p>
                  </div>
                  <div className="rounded-md p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
                    <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Topgemeente</p>
                    <p
                      className="text-sm font-semibold truncate mt-1"
                      data-testid="stat-top-region"
                    >
                      {stats?.topRegion || "-"}
                    </p>
                  </div>
                  <div className="rounded-md p-2.5 bg-violet-50 dark:bg-violet-950/40">
                    <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Table with filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base">Ondernemer lijst</CardTitle>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <Input
                placeholder="Zoek op bedrijfsnaam..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="w-48"
                data-testid="input-search-ondernemers"
              />
              <Select
                value={regionFilter}
                onValueChange={(v) => {
                  setRegionFilter(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-44" data-testid="select-region-filter">
                  <SelectValue placeholder="Alle regio's" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle regio's</SelectItem>
                  {ALL_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={planFilter}
                onValueChange={(v) => {
                  setPlanFilter(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-32" data-testid="select-plan-filter">
                  <SelectValue placeholder="Alle plannen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle plannen</SelectItem>
                  <SelectItem value="basic">Basis</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {search || regionFilter !== "all" || planFilter !== "all"
                ? "Geen resultaten gevonden voor deze filters."
                : "Geen ondernemers gevonden."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Bedrijfsnaam
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Regio
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Plan
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Lid sinds
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Actief
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0"
                      data-testid={`row-ondernemer-${row.id}`}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        data-testid={`text-business-name-${row.id}`}
                      >
                        {row.businessName}
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
                        {row.memberSince
                          ? new Date(row.memberSince + "-01").toLocaleDateString("nl-NL", {
                              year: "numeric",
                              month: "short",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${
                            row.isRecentlyActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                          data-testid={`status-active-${row.id}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.isRecentlyActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                            }`}
                          />
                          {row.isRecentlyActive ? "Actief" : "Inactief"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Pagina {page} van {totalPages} &middot; {data?.total ?? 0} totaal
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        AVG-noot: dit overzicht toont geen e-mailadressen, volledige namen of exacte
        inlogtijden. "Actief" is gebaseerd op de aanwezigheid van een geldig
        vernieuwingstoken binnen de laatste 30 dagen.
      </p>
    </div>
  );
}
