import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Store,
  Utensils,
  Wrench,
  Tractor,
} from "lucide-react";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  CATEGORIE_META,
  CATEGORIE_KEYS,
  type SectorKey,
} from "@/config/sectors";

const SECTOR_VOLGORDE: SectorKey[] = ["detailhandel", "horeca", "techniek", "agrarisch"];

export default function KansenMarktPage() {
  usePageTitle("Kansen in de markt");
  const { user } = useAuth();
  const userSector = user?.sector as SectorKey | null;

  // Actieve tab: gebruikssector als default, anders de eerste
  const [actief, setActief] = useState<SectorKey>(
    userSector && SECTOR_CONFIG[userSector] ? userSector : "detailhandel"
  );

  const sectorConf = SECTOR_CONFIG[actief];
  const sectorTile = SECTOR_TILES.find((t) => t.key === actief)!;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
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
          Kies jouw sector en zie welke kansen, groeimogelijkheden, regels en
          samenwerkingen er nu voor jou spelen — per categorie uitgesplitst.
        </p>
      </div>

      {/* ── Sector-tabs ─────────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        data-testid="section-sector-tabs"
        role="tablist"
      >
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
                isActief
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover-elevate"
              }`}
              data-testid={`tab-sector-${key}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${tile.bg}`}
              >
                <Icon className={`h-5 w-5 ${tile.color}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${isActief ? "text-primary" : "text-foreground"}`}>
                  {tile.label}
                </p>
                {isGebruiker && (
                  <Badge variant="secondary" className="text-[10px] mt-0.5">
                    Jouw sector
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 4 Categorie-kaarten ─────────────────────────────────────────────────── */}
      <section data-testid="section-categorieen">
        <div className="flex items-center gap-2 mb-4">
          <sectorConf.icon className={`h-5 w-5 ${sectorTile.color}`} />
          <h2 className="text-lg font-bold">{sectorConf.label}</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIE_KEYS.map((catKey) => {
            const meta = CATEGORIE_META[catKey];
            const content = sectorConf.categorieen[catKey];
            const Icon = meta.icon;

            return (
              <Link key={catKey} href={content.href} asChild>
                <a
                  className="group flex gap-4 rounded-2xl border bg-card p-5 hover-elevate cursor-pointer transition-all"
                  data-testid={`card-categorie-${catKey}`}
                >
                  {/* Icoon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>

                  {/* Tekst */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight mb-1">
                      {meta.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {content.sub}
                    </p>
                  </div>

                  {/* Pijl */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center group-hover:translate-x-0.5 transition-transform" />
                </a>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Alle sectoren snel ──────────────────────────────────────────────────── */}
      <Card data-testid="section-alle-sectoren">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm font-semibold mb-3">Andere sectoren bekijken</p>
          <div className="flex flex-wrap gap-2">
            {SECTOR_VOLGORDE.filter((k) => k !== actief).map((key) => {
              const conf = SECTOR_CONFIG[key];
              const tile = SECTOR_TILES.find((t) => t.key === key)!;
              const Icon = conf.icon;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setActief(key)}
                  data-testid={`button-sector-${key}`}
                >
                  <Icon className={`h-3.5 w-3.5 mr-1.5 ${tile.color}`} />
                  {conf.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── CTA naar kansen in de buurt ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-dashed p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        data-testid="section-cta-buurt"
      >
        <div className="flex-1">
          <p className="font-semibold mb-1">Specifieke kansen voor jouw gemeente?</p>
          <p className="text-sm text-muted-foreground">
            Bekijk wat er nu speelt in jouw eigen regio — per gemeente uitgesplitst.
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
