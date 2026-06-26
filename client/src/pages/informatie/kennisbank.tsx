import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookMarked,
  BookOpen,
  Clock,
  FileText,
  Gavel,
  HelpCircle,
  Mail,
  Scale,
} from "lucide-react";

const ARTIKELEN = [
  {
    icon: FileText,
    titel: "Hoe lees je een overheidsbrief",
    beschrijving: "Herken de afzender, het type document, de juridische grondslag en de geldende termijnen. Weet binnen 2 minuten wat de brief van je vraagt.",
    leestijd: "5 min",
    niveau: "Basis",
  },
  {
    icon: BookOpen,
    titel: "Wat is een besluit",
    beschrijving: "Een besluit heeft formele rechtsgevolgen. Leer het verschil tussen een beschikking, een besluit van algemene strekking en een beleidsregel.",
    leestijd: "7 min",
    niveau: "Basis",
  },
  {
    icon: Scale,
    titel: "Hoe werkt bezwaar",
    beschrijving: "Je hebt doorgaans 6 weken om bezwaar te maken. Leer de procedure, de kosten en de slagingskans van een bezwaarprocedure.",
    leestijd: "8 min",
    niveau: "Gevorderd",
  },
  {
    icon: HelpCircle,
    titel: "Hoe vraag je informatie op",
    beschrijving: "Een WOO-verzoek (Wet open overheid) indienen in 3 stappen. Welke informatie mag je opvragen, en wat zijn de reactietermijnen?",
    leestijd: "6 min",
    niveau: "Basis",
  },
  {
    icon: Gavel,
    titel: "Hoe werkt regelgeving",
    beschrijving: "Van Europese richtlijn tot gemeentelijke uitvoeringsregeling: hoe ontstaat regelgeving en hoe vind jij de regels die voor jouw situatie gelden?",
    leestijd: "10 min",
    niveau: "Gevorderd",
  },
];

export default function KennisbankPage() {
  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookMarked style={{ width: 24, height: 24, color: "#1f5fae" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-blog">Kennisbank</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Praktische kennis over overheidsbrieven, besluiten en regelgeving.
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-binnenkort">Binnenkort beschikbaar</Badge>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Blogartikelen</h2>
        <div className="space-y-3">
          {ARTIKELEN.map((artikel, i) => {
            const IconComp = artikel.icon;
            return (
              <Card key={i} data-testid={`card-artikel-${i}`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-[#1f5fae]/10 shrink-0">
                      <IconComp className="h-5 w-5 text-[#1f5fae]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm" data-testid={`text-artikel-titel-${i}`}>
                          {artikel.titel}
                        </h3>
                        <Badge variant="outline" className="text-xs font-normal">
                          {artikel.niveau}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {artikel.beschrijving}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{artikel.leestijd} leestijd</span>
                        <span className="mx-1">·</span>
                        <Badge variant="secondary" className="text-xs font-normal py-0">Binnenkort</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-[#1f5fae]/10">
                <Mail className="h-6 w-6 text-[#1f5fae]" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Op de hoogte blijven?</h3>
              <p className="text-sm text-muted-foreground">
                Ontvang een melding zodra de kennisbank beschikbaar is.
              </p>
            </div>
            <a
              href="mailto:info@openregio.nl?subject=Aanmelding nieuwsbrief Kennisbank"
              data-testid="link-nieuwsbrief-kennisbank"
            >
              <Button data-testid="button-aanmelden-kennisbank">
                <Mail className="h-4 w-4 mr-2" />
                Aanmelden voor updates
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
  );
}
