import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Building2, MapPin, Users } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { SECTOR_CONFIG } from "@/config/sectors";

type Lid = {
  id: string;
  businessName: string;
  region: string;
  sector: string;
  lidSinds: string;
};

type LedenResponse = {
  leden: Lid[];
  totaal: number;
};

const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SECTOR_CONFIG).map(([k, v]) => [k, v.label])
);

function LidKaart({ lid }: { lid: Lid }) {
  const initiaal = lid.businessName[0]?.toUpperCase() ?? "?";
  const sectorLabel = SECTOR_LABELS[lid.sector] ?? lid.sector;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 hover-elevate"
      data-testid={`card-lid-${lid.id}`}
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <span className="font-bold text-primary text-sm">{initiaal}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate" data-testid={`text-naam-${lid.id}`}>
          {lid.businessName}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {lid.region && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {lid.region}
            </span>
          )}
          {sectorLabel && (
            <Badge variant="secondary" className="text-[10px]">
              {sectorLabel}
            </Badge>
          )}
        </div>
        {lid.lidSinds && (
          <p className="text-[11px] text-muted-foreground mt-1">Lid sinds {lid.lidSinds}</p>
        )}
      </div>
    </div>
  );
}

export default function LedenPage() {
  usePageTitle("Leden — OpenRegio");

  const [zoek, setZoek] = useState("");
  const [regio, setRegio] = useState("all");
  const [sector, setSector] = useState("all");

  const debouncedZoek = useDebounce(zoek, 300);

  const { data, isLoading } = useQuery<LedenResponse>({
    queryKey: ["/api/leden", debouncedZoek, regio, sector],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedZoek) params.set("search", debouncedZoek);
      if (regio && regio !== "all") params.set("region", regio);
      if (sector && sector !== "all") params.set("sector", sector);
      return fetch(`/api/leden?${params}`).then((r) => r.json());
    },
  });

  const leden = data?.leden ?? [];
  const totaal = data?.totaal ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-foreground" data-testid="text-page-title">
          Ingeschreven ondernemers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Alle leden van OpenRegio op één plek
        </p>
      </div>

      {/* ── Stat ── */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 w-fit">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground" data-testid="text-totaal">{totaal}</span>
        <span className="text-sm text-muted-foreground">ingeschreven ondernemers</span>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam of regio…"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9"
            data-testid="input-zoek"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-44" data-testid="select-sector">
            <SelectValue placeholder="Alle sectoren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle sectoren</SelectItem>
            {Object.entries(SECTOR_LABELS).map(([k, label]) => (
              <SelectItem key={k} value={k}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(zoek || regio !== "all" || sector !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setZoek(""); setRegio("all"); setSector("all"); }}
            data-testid="button-reset-filters"
          >
            Wis filters
          </Button>
        )}
      </div>

      {/* ── Lijst ── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : leden.length === 0 ? (
        <div className="py-16 text-center space-y-2" data-testid="text-leeg">
          <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Geen leden gevonden</p>
          <p className="text-xs text-muted-foreground">Pas de filters aan om meer te zien</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="grid-leden">
          {leden.map((lid) => (
            <LidKaart key={lid.id} lid={lid} />
          ))}
        </div>
      )}

    </div>
  );
}
