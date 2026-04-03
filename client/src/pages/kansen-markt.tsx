import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Zap,
  Lightbulb,
} from "lucide-react";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  CATEGORIE_META,
  CATEGORIE_KEYS,
  type SectorKey,
  type CategorieKey,
} from "@/config/sectors";

const SECTOR_VOLGORDE: SectorKey[] = ["detailhandel", "horeca", "techniek", "agrarisch"];

type MarktCategorieItem = {
  titel: string;
  toelichting: string;
  actie: string;
  urgentie: "Hoog" | "Gemiddeld" | "Laag";
};

type MarktCategorieResponse = {
  sector: string;
  categorie: string;
  items: MarktCategorieItem[];
  cached?: boolean;
  fallback?: boolean;
};

function UrgentieBadge({ urgentie }: { urgentie: "Hoog" | "Gemiddeld" | "Laag" }) {
  if (urgentie === "Hoog") return <Badge variant="destructive" className="text-xs shrink-0">Hoog</Badge>;
  if (urgentie === "Gemiddeld") return <Badge variant="secondary" className="text-xs shrink-0">Gemiddeld</Badge>;
  return <Badge variant="outline" className="text-xs shrink-0">Laag</Badge>;
}

function CategorieItemSkeleton() {
  return (
    <div className="space-y-2 p-4 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-16 shrink-0" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

// ── Categorie-sectie — laadt zijn eigen data ───────────────────────────────

function CategorieSectie({
  sectorKey,
  catKey,
}: {
  sectorKey: SectorKey;
  catKey: CategorieKey;
}) {
  const [open, setOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const meta = CATEGORIE_META[catKey];
  const sectorConf = SECTOR_CONFIG[sectorKey];
  const content = sectorConf.categorieen[catKey];
  const Icon = meta.icon;

  const { data, isLoading, isFetching, isError } = useQuery<MarktCategorieResponse>({
    queryKey: ["/api/kansen/markt-categorie", sectorKey, catKey, refreshCount],
    queryFn: () =>
      fetch(
        `/api/kansen/markt-categorie?sector=${sectorKey}&categorie=${catKey}${refreshCount > 0 ? "&refresh=true" : ""}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Fout bij ophalen");
        return r.json();
      }),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const laden = isLoading || isFetching;
  const items = data?.items ?? [];

  return (
    <div className="border rounded-xl overflow-hidden" data-testid={`sectie-${catKey}`}>
      {/* Header — altijd zichtbaar */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover-elevate transition-colors"
        onClick={() => setOpen((v) => !v)}
        data-testid={`toggle-${catKey}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
          <Icon className={`h-5 w-5 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{meta.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{content.sub}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {open && !laden && data?.cached && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground hidden sm:flex">
              vandaag
            </Badge>
          )}
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content — alleen als open */}
      {open && (
        <div className="border-t bg-muted/20">
          {/* Sub-header met refresh */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <p className="text-xs text-muted-foreground">
              {laden
                ? "Actuele inzichten worden geladen…"
                : `${items.length} actuele inzichten voor ${SECTOR_CONFIG[sectorKey].label}`}
            </p>
            {!laden && (
              <button
                onClick={() => setRefreshCount((c) => c + 1)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`button-refresh-${catKey}`}
              >
                <RefreshCw className="h-3 w-3" />
                Vernieuwen
              </button>
            )}
            {laden && refreshCount > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Laden…
              </span>
            )}
          </div>

          {/* Fallback-melding */}
          {!laden && !isError && data?.fallback && (
            <div className="flex items-center gap-2 px-5 py-2 text-xs text-muted-foreground border-b">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Generieke inzichten getoond — sector-specifieke worden morgen opnieuw geprobeerd.</span>
            </div>
          )}

          {/* Skeletons */}
          {laden && (
            <div>
              {[1, 2, 3, 4].map((n) => <CategorieItemSkeleton key={n} />)}
            </div>
          )}

          {/* Error */}
          {isError && !laden && (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">
              Kon inzichten niet laden. Probeer het later opnieuw.
            </div>
          )}

          {/* Items */}
          {!laden && !isError && items.length > 0 && (
            <div>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 border-b last:border-0 space-y-3"
                  data-testid={`item-${catKey}-${idx}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm leading-snug" data-testid={`text-item-titel-${idx}`}>
                      {item.titel}
                    </p>
                    <UrgentieBadge urgentie={item.urgentie} />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.toelichting}
                  </p>

                  <div className="flex items-start gap-2 rounded-xl bg-background/70 px-4 py-3">
                    <Zap className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${meta.color}`} />
                    <p className="text-sm font-medium leading-relaxed" data-testid={`text-item-actie-${idx}`}>
                      {item.actie}
                    </p>
                  </div>
                </div>
              ))}

              {/* Footer-link naar relevante pagina */}
              <div className="px-5 py-4 bg-muted/30 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground">Meer weten over {meta.label.toLowerCase()}?</p>
                <Link href={content.href}>
                  <Button size="sm" variant="outline" data-testid={`button-meer-${catKey}`}>
                    Bekijk meer
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hoofdpagina ─────────────────────────────────────────────────────────────

export default function KansenMarktPage() {
  usePageTitle("Kansen in de markt");
  const { user } = useAuth();
  const userSector = user?.sector as SectorKey | null;

  const [actief, setActief] = useState<SectorKey>(
    userSector && SECTOR_CONFIG[userSector] ? userSector : "detailhandel"
  );

  const sectorTile = SECTOR_TILES.find((t) => t.key === actief)!;
  const sectorConf = SECTOR_CONFIG[actief];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-7 md:p-9 text-white shadow-lg"
        data-testid="section-hero"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 opacity-70" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Ik wil beter worden
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black leading-tight text-white">
          Kansen in de markt
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/75 max-w-2xl leading-relaxed">
          Per categorie zie je onafhankelijk wat er nu actueel speelt voor jouw sector — klik een categorie open om de laatste inzichten te laden.
        </p>
      </div>

      {/* ── Sector-tabs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="section-sector-tabs" role="tablist">
        {SECTOR_VOLGORDE.map((key) => {
          const tile = SECTOR_TILES.find((t) => t.key === key)!;
          const conf = SECTOR_CONFIG[key];
          const isActief = key === actief;
          const isGebruiker = key === userSector;
          const Icon = conf.icon;

          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActief}
              onClick={() => setActief(key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer ${
                isActief ? "border-primary bg-primary/5 shadow-sm" : "border-border hover-elevate"
              }`}
              data-testid={`tab-sector-${key}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tile.bg}`}>
                <Icon className={`h-5 w-5 ${tile.color}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${isActief ? "text-primary" : "text-foreground"}`}>
                  {tile.label}
                </p>
                {isGebruiker && (
                  <Badge variant="secondary" className="text-[10px] mt-0.5">Jouw sector</Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 4 Uitklapbare categorieën ────────────────────────────────────────── */}
      <section data-testid="section-categorieen">
        <div className="flex items-center gap-2 mb-4">
          <sectorConf.icon className={`h-5 w-5 ${sectorTile.color}`} />
          <h2 className="text-lg font-bold">{sectorConf.label}</h2>
          <span className="text-sm text-muted-foreground">— klik een categorie om actuele inzichten te zien</span>
        </div>

        <div className="space-y-3">
          {CATEGORIE_KEYS.map((catKey) => (
            <CategorieSectie
              key={`${actief}-${catKey}`}
              sectorKey={actief}
              catKey={catKey}
            />
          ))}
        </div>
      </section>

      {/* ── CTA buurt ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-dashed p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        data-testid="section-cta-buurt"
      >
        <div className="flex-1">
          <p className="font-semibold mb-1">Specifieke kansen voor jouw gemeente?</p>
          <p className="text-sm text-muted-foreground">
            Zie per gemeente wat er nu speelt — voor alle 342 gemeenten in Nederland.
          </p>
        </div>
        <Link href="/kansen-in-de-buurt">
          <Button size="sm" data-testid="button-naar-buurt">
            Kansen in de buurt
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
