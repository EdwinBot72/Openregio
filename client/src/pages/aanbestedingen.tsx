import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RegionSelect } from "@/components/region-select";
import { ExternalLink, Calendar, Info, Building2, AlertCircle, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Aanbesteding {
  id: string;
  title: string;
  buyer: string;
  type: string | null;
  procedure: string | null;
  description: string | null;
  deadline: string | null;
  daysLeft: number | null;
  publicationDate: string | null;
  url: string | null;
}

function DeadlineBadge({ daysLeft }: { daysLeft: number | null }) {
  if (daysLeft === null) return null;
  if (daysLeft < 0) return <Badge variant="outline" className="text-xs">Gesloten</Badge>;
  if (daysLeft <= 7) return <Badge className="text-xs bg-red-600 text-white">{daysLeft} dag{daysLeft !== 1 ? "en" : ""}</Badge>;
  if (daysLeft <= 30) return <Badge className="text-xs bg-orange-500 text-white">{daysLeft} dagen</Badge>;
  return <Badge className="text-xs bg-green-600 text-white">{daysLeft} dagen</Badge>;
}

function TypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const colors: Record<string, string> = {
    "Werken": "bg-blue-100 text-blue-800",
    "Diensten": "bg-purple-100 text-purple-800",
    "Leveringen": "bg-amber-100 text-amber-800",
  };
  const cls = colors[type] ?? "bg-gray-100 text-gray-700";
  return <Badge variant="outline" className={`text-xs ${cls}`}>{type}</Badge>;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function AanbestedingenPage() {
  const { user } = useAuth();
  const [gemeente, setGemeente] = useState("");
  const [zoekGemeente, setZoekGemeente] = useState("");

  const { data: profiel } = useQuery<{ regio?: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  // Pre-fill gemeente vanuit bedrijfsprofiel (eenmalig)
  const defaultGemeente = profiel?.regio ?? "";

  const activeGemeente = zoekGemeente || defaultGemeente;

  const { data, isLoading, error, refetch } = useQuery<{
    gemeente: string;
    count: number;
    items: Aanbesteding[];
  }>({
    queryKey: ["/api/tenderned/aanbestedingen", activeGemeente],
    queryFn: () =>
      fetch(`/api/tenderned/aanbestedingen?gemeente=${encodeURIComponent(activeGemeente)}&limit=30`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Fout bij ophalen");
        return r.json();
      }),
    enabled: !!activeGemeente,
    staleTime: 15 * 60 * 1000,
  });

  const handleSearch = () => {
    if (gemeente) setZoekGemeente(gemeente);
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="page-aanbestedingen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" data-testid="text-page-title">Aanbestedingen</h1>
        <p className="text-muted-foreground text-sm">
          Live aanbestedingen van alle 342 Nederlandse gemeenten, rechtstreeks van TenderNed.
        </p>
      </div>

      {/* Uitleg */}
      <Card className="mb-6 bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Wat zijn Aanbestedingen?</p>
              <p className="text-sm text-muted-foreground">
                Overheden zijn verplicht opdrachten boven een drempelwaarde openbaar aan te besteden. Via TenderNed — de officiële
                aanbestedingsdatabank van de Nederlandse overheid — zie je hier alle lopende aanbestedingen van gemeenten in Nederland.
              </p>
              <p className="text-sm text-muted-foreground">
                Kies jouw gemeente en zie welke opdrachten er open staan, met type (Werken / Diensten / Leveringen),
                sluitingsdatum en een directe link naar de aanbestedingspagina.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-8">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Jouw gemeente wordt automatisch ingevuld vanuit je bedrijfsprofiel.
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
              Zoek aanbestedingen
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5 px-1" data-testid="banner-info">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Bron: TenderNed · Data ververst elke 15 minuten · Alleen meest recente publicaties worden getoond</span>
      </div>

      {/* Laadindicator */}
      {isLoading && (
        <div className="space-y-4" data-testid="skeleton-loading">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
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
              <p className="font-medium text-sm">TenderNed tijdelijk niet bereikbaar</p>
              <p className="text-xs text-muted-foreground mt-1">Probeer het over enkele minuten opnieuw.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Opnieuw proberen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geen gemeente geselecteerd */}
      {!activeGemeente && !isLoading && (
        <div className="text-center py-16 text-muted-foreground" data-testid="state-empty-gemeente">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecteer een gemeente om aanbestedingen te zien.</p>
        </div>
      )}

      {/* Geen resultaten */}
      {data && data.count === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground" data-testid="state-no-results">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">Geen aanbestedingen gevonden voor <strong>{activeGemeente}</strong></p>
          <p className="text-xs">TenderNed bevat mogelijk geen actuele publicaties van deze gemeente in de meest recente resultaten.</p>
        </div>
      )}

      {/* Resultaten */}
      {data && data.count > 0 && !isLoading && (
        <>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-result-count">
            {data.count} aanbesteding{data.count !== 1 ? "en" : ""} gevonden voor <strong>{activeGemeente}</strong>
          </p>
          <div className="space-y-4">
            {data.items.map((item) => (
              <Card key={item.id} data-testid={`card-aanbesteding-${item.id}`}>
                <CardHeader className="pb-2 pt-4 px-5 flex flex-row flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm leading-snug" data-testid="text-aanbesteding-title">
                      {item.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-aanbesteding-buyer">
                      {item.buyer}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                    <TypeBadge type={item.type} />
                    {item.procedure && (
                      <Badge variant="outline" className="text-xs">{item.procedure}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2" data-testid="text-aanbesteding-description">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {item.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Sluit: {formatDate(item.deadline)}
                        </span>
                      )}
                      {item.daysLeft !== null && (
                        <DeadlineBadge daysLeft={item.daysLeft} />
                      )}
                      {item.publicationDate && (
                        <span>Gepubliceerd: {formatDate(item.publicationDate)}</span>
                      )}
                    </div>
                    {item.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid="button-tenderned-link"
                      >
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Bekijk op TenderNed
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
