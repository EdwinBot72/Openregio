import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BEROEP_DATA, BEROEP_CATEGORIEEN, type Beroep } from "@shared/seo-data";
import type { ZoektermenResponse } from "@shared/seo-types";
import { Copy, Check } from "lucide-react";

export default function ZoektermenFinder() {
  const [gekozenBeroep, setGekozenBeroep] = useState<Beroep | "">("");
  const [stad, setStad] = useState("");
  const [wijk, setWijk] = useState("");
  const [resultaat, setResultaat] = useState<ZoektermenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);

  async function genereer() {
    if (!gekozenBeroep) { setError("Kies eerst een beroep of sector."); return; }
    if (!stad.trim()) { setError("Vul een stad of regio in."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/zoektermen/genereer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beroep: gekozenBeroep, stad: stad.trim(), wijk: wijk.trim() || undefined }),
      });
      const data = await res.json();
      setResultaat(data);
    } catch {
      setError("Kon zoektermen niet ophalen. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function kopieer(tekst: string, key: string) {
    navigator.clipboard.writeText(tekst).then(() => {
      setGekopieerd(key);
      setTimeout(() => setGekopieerd(null), 1800);
    });
  }

  return (
    <div className="space-y-5 pt-4">
      {/* Stap 1: beroep */}
      <div>
        <p className="text-sm font-medium mb-2">Stap 1 — Wat is jouw beroep of sector?</p>
        <Select value={gekozenBeroep} onValueChange={(v) => setGekozenBeroep(v as Beroep)}>
          <SelectTrigger className="max-w-xs" data-testid="select-beroep">
            <SelectValue placeholder="Kies een beroep..." />
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

      {/* Stap 2: locatie */}
      <div>
        <p className="text-sm font-medium mb-2">Stap 2 — Jouw stad of regio</p>
        <div className="flex flex-wrap gap-2 max-w-lg">
          <Input
            placeholder="Stad, bijv. Haarlem, Tilburg..."
            value={stad}
            onChange={(e) => setStad(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && genereer()}
            className="flex-1 min-w-40"
            data-testid="input-stad"
          />
          <Input
            placeholder="Wijk (optioneel)"
            value={wijk}
            onChange={(e) => setWijk(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && genereer()}
            className="w-36"
            data-testid="input-wijk"
          />
          <Button onClick={genereer} disabled={loading} data-testid="button-genereer">
            {loading ? "Laden..." : "Genereer zoektermen"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
      </div>

      {resultaat && (
        <div className="space-y-4">
          {/* Pagina meta */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <KopieRegel
                label="Aanbevolen paginatitel"
                waarde={resultaat.paginatitel}
                id="titel"
                gekopieerd={gekopieerd}
                onKopieer={kopieer}
              />
              <KopieRegel
                label="Meta description"
                waarde={resultaat.metaDescription}
                id="meta"
                gekopieerd={gekopieerd}
                onKopieer={kopieer}
              />
              <KopieRegel
                label="H1 suggestie"
                waarde={resultaat.h1Suggestie}
                id="h1"
                gekopieerd={gekopieerd}
                onKopieer={kopieer}
              />
            </CardContent>
          </Card>

          {/* Zoektermen grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TermenKaart titel="Primaire zoektermen" termen={resultaat.primair} variant="primair" />
            <TermenKaart titel="Long-tail kansen" termen={resultaat.longTail} variant="longtail" />
            <TermenKaart titel="Zoekvragen" termen={resultaat.zoekvragen} variant="vragen" />
          </div>

          {/* Wijk tip */}
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

function KopieRegel({ label, waarde, id, gekopieerd, onKopieer }: {
  label: string;
  waarde: string;
  id: string;
  gekopieerd: string | null;
  onKopieer: (tekst: string, id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-start gap-2">
        <p className="text-sm font-mono bg-muted rounded px-3 py-2 flex-1">{waarde}</p>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onKopieer(waarde, id)}
          data-testid={`copy-${id}`}
          title="Kopieer"
        >
          {gekopieerd === id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function TermenKaart({ titel, termen, variant }: {
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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">{titel}</p>
        <div className="flex flex-wrap gap-1.5">
          {termen.map((term) => (
            <span key={term} className={`text-xs px-2 py-1 rounded border ${tagClass}`}>
              {term}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
