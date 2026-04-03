import { useState, useCallback, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  MapPin,
  Star,
  Lightbulb,
  RefreshCw,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { GEMEENTEN } from "@shared/schema";

// Alle gemeenten gesorteerd op alfabet (eenmalig)
const GEMEENTEN_GESORTEERD = [...GEMEENTEN].sort((a, b) =>
  a.localeCompare(b, "nl", { sensitivity: "base" })
);

type Urgentie = "Hoog" | "Gemiddeld" | "Laag";

type KansKaart = {
  titel: string;
  waarom: string;
  voorWie: string[];
  kans: string;
  urgentie: Urgentie;
};

type KansenResponse = {
  gemeente: string;
  kansen: KansKaart[];
  cached?: boolean;
  fallback?: boolean;
};

const UITLEG = [
  {
    icon: TrendingUp,
    label: "Wat je hier ziet",
    titel: "Kansen die opvallen",
    tekst: "Geen ruis, maar signalen waar je als ondernemer direct iets mee kunt.",
  },
  {
    icon: Users,
    label: "Voor wie",
    titel: "Ondernemers die willen groeien",
    tekst:
      "Handig als je beter zichtbaar wilt zijn, lokale kansen wilt pakken of samenwerkingen zoekt.",
  },
  {
    icon: Zap,
    label: "Wat je ermee kunt",
    titel: "Direct schakelen",
    tekst:
      "Gebruik deze signalen om een dienst aan te bieden, lokaal contact te leggen of sneller in te spelen op vraag.",
  },
];

function UrgentieBadge({ urgentie }: { urgentie: Urgentie }) {
  if (urgentie === "Hoog") {
    return <Badge variant="destructive" className="text-xs shrink-0">Hoog</Badge>;
  }
  if (urgentie === "Gemiddeld") {
    return <Badge variant="secondary" className="text-xs shrink-0">Gemiddeld</Badge>;
  }
  return <Badge variant="outline" className="text-xs shrink-0">Laag</Badge>;
}

function KansKaartSkeleton() {
  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Searchable gemeente combobox ────────────────────────────────────────────

interface GemeenteComboboxProps {
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
}

function GemeenteCombobox({ value, onChange, dark = false }: GemeenteComboboxProps) {
  const [open, setOpen] = useState(false);
  const [zoekterm, setZoekterm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const gefilterd = zoekterm.trim().length >= 1
    ? GEMEENTEN_GESORTEERD.filter((g) =>
        g.toLowerCase().includes(zoekterm.trim().toLowerCase())
      )
    : GEMEENTEN_GESORTEERD;

  const selecteer = (gemeente: string) => {
    onChange(gemeente);
    setOpen(false);
    setZoekterm("");
  };

  const wis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setZoekterm("");
  };

  const triggerCls = dark
    ? "flex items-center justify-between gap-2 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 cursor-pointer hover-elevate"
    : "flex items-center justify-between gap-2 w-full rounded-md border bg-background px-3 py-2 text-sm cursor-pointer hover-elevate";

  return (
    <div className="relative w-full sm:w-80" data-testid="combobox-gemeente">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={triggerCls}
        data-testid="button-gemeente-open"
      >
        <span className={value ? "" : dark ? "text-white/50" : "text-muted-foreground"}>
          {value || "Zoek gemeente…"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={wis}
              className={`rounded-full p-0.5 ${dark ? "hover:bg-white/20 text-white/70" : "hover:bg-muted"} cursor-pointer`}
              data-testid="button-gemeente-wis"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""} ${dark ? "text-white/60" : "text-muted-foreground"}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full mt-1 left-0 w-full min-w-[280px] rounded-md border bg-popover shadow-md overflow-hidden"
          data-testid="dropdown-gemeenten"
        >
          {/* Zoekbalk */}
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              placeholder="Zoek gemeente…"
              className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
              data-testid="input-gemeente-zoek"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setZoekterm(""); }
                if (e.key === "Enter" && gefilterd.length === 1) selecteer(gefilterd[0]);
              }}
            />
            {zoekterm && (
              <button onClick={() => setZoekterm("")} className="shrink-0 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Lijstresultaten */}
          <div className="max-h-64 overflow-y-auto" role="listbox">
            {gefilterd.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Geen gemeenten gevonden
              </p>
            ) : (
              gefilterd.map((gemeente) => (
                <button
                  key={gemeente}
                  type="button"
                  role="option"
                  aria-selected={gemeente === value}
                  onClick={() => selecteer(gemeente)}
                  className={`w-full text-left px-4 py-2 text-sm hover-elevate cursor-pointer transition-colors ${
                    gemeente === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  }`}
                  data-testid={`option-gemeente-${gemeente.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {gemeente}
                </button>
              ))
            )}
          </div>

          {/* Footer teller */}
          <div className="px-3 py-1.5 border-t text-[11px] text-muted-foreground">
            {gefilterd.length} {gefilterd.length === 1 ? "gemeente" : "gemeenten"}
            {zoekterm && ` gevonden voor "${zoekterm}"`}
          </div>
        </div>
      )}

      {/* Klik buiten sluit dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setOpen(false); setZoekterm(""); }}
        />
      )}
    </div>
  );
}

// ── Hoofdpagina ─────────────────────────────────────────────────────────────

export default function KansenInDeBuurtPage() {
  usePageTitle("Kansen in de buurt");
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "master";

  const { data: profiel } = useQuery<{ regio?: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const [gemeente, setGemeente] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const actieveGemeente = gemeente || profiel?.regio || "";

  const { data, isLoading, isError, isFetching } = useQuery<KansenResponse>({
    queryKey: ["/api/kansen/gemeente", actieveGemeente, refreshCount],
    queryFn: () =>
      fetch(
        `/api/kansen/gemeente?gemeente=${encodeURIComponent(actieveGemeente)}${refreshCount > 0 ? "&refresh=true" : ""}`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("Fout bij ophalen");
        return r.json();
      }),
    enabled: !!actieveGemeente,
    staleTime: 10 * 60 * 1000,
  });

  const handleRefresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  const kansen = data?.kansen ?? [];
  const laden = isLoading || isFetching;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-7 text-white shadow-lg md:p-9"
        data-testid="section-hero"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 opacity-75" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Kansen in de buurt
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight md:text-4xl text-white">
          Hier liggen nu kansen
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
          Zie in één oogopslag waar in jouw gemeente vraag groeit, waar
          ondernemers hulp zoeken en waar jij op kunt inspelen — voor alle 342
          gemeenten in Nederland.
        </p>

        {/* Gemeente-selectie */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="text-xs font-medium text-white/70 mb-1.5 block">
              Kies een gemeente
            </label>
            <GemeenteCombobox
              value={actieveGemeente}
              onChange={setGemeente}
              dark
            />
          </div>

          {actieveGemeente && (
            <div className="flex items-center gap-2 text-white/80 text-sm pb-0.5 flex-wrap">
              <MapPin className="h-4 w-4 shrink-0" />
              <span data-testid="text-actieve-gemeente">{actieveGemeente}</span>
              {data?.cached && !laden && (
                <Badge variant="outline" className="text-white/60 border-white/20 text-xs">
                  vandaag
                </Badge>
              )}
              {!laden && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors"
                  data-testid="button-refresh-kansen"
                  title="Andere kansen genereren"
                >
                  <RefreshCw className="h-3 w-3" />
                  Andere kansen
                </button>
              )}
              {laden && refreshCount > 0 && (
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Nieuwe kansen laden…
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Uitlegblokken ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3" data-testid="section-uitleg">
        {UITLEG.map((blok) => {
          const Icon = blok.icon;
          return (
            <Card key={blok.label}>
              <CardContent className="pt-5 pb-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{blok.label}</p>
                </div>
                <p className="font-semibold text-sm">{blok.titel}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{blok.tekst}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Geen gemeente geselecteerd ─────────────────────────────────────────── */}
      {!actieveGemeente && (
        <div
          className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground"
          data-testid="state-geen-gemeente"
        >
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">Kies een gemeente</p>
          <p className="text-xs">
            Zoek hierboven een gemeente om kansen te zien — uit alle 342 gemeenten in Nederland.
          </p>
        </div>
      )}

      {/* ── Kansen-kaarten ────────────────────────────────────────────────────── */}
      {actieveGemeente && (
        <section data-testid="section-kansen">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold" data-testid="text-gemeente-naam">
                {actieveGemeente}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {laden
                  ? "Kansen worden samengesteld…"
                  : `${kansen.length} kansen gevonden in jouw buurt.`}
              </p>
            </div>
            <Link href="/intel">
              <Button variant="outline" size="sm" data-testid="button-alle-signalen">
                Alle signalen bekijken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {laden && (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((n) => <KansKaartSkeleton key={n} />)}
            </div>
          )}

          {isError && !laden && (
            <Card data-testid="state-error">
              <CardContent className="pt-5 pb-5 text-center">
                <p className="text-muted-foreground text-sm">
                  Kon kansen niet laden. Probeer het over een moment opnieuw.
                </p>
              </CardContent>
            </Card>
          )}

          {!laden && !isError && data?.fallback && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 px-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Generieke kansen getoond — gemeente-specifieke kansen worden morgen opnieuw geprobeerd.</span>
            </div>
          )}

          {!laden && !isError && kansen.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {kansen.map((kaart, idx) => (
                <Card key={idx} data-testid={`card-kans-${idx}`}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="font-semibold text-base leading-snug"
                        data-testid={`text-kans-titel-${idx}`}
                      >
                        {kaart.titel}
                      </h3>
                      <UrgentieBadge urgentie={kaart.urgentie} />
                    </div>

                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-testid={`text-kans-waarom-${idx}`}
                    >
                      <span className="font-medium text-foreground">Waarom dit opvalt: </span>
                      {kaart.waarom}
                    </p>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Voor wie
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {kaart.voorWie.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Wat jij kunt doen
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        data-testid={`text-kans-actie-${idx}`}
                      >
                        {kaart.kans}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link href="/lokaal-marktplaats">
                        <Button size="sm" data-testid={`button-kans-inspelen-${idx}`}>
                          Inspelen op kans
                        </Button>
                      </Link>
                      <Link href="/regiocrew">
                        <Button size="sm" variant="outline" data-testid={`button-kans-samenwerken-${idx}`}>
                          Samenwerken
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Afsluittekst ──────────────────────────────────────────────────────── */}
      <Card data-testid="section-info">
        <CardContent className="pt-5 pb-5">
          <h3 className="font-semibold mb-2">Snel gezien, snel gebruikt</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            De kansen worden dagelijks samengesteld op basis van lokale context. Geen eindeloze
            rapporten, maar concrete signalen die je in één oogopslag kunt lezen en meteen kunt
            gebruiken. Kansen worden gecached — dezelfde gemeente laadt de volgende keer direct.
          </p>
        </CardContent>
      </Card>

      {/* ── Pro upgrade ────────────────────────────────────────────────────────── */}
      {!isPro && (
        <Card data-testid="section-upgrade-cta">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Meer kansen en diepere signalen zien?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Met Pro zie je uitgebreidere kansen, meer regionale signalen en slimme hulp om
                  sneller in te spelen op wat er speelt in jouw buurt.
                </p>
                <Link href="/lidmaatschap">
                  <Button size="sm" data-testid="button-upgrade-pro">
                    Bekijk Pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
