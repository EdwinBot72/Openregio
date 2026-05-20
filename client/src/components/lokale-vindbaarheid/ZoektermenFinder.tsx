import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BEROEP_DATA, type Beroep } from "@shared/seo-data";
import type { ZoektermenResponse } from "@shared/seo-types";

export default function ZoektermenFinder() {
  const [gekozenBeroep, setGekozenBeroep] = useState<Beroep | "">("");
  const [stad, setStad] = useState("");
  const [resultaat, setResultaat] = useState<ZoektermenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const beroepen = Object.entries(BEROEP_DATA) as [Beroep, (typeof BEROEP_DATA)[Beroep]][];

  async function genereer() {
    if (!gekozenBeroep) { setError("Kies eerst een beroep."); return; }
    if (!stad.trim()) { setError("Vul een stad of regio in."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/zoektermen/genereer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beroep: gekozenBeroep, stad: stad.trim() }),
      });
      const data = await res.json();
      setResultaat(data);
    } catch {
      setError("Kon zoektermen niet ophalen. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 pt-4">
      <div>
        <p className="text-sm font-medium mb-2">Stap 1 — Wat voor ondernemer ben je?</p>
        <div className="flex flex-wrap gap-2">
          {beroepen.map(([key, val]) => (
            <Button
              key={key}
              variant={gekozenBeroep === key ? "default" : "outline"}
              size="sm"
              onClick={() => setGekozenBeroep(key)}
              data-testid={`beroep-${key}`}
            >
              {val.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Stap 2 — Jouw stad of regio</p>
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="bijv. Haarlem, Tilburg, Groningen..."
            value={stad}
            onChange={(e) => setStad(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && genereer()}
            data-testid="input-stad"
          />
          <Button
            onClick={genereer}
            disabled={loading}
            data-testid="button-genereer"
          >
            {loading ? "..." : "Genereer"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      {resultaat && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Aanbevolen paginatitel
                </p>
                <p className="text-sm font-mono bg-muted rounded px-3 py-2">
                  {resultaat.paginatitel}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Meta description
                </p>
                <p className="text-sm font-mono bg-muted rounded px-3 py-2">
                  {resultaat.metaDescription}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  H1 suggestie
                </p>
                <p className="text-sm font-mono bg-muted rounded px-3 py-2">
                  {resultaat.h1Suggestie}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TermenKaart titel="Primaire zoektermen" termen={resultaat.primair} variant="primair" />
            <TermenKaart titel="Long-tail kansen" termen={resultaat.longTail} variant="longtail" />
            <TermenKaart titel="Zoekvragen" termen={resultaat.zoekvragen} variant="vragen" />
          </div>

          {resultaat.wijkTip && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1">Tip voor jouw beroep</p>
                <p className="text-sm text-muted-foreground">{resultaat.wijkTip}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function TermenKaart({
  titel,
  termen,
  variant,
}: {
  titel: string;
  termen: string[];
  variant: "primair" | "longtail" | "vragen";
}) {
  const tagClass = {
    primair: "bg-primary/10 text-primary border-primary/20",
    longtail: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    vragen: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  }[variant];

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {titel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {termen.map((term) => (
            <span
              key={term}
              className={`text-xs px-2 py-1 rounded border ${tagClass}`}
            >
              {term}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
