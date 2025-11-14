import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Euro, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const PLAN_FEATURES = {
  basic: [
    "Profiel op het platform",
    "Toegang tot netwerk van lokale ondernemers",
    "Community & Kansenbord",
    "Chat met andere leden",
    "Stemrecht in coöperatie",
    "RegioBot AI assistent (beperkt)",
  ],
  pro: [
    "Alles van Basic",
    "Onbeperkte RegioBot AI hulp",
    "Uitgebreide analytics",
    "Premium zichtbaarheid",
    "Prioriteit support",
    "Vroege toegang tot nieuwe features",
  ],
};

export default function LidmaatschapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" data-testid="link-home-logo">
            <a className="font-accent text-2xl font-bold text-primary">
              OpenRegio
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="button-nav-login">
                Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <Badge variant="default" className="mb-4" data-testid="badge-cooperative">
              <Users className="h-3 w-3 mr-1" />
              Coöperatief platform
            </Badge>
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">
              Word lid van OpenRegio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sluit je aan bij een groeiende gemeenschap van lokale ondernemers.
              Samen sterker, zonder Big Tech.
            </p>
          </div>

          <Card className="mb-12" data-testid="card-what-we-do">
            <CardHeader>
              <CardTitle className="font-accent text-2xl">Wat doet OpenRegio?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                OpenRegio is een coöperatief platform voor lokale ondernemers die hun digitale onafhankelijkheid terug willen pakken. We zijn geen Big Tech-platform — we zijn van en voor ondernemers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Lokale Zichtbaarheid
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Jouw bedrijf vindbaar voor klanten in de buurt, zonder Google-advertenties of algoritmes die tegen je werken.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Ondernemersnetwerk
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ontdek andere lokale bedrijven, deel leads, werk samen aan projecten en versterk elkaar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Assistent RegioBot
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Hulp bij marketing, content, lokale SEO en klantbereik — speciaal getraind voor lokale ondernemers.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Democratische Coöperatie
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Stem mee over beslissingen, geen verborgen algoritmes, transparante bijdragen. Het platform is van ons allemaal.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Contact:</strong> Vragen over OpenRegio? Mail ons op{" "}
                  <a
                    href="mailto:info@openregio.nl"
                    className="text-primary hover:underline"
                    data-testid="link-contact-email"
                  >
                    info@openregio.nl
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <div className="mb-12">
            <h2 className="font-accent text-3xl font-bold mb-8 text-center">
              Kies je lidmaatschap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="relative" data-testid="card-plan-basic">
                <CardHeader>
                  <CardTitle className="text-2xl">Basic</CardTitle>
                  <CardDescription>Voor startende ondernemers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <Euro className="h-6 w-6 text-muted-foreground" />
                    <span className="text-4xl font-bold">9,99</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <ul className="space-y-3">
                    {PLAN_FEATURES.basic.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`feature-basic-${idx}`}>
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register?plan=basic">
                    <Button className="w-full" data-testid="button-select-basic">
                      Start met Basic
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="relative border-primary/50" data-testid="card-plan-pro">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="shadow-lg" data-testid="badge-popular">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Populair
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription>Voor ambitieuze ondernemers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <Euro className="h-6 w-6 text-muted-foreground" />
                    <span className="text-4xl font-bold">19,99</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <ul className="space-y-3">
                    {PLAN_FEATURES.pro.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`feature-pro-${idx}`}>
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register?plan=pro">
                    <Button className="w-full" variant="default" data-testid="button-select-pro">
                      Start met Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-muted/30 rounded-lg p-8 mb-12">
            <h2 className="font-accent text-2xl font-bold mb-6 text-center">
              Waarom OpenRegio?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center" data-testid="benefit-ownership">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Jouw platform</h3>
                <p className="text-sm text-muted-foreground">
                  Als lid ben je mede-eigenaar. Stem mee over nieuwe features en richting.
                </p>
              </div>
              <div className="text-center" data-testid="benefit-growth">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Lokale groei</h3>
                <p className="text-sm text-muted-foreground">
                  Bereik lokale klanten en bouw samenwerkingen met ondernemers in je regio.
                </p>
              </div>
              <div className="text-center" data-testid="benefit-fair">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Eerlijke voorwaarden</h3>
                <p className="text-sm text-muted-foreground">
                  Geen hoge commissies of verborgen kosten. Transparante coöperatieve structuur.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Al een account?{" "}
              <Link href="/login">
                <a className="text-primary hover:underline font-medium" data-testid="link-login">
                  Log hier in
                </a>
              </Link>
            </p>
            <p>
              Vragen over lidmaatschap? Neem contact op via{" "}
              <a
                href="mailto:info@openregio.nl"
                className="text-primary hover:underline font-medium"
                data-testid="link-contact-email-footer"
              >
                info@openregio.nl
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
