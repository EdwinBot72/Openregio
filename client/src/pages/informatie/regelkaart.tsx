import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapIcon,
  CheckSquare,
  FileText,
  Building2,
  ShieldCheck,
  ClipboardList,
  Mail,
  Clock,
} from "lucide-react";

export default function RegelkaartPage() {
  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MapIcon style={{ width: 24, height: 24, color: "#6d28d9" }} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Regelkaart</h1>
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              Binnenkort beschikbaar
            </Badge>
          </div>
            <p className="text-sm text-muted-foreground">
              Wet- en regelgeving die voor jouw bedrijf geldt — per gemeente, op een rij
            </p>
          </div>
        </div>
      </div>

      {/* Wat is het? */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckSquare className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-medium">Wat wordt de Regelkaart?</p>
              <p className="text-sm text-muted-foreground">
                Een interactieve checklist van wet- en regelgeving die van toepassing is op jouw gemeente
                en bedrijfstype. Geen ingewikkelde juridische teksten, maar een helder overzicht:
                wát geldt voor jou, en waar je dat kunt vinden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wat kun je straks? */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Wat kun je straks met de Regelkaart?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Gemeente kiezen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Voer jouw gemeente in en zie welke lokale regels van toepassing zijn
                    op jouw sector.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Vergunningen en meldingen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ontdek direct welke vergunningen of meldingen je nodig hebt — van
                    APV tot omgevingsvergunning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Doorklikken naar de bron</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bij elke regel staat een directe link naar de officiële gemeentepagina
                    of het Gemeenteblad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-[#0b2240] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Persoonlijke checklist</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vink af wat je al geregeld hebt. Zo houd je bij welke regels je
                    nog moet nalopen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onderwerpen */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Welke regelgeving komt erin?</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Vergunningsplichten",
            "Meldingsplichten",
            "APV-regels",
            "Heffingen en leges",
            "Handhavingskaders",
            "Omgevingswet",
            "Subsidieregels",
            "Aanbestedingsdrempels",
            "Mandaten en bevoegdheden",
          ].map((label) => (
            <Badge key={label} variant="outline" className="text-xs font-normal">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Wil je een bericht als de Regelkaart live gaat?</p>
              <p className="text-sm text-muted-foreground">
                Stuur een e-mail naar <span className="font-medium">info@openregio.nl</span> met
                als onderwerp "Regelkaart" en jouw gemeente — dan laten we het je weten zodra het
                beschikbaar is.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              data-testid="button-regelkaart-contact"
            >
              <a href="mailto:info@openregio.nl?subject=Regelkaart&body=Ik%20ben%20geïnteresseerd%20in%20de%20Regelkaart.%20Mijn%20gemeente%20is%3A%20">
                <Mail className="h-4 w-4 mr-2" />
                Stuur bericht
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
