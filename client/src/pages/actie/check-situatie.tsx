import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  ClipboardList,
  FileSearch,
  MapPin,
  ShieldCheck,
  Download,
  Mail,
  Clock,
  Building2,
  Briefcase,
} from "lucide-react";

export default function CheckSituatiePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-8 w-8 text-[#1f5fae]" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Check mijn situatie</h1>
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                Binnenkort beschikbaar
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Ontdek welke regels, vergunningen en meldingen voor jouw bedrijf gelden
            </p>
          </div>
        </div>
      </div>

      {/* Wat wordt het? */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <div className="flex items-start gap-3">
            <ClipboardList className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-medium">Wat is "Check mijn situatie"?</p>
              <p className="text-sm text-muted-foreground">
                Een korte vragenlijst (5–8 vragen) die automatisch bepaalt welke wet- en regelgeving
                op jouw bedrijf van toepassing is — op basis van jouw gemeente, sector en
                bedrijfsactiviteiten. Geen juridisch jargon, maar heldere taal.
              </p>
              <p className="text-sm text-muted-foreground">
                Je hoeft geen specialist te zijn. Beantwoord de vragen, en je krijgt een
                persoonlijk overzicht van de regels die voor jou gelden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wat kun je straks? */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Wat kun je straks doen?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Jouw situatie invullen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Geef aan in welke gemeente je actief bent en wat je bedrijf doet.
                    De check past zich aan op jouw antwoorden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <FileSearch className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Persoonlijk regeloverzicht</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ontvang direct een overzicht van de regels die specifiek voor jou
                    gelden, met uitleg en links naar de officiële bronnen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Vergunningen in beeld</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zie precies welke vergunningen of meldingen je nodig hebt — van
                    omgevingsvergunning tot horecavergunning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Checklist opslaan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download jouw persoonlijke checklist of sla hem op in jouw
                    OpenRegio-account om later op terug te komen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Welke onderwerpen */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Welke onderwerpen worden gecheckt?</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Vergunningsplicht",
            "Meldingsplicht",
            "APV-regels",
            "Heffingen & leges",
            "Omgevingswet",
            "Brandveiligheid",
            "Horecawet",
            "ZZP & arbeidsrecht",
            "Reclame & uitstallingen",
            "Terrassen & openbare ruimte",
          ].map((label) => (
            <Badge key={label} variant="outline" className="text-xs font-normal">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Voor wie */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Voor wie is het bedoeld?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Startende ondernemers</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Die willen weten waar ze aan moeten voldoen voordat ze beginnen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Gevestigde ondernemers</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Die willen controleren of er iets veranderd is in de regelgeving
                    die op hen van toepassing is.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Wil je een bericht als "Check mijn situatie" live gaat?</p>
              <p className="text-sm text-muted-foreground">
                Stuur een e-mail naar <span className="font-medium">info@openregio.nl</span> met als onderwerp
                "Check mijn situatie" — dan laten we je weten zodra het beschikbaar is.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              data-testid="button-check-contact"
            >
              <a href="mailto:info@openregio.nl?subject=Check%20mijn%20situatie&body=Ik%20ben%20geïnteresseerd%20in%20%22Check%20mijn%20situatie%22.%20Mijn%20gemeente%20is%3A%20">
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
