import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegionSelect } from "@/components/region-select";
import { ExternalLink, Calendar, Info, Building2, AlertCircle, FileText, ArrowUpDown, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GemeenteUpdate {
  id: string;
  title: string;
  date: string | null;
  url: string | null;
  type: string | null;
  subjects: string[];
  creator: string | null;
}

type SortKey = "datum-nieuw" | "datum-oud" | "titel-az" | "titel-za" | "type";

const SORT_LABELS: Record<SortKey, string> = {
  "datum-nieuw": "Nieuwst eerst",
  "datum-oud": "Oudst eerst",
  "titel-az": "Titel A → Z",
  "titel-za": "Titel Z → A",
  "type": "Type",
};

function sortItems(items: GemeenteUpdate[], key: SortKey): GemeenteUpdate[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case "datum-nieuw":
        return (b.date ?? "").localeCompare(a.date ?? "");
      case "datum-oud":
        return (a.date ?? "").localeCompare(b.date ?? "");
      case "titel-az":
        return a.title.localeCompare(b.title, "nl");
      case "titel-za":
        return b.title.localeCompare(a.title, "nl");
      case "type":
        return (a.type ?? "").localeCompare(b.type ?? "", "nl");
      default:
        return 0;
    }
  });
}

function TypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const map: Record<string, string> = {
    Gemeenteblad: "bg-blue-100 text-blue-800",
    Staatscourant: "bg-purple-100 text-purple-800",
    Provinciaalblad: "bg-teal-100 text-teal-800",
    Stcrt: "bg-purple-100 text-purple-800",
    gmb: "bg-blue-100 text-blue-800",
  };
  const cls = map[type] ?? "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {type}
    </Badge>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function GemeenteUpdatesPage() {
  const { user } = useAuth();
  const [gemeente, setGemeente] = useState("");
  const [zoekGemeente, setZoekGemeente] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("datum-nieuw");

  const { data: profiel } = useQuery<{ regio?: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const defaultGemeente = profiel?.regio ?? "";
  const activeGemeente = zoekGemeente || defaultGemeente;

  const { data, isLoading, error, refetch } = useQuery<{
    gemeente: string;
    total: number;
    count: number;
    items: GemeenteUpdate[];
  }>({
    queryKey: ["/api/gemeente-updates", activeGemeente],
    queryFn: () =>
      fetch(
        `/api/gemeente-updates?gemeente=${encodeURIComponent(activeGemeente)}&limit=20`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Fout bij ophalen");
        return r.json();
      }),
    enabled: !!activeGemeente,
    staleTime: 30 * 60 * 1000,
  });

  const sortedItems = useMemo(
    () => sortItems(data?.items ?? [], sortKey),
    [data?.items, sortKey]
  );

  const handleSearch = () => {
    if (gemeente) setZoekGemeente(gemeente);
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-gemeente-updates">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 style={{ width: 24, height: 24, color: "#0b2240" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-page-title">Gemeente-updates</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Actuele besluiten en bekendmakingen van jouw gemeente, rechtstreeks uit de officiële bronnen.
          </p>
        </div>
      </div>

      {/* Uitleg */}
      <Card className="mb-6 bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Wat zijn Gemeente-updates?</p>
              <p className="text-sm text-muted-foreground">
                Officiële publicaties van jouw gemeente: Gemeenteblad, raadsbesluiten, vergunningsbesluiten en meer —
                rechtstreeks opgehaald van <span className="font-medium">officielebekendmakingen.nl</span> via de overheids-API.
              </p>
              <p className="text-sm text-muted-foreground">
                Kies een gemeente, filter op publicatietype en sorteer op datum of titel. Klik op een publicatie voor
                het volledige document op de officiële overheidspagina.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-8">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Publicaties zijn actueel tot op de dag — de API haalt dagelijks nieuwe bekendmakingen op.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Zoekbalk */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="text-sm font-medium mb-1.5 block">Gemeente</label>
              <RegionSelect
                value={gemeente || activeGemeente}
                onValueChange={setGemeente}
                placeholder="Selecteer gemeente"
                data-testid="select-gemeente"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!gemeente}
              data-testid="button-zoek"
            >
              Zoek updates
            </Button>
          </div>
          {defaultGemeente && !zoekGemeente && (
            <p className="text-xs text-muted-foreground mt-2">
              Resultaten voor jouw gemeente: <strong>{defaultGemeente}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info banner */}
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground mb-5 px-1"
        data-testid="banner-info"
      >
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          Bron: Officiële Bekendmakingen (overheid.nl) · Data ververst elke 30 minuten
        </span>
      </div>

      {/* Laden */}
      {isLoading && (
        <div className="space-y-4" data-testid="skeleton-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fout */}
      {error && !isLoading && (
        <Card data-testid="card-error">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Overheid.nl tijdelijk niet bereikbaar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Probeer het over enkele minuten opnieuw.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
                data-testid="button-retry"
              >
                Opnieuw proberen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geen gemeente */}
      {!activeGemeente && !isLoading && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-testid="state-empty-gemeente"
        >
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecteer een gemeente om updates te zien.</p>
        </div>
      )}

      {/* Geen resultaten */}
      {data && data.count === 0 && !isLoading && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-testid="state-no-results"
        >
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">
            Geen publicaties gevonden voor <strong>{activeGemeente}</strong>
          </p>
          <p className="text-xs">
            Overheid.nl bevat mogelijk geen recente publicaties van deze gemeente.
          </p>
        </div>
      )}

      {/* Resultaten */}
      {data && data.count > 0 && !isLoading && (
        <>
          {/* Resultaten-header met sortering */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground" data-testid="text-result-count">
              {data.count} publicatie{data.count !== 1 ? "s" : ""} voor{" "}
              <strong>{activeGemeente}</strong>
              {data.total > data.count && (
                <span className="ml-1 text-xs">(van {data.total.toLocaleString("nl-NL")} totaal)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <Select
                value={sortKey}
                onValueChange={(v) => setSortKey(v as SortKey)}
              >
                <SelectTrigger className="w-[160px]" data-testid="select-sortering">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key} data-testid={`sort-option-${key}`}>
                      {SORT_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {sortedItems.map((item) => (
              <Card
                key={item.id}
                data-testid={`card-update-${item.id}`}
                className={item.url ? "hover-elevate transition-shadow cursor-pointer" : ""}
                onClick={() => item.url && window.open(item.url, "_blank", "noopener,noreferrer")}
              >
                <CardHeader className="pb-2 pt-4 px-5 flex flex-row flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-semibold text-sm leading-snug"
                      data-testid="text-update-title"
                    >
                      {item.title}
                    </h2>
                    {item.creator && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.creator}
                      </p>
                    )}
                  </div>
                  <TypeBadge type={item.type} />
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {item.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.subjects.map((s, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs"
                          data-testid={`badge-subject-${idx}`}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {item.date && (
                      <span
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                        data-testid="text-update-date"
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    )}
                    {item.url && (
                      <span
                        className="flex items-center gap-1.5 text-xs font-medium text-[#0b2240]"
                        data-testid="link-bekijk-publicatie"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Opent in nieuw tabblad
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
  );
}
