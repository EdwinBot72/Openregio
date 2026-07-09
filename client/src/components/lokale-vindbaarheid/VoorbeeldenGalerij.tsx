import { useState } from "react";
import { BEROEP_DATA, type Beroep } from "@shared/seo-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VoorbeeldenGalerij() {
  const [actief, setActief] = useState<Beroep | null>(null);
  const beroepen = Object.entries(BEROEP_DATA) as [Beroep, (typeof BEROEP_DATA)[Beroep]][];

  const data = actief ? BEROEP_DATA[actief] : null;

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Klik op een beroep voor concrete zoekterm-voorbeelden.
      </p>
      <div className="flex flex-wrap gap-2">
        {beroepen.map(([key, val]) => (
          <Button
            key={key}
            variant={actief === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActief(key)}
            data-testid={`voorbeeld-${key}`}
          >
            {val.label}
          </Button>
        ))}
      </div>

      {data && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Primaire termen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.primaireTermen.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded border bg-primary/10 text-primary border-primary/20"
                  >
                    {t.replace(/{beroep}/g, actief!).replace(/{stad}/g, "[jouw stad]")}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Long-tail kansen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.longTail.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded border bg-[#0b2240]/10 text-[#0b2240] dark:text-[#0b2240] border-[#0b2240]/20"
                  >
                    {t
                      .replace(/{beroep}/g, actief!)
                      .replace(/{stad}/g, "[stad]")
                      .replace(/{wijk}/g, "[wijk]")}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Zoekvragen
              </p>
              <ul className="space-y-1">
                {data.zoekvragen.map((v) => (
                  <li key={v} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/40 mt-0.5 flex-shrink-0">›</span>
                    {v.replace(/{beroep}/g, actief!).replace(/{stad}/g, "[stad]")}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f28a1a]/8 border border-[#f28a1a]/20 rounded-md p-3">
              <p className="text-xs font-medium text-[#f28a1a] dark:text-[#f28a1a] mb-1">Tip</p>
              <p className="text-xs text-[#f28a1a]/80 dark:text-[#f28a1a]/80">{data.wijkTip}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
