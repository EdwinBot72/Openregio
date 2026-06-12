import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Wrench,
  Monitor,
} from "lucide-react";

const watWeDoen = [
  { icon: RefreshCw, text: "CMS-, plugin- en beveiligingsupdates" },
  { icon: Wrench, text: "Kleine aanpassingen aan tekst en afbeeldingen" },
  { icon: Zap, text: "Snelheid & veiligheid geoptimaliseerd" },
  { icon: MapPin, text: "Regionale vindbaarheid verbeterd" },
  { icon: Clock, text: "Contactgegevens en openingstijden actueel houden" },
];

const watHetOplevert = [
  {
    icon: TrendingUp,
    title: "Betere lokale vindbaarheid",
    desc: "Een actuele website scoort beter in Google voor zoekopdrachten in jouw gemeente.",
  },
  {
    icon: ShieldCheck,
    title: "Minder technische problemen",
    desc: "Regelmatige updates voorkomen storingen, hacks en trage laadtijden.",
  },
  {
    icon: Star,
    title: "Betrouwbaar voor klanten",
    desc: "Klanten die verouderde info vinden, haken af. Met actuele info win je vertrouwen.",
  },
];

export default function WebsiteOnderhoudPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3" data-testid="badge-section">
          Zichtbaarheid
        </Badge>
        <h1 className="text-2xl font-bold" data-testid="heading-website-onderhoud">
          Digitale basis op orde
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Voor ondernemers in de regio. Geen webdesignbureau — gewoon praktische ondersteuning
          zodat jouw website werkt, vindbaar is en klanten niet wegjaagt.
        </p>
      </div>

      <Card data-testid="card-waarom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="w-4 h-4 text-primary" />
            Waarom onderhoud belangrijk is
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Een website die niet wordt bijgewerkt verliest vindbaarheid, veiligheid en vertrouwen.
            Klanten zoeken lokaal — als jouw gegevens niet kloppen of de site traag is, kiezen ze
            iemand anders. OpenRegio helpt ondernemers hun website eenvoudig en betrouwbaar bij te
            houden, zonder dat je er zelf verstand van hoeft te hebben.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold text-base mb-3" data-testid="heading-wat-we-doen">Wat we doen</h2>
        <div className="space-y-2">
          {watWeDoen.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm" data-testid={`item-wat-${text.slice(0, 10)}`}>
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-base mb-3" data-testid="heading-wat-oplevert">Wat het oplevert</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {watHetOplevert.map(({ icon: Icon, title, desc }) => (
            <Card key={title} data-testid={`card-voordeel-${title.slice(0, 10)}`}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <Icon className="w-5 h-5 text-primary" />
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-base mb-3" data-testid="heading-lidvoordeel">Lidvoordeel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card data-testid="card-basis-lid">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Basis lid</CardTitle>
                <Badge variant="secondary" className="text-xs">Inbegrepen</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Bedrijfsprofiel in de regio",
                "Basis vindbaarheidscheck",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-pro-lid">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Pro lid</CardTitle>
                <Badge className="text-xs">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Website onderhoud",
                "SEO check lokaal",
                "Technische controle",
                "Alles van Basis",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20" data-testid="card-cta">
        <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Interesse in website onderhoud?</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              We helpen je graag verder. Neem contact op via onderstaande knop.
            </p>
          </div>
          <Button asChild className="shrink-0" data-testid="button-contact">
            <a href="mailto:info@openregio.nl">Neem contact op</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
