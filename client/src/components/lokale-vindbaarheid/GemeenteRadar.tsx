import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BEROEP_DATA, BEROEP_CATEGORIEEN, type Beroep } from "@shared/seo-data";
import { PROVINCIES, berekenGemeenteScores, genereerGemeenteTips, type GemeenteScore, type CompetitieNiveau } from "@shared/gemeente-data";
import { TrendingUp, Users, Target, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COMPETITIE_LABEL: Record<CompetitieNiveau, string> = {
  laag: "Weinig concurrentie",
  midden: "Gemiddelde concurrentie",
  hoog: "Veel concurrentie",
};

const COMPETITIE_COLOR: Record<CompetitieNiveau, string> = {
  laag: "bg-[#f28a1a]/10 text-[#f28a1a] dark:text-[#f28a1a] border-[#f28a1a]/20",
  midden: "bg-[#f28a1a]/10 text-[#f28a1a] dark:text-[#f28a1a] border-[#f28a1a]/20",
  hoog: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function GemeenteRadar() {
  const [beroep, setBeroep] = useState<Beroep | "">("");
  const [provincie, setProvincie] = useState<string>("alle");
  const [sorteer, setSorteer] = useState<"kans" | "vraag" | "inwoners">("kans");

  const scores = useMemo<GemeenteScore[]>(() => {
    if (!beroep) return [];
    const data = BEROEP_DATA[beroep];
    return berekenGemeenteScores(beroep, data.spoedScore);
  }, [beroep]);

  const gefilterd = useMemo(() => {
    let lijst = provincie === "alle" ? scores : scores.filter((s) => s.provincie === provincie);
    return [...lijst].sort((a, b) =>
      sorteer === "kans" ? b.kansScore - a.kansScore :
      sorteer === "vraag" ? b.vraagScore - a.vraagScore :
      b.inwoners - a.inwoners
    ).slice(0, 20);
  }, [scores, provincie, sorteer]);

  const maxKans = gefilterd.length > 0 ? Math.max(...gefilterd.map((s) => s.kansScore)) : 1;
  const maxVraag = gefilterd.length > 0 ? Math.max(...gefilterd.map((s) => s.vraagScore)) : 1;

  return (
    <div className="space-y-5 pt-4">
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ontdek in welke gemeente de vraag naar jouw dienst het grootst is en waar jij de beste kans hebt om gevonden te worden. 
          De kansscore combineert vraag én concurrentieniveau — een grote stad heeft veel vraag maar ook veel concurrentie.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Jouw beroep</p>
          <Select value={beroep} onValueChange={(v) => setBeroep(v as Beroep)}>
            <SelectTrigger data-testid="radar-beroep">
              <SelectValue placeholder="Kies beroep..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BEROEP_CATEGORIEEN).map(([catKey, cat]) => (
                <SelectGroup key={catKey}>
                  <SelectLabel>{cat.label}</SelectLabel>
                  {cat.beroepen.map((b) => (
                    <SelectItem key={b} value={b}>
                      {BEROEP_DATA[b].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Provincie</p>
          <Select value={provincie} onValueChange={setProvincie}>
            <SelectTrigger data-testid="radar-provincie">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Heel Nederland</SelectItem>
              {PROVINCIES.map((p) => (
                <SelectItem key={p.naam} value={p.naam}>{p.naam}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Sorteren op</p>
          <Select value={sorteer} onValueChange={(v) => setSorteer(v as typeof sorteer)}>
            <SelectTrigger data-testid="radar-sorteer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kans">Beste kans</SelectItem>
              <SelectItem value="vraag">Hoogste vraag</SelectItem>
              <SelectItem value="inwoners">Grootste stad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!beroep && (
        <Card>
          <CardContent className="pt-4 text-center text-sm text-muted-foreground py-8">
            Kies eerst je beroep om de gemeentelijke vraagverdeling te zien.
          </CardContent>
        </Card>
      )}

      {beroep && gefilterd.length > 0 && (
        <>
          {/* Legenda */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Kansscore = vraag minus concurrentie</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0b2240]" />
              <span className="text-muted-foreground">Vraagindex = geschatte marktomvang</span>
            </div>
          </div>

          {/* Rapport samenvatting */}
          <Card className="bg-[#0b2240]/5 border-[#0b2240]/20">
            <CardContent className="pt-4 pb-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#0b2240] dark:text-[#0b2240]">
                <Target className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Jouw doelgroep-rapport</span>
              </div>
              <p className="text-sm">
                Voor <span className="font-semibold">{BEROEP_DATA[beroep].label.toLowerCase()}</span> zit de grootste kans in{" "}
                <span className="font-semibold">{gefilterd[0]?.gemeente}</span>
                {gefilterd[1] && <> en <span className="font-semibold">{gefilterd[1].gemeente}</span></>}.
                Hieronder per gemeente de vraag, concurrentie en concrete tips om daar gevonden te worden.
              </p>
            </CardContent>
          </Card>

          {/* Gemeente lijst */}
          <div className="space-y-2">
            {gefilterd.map((score, i) => (
              <GemeenteRij key={score.gemeente} score={score} rank={i + 1} maxKans={maxKans} maxVraag={maxVraag} />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Scores zijn berekend op basis van inwonertal, groeigebied en beroep-specifieke factoren. 
            Gebruik dit als oriëntatie — niet als exacte marktdata.
          </p>
        </>
      )}
    </div>
  );
}

function GemeenteRij({ score, rank, maxKans, maxVraag }: {
  score: GemeenteScore;
  rank: number;
  maxKans: number;
  maxVraag: number;
}) {
  const kansPct = Math.round((score.kansScore / maxKans) * 100);
  const vraagPct = Math.round((score.vraagScore / maxVraag) * 100);

  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="text-xs font-mono text-muted-foreground w-5 pt-0.5 flex-shrink-0">
            {rank}
          </span>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{score.gemeente}</span>
              <span className="text-xs text-muted-foreground">{score.provincie}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded border ${COMPETITIE_COLOR[score.competitie]}`}>
                {COMPETITIE_LABEL[score.competitie]}
              </span>
              {score.groeigebied && (
                <span className="text-xs px-1.5 py-0.5 rounded border bg-[#0b2240]/10 text-[#0b2240] dark:text-[#0b2240] border-[#0b2240]/20">
                  Groeigebied
                </span>
              )}
            </div>

            {/* Vraag balk */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 flex-shrink-0">Vraag</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0b2240] rounded-full transition-all"
                    style={{ width: `${vraagPct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">{vraagPct}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 flex-shrink-0">Kans</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${kansPct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">{kansPct}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {score.inwoners.toLocaleString("nl-NL")} inwoners
            </p>

            {/* Tips */}
            <div className="space-y-1 pt-1">
              {genereerGemeenteTips(score, rank).map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-[#f28a1a] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
