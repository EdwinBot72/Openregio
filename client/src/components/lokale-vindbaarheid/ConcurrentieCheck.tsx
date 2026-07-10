import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BEROEP_DATA, BEROEP_CATEGORIEEN, type Beroep } from "@shared/seo-data";
import { PROVINCIES, berekenAantalConcurrenten, genereerUniekeIdeeenTips } from "@shared/gemeente-data";
import { Users, Lightbulb, Target } from "lucide-react";

const ALLE_GEMEENTES = PROVINCIES.flatMap((prov) =>
  prov.gemeentes.map((g) => ({ naam: g.naam, provincie: prov.naam }))
).sort((a, b) => a.naam.localeCompare(b.naam));

export default function ConcurrentieCheck() {
  const [beroep, setBeroep] = useState<Beroep | "">("");
  const [gemeente, setGemeente] = useState<string>("");

  const resultaat = useMemo(() => {
    if (!beroep || !gemeente) return null;
    return berekenAantalConcurrenten(beroep, gemeente);
  }, [beroep, gemeente]);

  const tips = useMemo(() => {
    if (!resultaat || !beroep) return [];
    return genereerUniekeIdeeenTips(BEROEP_DATA[beroep].label, resultaat.aantalConcurrenten);
  }, [resultaat, beroep]);

  return (
    <div className="space-y-5 pt-4">
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vul je beroep en je eigen gemeente in en zie direct hoeveel vakgenoten daar naar schatting actief zijn —
          plus voor elk van hen een concreet idee om je mee te onderscheiden.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Jouw beroep</p>
          <Select value={beroep} onValueChange={(v) => setBeroep(v as Beroep)}>
            <SelectTrigger data-testid="concurrentie-beroep">
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
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Jouw gemeente</p>
          <Select value={gemeente} onValueChange={setGemeente}>
            <SelectTrigger data-testid="concurrentie-gemeente">
              <SelectValue placeholder="Kies gemeente..." />
            </SelectTrigger>
            <SelectContent>
              {ALLE_GEMEENTES.map((g) => (
                <SelectItem key={g.naam} value={g.naam}>
                  {g.naam} ({g.provincie})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(!beroep || !gemeente) && (
        <Card>
          <CardContent className="pt-4 text-center text-sm text-muted-foreground py-8">
            Kies je beroep en je gemeente om te zien hoeveel vakgenoten er actief zijn.
          </CardContent>
        </Card>
      )}

      {resultaat && beroep && (
        <>
          <Card className="bg-[#0b2240]/5 border-[#0b2240]/20">
            <CardContent className="pt-4 pb-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#0b2240] dark:text-[#0b2240]">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Concurrentie in {resultaat.gemeente}</span>
              </div>
              <p className="text-sm">
                In <span className="font-semibold">{resultaat.gemeente}</span> zijn naar schatting{" "}
                <span className="font-semibold">{resultaat.aantalConcurrenten}</span>{" "}
                {BEROEP_DATA[beroep].label.toLowerCase()}
                {resultaat.aantalConcurrenten === 1 ? "" : "s"} actief ({resultaat.inwoners.toLocaleString("nl-NL")} inwoners).
                Hieronder staat voor elk van hen een uniek idee om je mee te onderscheiden — {resultaat.aantalConcurrenten} in totaal.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tips.length} unieke ideeën om te starten
              </span>
            </div>
            <div className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
              {tips.map((tip, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-6 flex-shrink-0 pt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-[#f28a1a] flex-shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">{tip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Het aantal concurrenten is een schatting op basis van inwonertal en beroep — geen exacte telling uit een
            bedrijvenregister. Gebruik dit als richtlijn om een eigen, onderscheidende aanpak te kiezen.
          </p>
        </>
      )}
    </div>
  );
}
