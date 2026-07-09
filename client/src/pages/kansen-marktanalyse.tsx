import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  ArrowRight,
  MapPin,
  Search,
  Star,
  AlertCircle,
  Minus,
  BarChart2,
} from "lucide-react";
import {
  PROVINCIES,
  berekenBeroepKansenPerGemeente,
  type BeroepKans,
} from "@shared/gemeente-data";

function KansBadge({ kans }: { kans: BeroepKans; }) {
  const score = kans.kansScore;
  if (score >= 14) return <Badge variant="default" className="text-xs shrink-0 bg-[#f28a1a] hover:bg-[#f28a1a]">Grote kans</Badge>;
  if (score >= 8) return <Badge variant="secondary" className="text-xs shrink-0">Gemiddeld</Badge>;
  return <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">Verzadigd</Badge>;
}

function KansIcon({ score }: { score: number }) {
  if (score >= 14) return <Star className="h-4 w-4 text-[#f28a1a] shrink-0" />;
  if (score >= 8) return <Minus className="h-4 w-4 text-muted-foreground shrink-0" />;
  return <AlertCircle className="h-4 w-4 text-muted-foreground/50 shrink-0" />;
}

export default function KansenMarktanalysePage() {
  usePageTitle("Marktanalyse — welke diensten ontbreken?");
  const { user } = useAuth();

  const [geselecteerdeProvincie, setGeselecteerdeProvincie] = useState<string>(() => {
    if (!user?.region) return "Noord-Holland";
    const match = PROVINCIES.find((p) =>
      p.naam.toLowerCase() === user.region!.toLowerCase() ||
      p.gemeentes.some((g) => g.naam.toLowerCase() === user.region!.toLowerCase())
    );
    return match?.naam ?? "Noord-Holland";
  });

  const [geselecteerdeGemeente, setGeselecteerdeGemeente] = useState<string>(() => {
    if (!user?.region) return "Haarlem";
    for (const prov of PROVINCIES) {
      const gem = prov.gemeentes.find(
        (g) => g.naam.toLowerCase() === user.region!.toLowerCase()
      );
      if (gem) return gem.naam;
    }
    const prov = PROVINCIES.find((p) => p.naam.toLowerCase() === user.region!.toLowerCase());
    return prov?.gemeentes[0]?.naam ?? "Haarlem";
  });

  const provincieGemeentes = useMemo(
    () => PROVINCIES.find((p) => p.naam === geselecteerdeProvincie)?.gemeentes ?? [],
    [geselecteerdeProvincie]
  );

  const kansen = useMemo(
    () => berekenBeroepKansenPerGemeente(geselecteerdeGemeente),
    [geselecteerdeGemeente]
  );

  const topKansen = kansen.slice(0, 10);
  const beteKansen = kansen.filter((k) => k.kansScore >= 14);

  function handleProvincieChange(prov: string) {
    setGeselecteerdeProvincie(prov);
    const eersteGem = PROVINCIES.find((p) => p.naam === prov)?.gemeentes[0];
    if (eersteGem) setGeselecteerdeGemeente(eersteGem.naam);
  }

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BarChart2 style={{ width: 24, height: 24, color: "#0b2240" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Marktanalyse</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Welke diensten ontbreken in jouw regio? Hoge vraag + lage concurrentie = grote kans.
          </p>
        </div>
      </div>

      {/* ── Gemeente-selector ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-5 space-y-4"
        data-testid="section-gemeente-selector"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Kies een gemeente</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={geselecteerdeProvincie} onValueChange={handleProvincieChange}>
            <SelectTrigger className="flex-1" data-testid="select-provincie">
              <SelectValue placeholder="Provincie" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCIES.map((p) => (
                <SelectItem key={p.naam} value={p.naam}>
                  {p.naam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={geselecteerdeGemeente} onValueChange={setGeselecteerdeGemeente}>
            <SelectTrigger className="flex-1" data-testid="select-gemeente">
              <SelectValue placeholder="Gemeente" />
            </SelectTrigger>
            <SelectContent>
              {provincieGemeentes.map((g) => (
                <SelectItem key={g.naam} value={g.naam}>
                  {g.naam}
                  {g.groeigebied && " — groeigebied"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Resultaten ────────────────────────────────────────────────────────── */}
      {kansen.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center text-muted-foreground text-sm">
          Geen data voor deze gemeente.
        </div>
      ) : (
        <>
          {/* Samenvatting */}
          <div
            className="rounded-2xl border p-5 space-y-2"
            data-testid="section-samenvatting"
          >
            <p className="font-bold text-base">
              Analyse voor {geselecteerdeGemeente}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {beteKansen.length > 0 ? (
                <>
                  In {geselecteerdeGemeente} zijn er <strong>{beteKansen.length} beroepen</strong> met
                  een grote kans — hoge vraag en relatief weinig concurrentie. De beste kansen zijn{" "}
                  <strong>{beteKansen.slice(0, 3).map((k) => k.label).join(", ")}</strong>.
                </>
              ) : (
                <>
                  {geselecteerdeGemeente} is een grote stad met veel concurrentie. Specialisatie en
                  lokale naamsbekendheid zijn extra belangrijk.
                </>
              )}
            </p>
            {kansen[0]?.groeigebied && (
              <div className="flex items-center gap-2 mt-2 text-xs text-[#f28a1a] bg-[#f28a1a]/10 rounded-xl px-3 py-2">
                <Star className="h-3.5 w-3.5 shrink-0" />
                {geselecteerdeGemeente} is een groeigebied — vraag groeit sneller dan gemiddeld.
              </div>
            )}
          </div>

          {/* Top 10 lijst */}
          <section data-testid="section-kansen-lijst">
            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top 10 kansen in {geselecteerdeGemeente}
            </p>
            <div className="rounded-2xl border overflow-hidden">
              {topKansen.map((k, idx) => (
                <div
                  key={k.beroep}
                  className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover-elevate"
                  data-testid={`row-kans-${k.beroep}`}
                >
                  <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                    {idx + 1}
                  </span>
                  <KansIcon score={k.kansScore} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" data-testid={`text-beroep-${k.beroep}`}>
                      {k.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Vraag: {k.vraagScore} · Kansscore: {k.kansScore}
                    </p>
                  </div>
                  <KansBadge kans={k} />
                  <Link href={`/groei/zichtbaarheid`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 hidden sm:flex"
                      data-testid={`button-zoektermen-${k.beroep}`}
                    >
                      Zoektermen
                      <Search className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Alle beroepen — ingeklapt overzicht */}
          <section data-testid="section-alle-kansen">
            <p className="text-sm font-semibold text-muted-foreground mb-3">
              Alle {kansen.length} beroepen — van meeste naar minste kans
            </p>
            <div className="rounded-2xl border overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                {[kansen.slice(0, Math.ceil(kansen.length / 2)), kansen.slice(Math.ceil(kansen.length / 2))].map(
                  (col, ci) => (
                    <div key={ci} className="divide-y">
                      {col.map((k, idx) => {
                        const rank = ci === 0 ? idx + 1 : Math.ceil(kansen.length / 2) + idx + 1;
                        return (
                          <div
                            key={k.beroep}
                            className="flex items-center gap-3 px-4 py-3"
                            data-testid={`row-alle-${k.beroep}`}
                          >
                            <span className="text-xs text-muted-foreground w-4 shrink-0">{rank}</span>
                            <span className="text-sm flex-1 truncate">{k.label}</span>
                            <span
                              className={`text-xs font-bold ${
                                k.kansScore >= 14
                                  ? "text-[#f28a1a]"
                                  : k.kansScore >= 8
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/50"
                              }`}
                            >
                              {k.kansScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* CTA zichtbaarheid */}
          <div
            className="rounded-2xl border border-dashed p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            data-testid="section-cta-zichtbaarheid"
          >
            <div className="flex-1">
              <p className="font-semibold mb-1">Gevonden: een kans voor jou?</p>
              <p className="text-sm text-muted-foreground">
                Gebruik de Lokale Vindbaarheid-tools om direct zoektermen, website tekst en gemeente
                radar te bekijken voor jouw beroep.
              </p>
            </div>
            <Link href="/groei/zichtbaarheid">
              <Button size="sm" data-testid="button-naar-zichtbaarheid">
                Bekijk tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  </div>
  );
}
