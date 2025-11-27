import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Users, Banknote, Phone, Battery, FileText, Printer, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/ChatGPT Image 27 nov 2025, 11_33_40_1764239636207.png";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary" 
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/lidmaatschap" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-membership"
            >
              Lidmaatschap
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" 
              data-testid="button-nav-login"
            >
              Inloggen
            </Link>
            <Link 
              href="/start?plan=basic" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2 bg-primary text-primary-foreground border border-primary-border" 
              data-testid="button-nav-start"
            >
              Word lid
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-accent text-4xl md:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
                Ondernemen terug naar de basis
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
                OpenRegio is een lokaal ondernemersplatform waar je weer gewoon zaken doet: 
                vaste klanten, korte lijntjes, simpel kunnen betalen – en afspraken die blijven 
                staan, ook als systemen een keer niet meewerken.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/start?plan=basic">
                  <Button size="lg" data-testid="button-hero-basic">
                    Word lid – €9,95 p/m
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/basischeck">
                  <Button variant="outline" size="lg" data-testid="button-hero-basischeck">
                    Doe de Basischeck
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4" data-testid="text-hero-tagline">
                Minder afhankelijk van platformen en knoppen, meer grip op je eigen netwerk en omzet.
              </p>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Lokale ondernemer in Nederland" 
                className="rounded-md shadow-lg w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Wat je krijgt */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Simpel, offline-proof en menselijk
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Een platform waar lokale ondernemers weer simpel kunnen ondernemen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card data-testid="card-feature-network">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Lokaal Netwerk
                </h3>
                <p className="text-muted-foreground">
                  Ondernemers in jouw buurt die je echt kunt bellen en doorverwijzen. 
                  Zie direct wie er cash accepteert, bonnen heeft en offline kan werken.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-basischeck">
              <CardContent className="p-6">
                <Battery className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Basischeck & Badges
                </h3>
                <p className="text-muted-foreground">
                  Hoe stevig is jouw bedrijf als systemen haperen? Doe de check en 
                  toon je weerbaarheid met badges: cash, bonnenblok, noodstroom.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-offline">
              <CardContent className="p-6">
                <Printer className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Offline Modus
                </h3>
                <p className="text-muted-foreground">
                  Printbare ledenlijst, factuur-templates en kasboek. 
                  Niet alleen een app, maar ook papier als onderdeel van het systeem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Weerbaarheid Badges Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Weerbaarheidsprofiel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bij elk lid een duidelijk profiel: hoe goed is dit bedrijf voorbereid?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Banknote, label: "Accepteert cash", desc: "Contant betalen mogelijk" },
              { icon: FileText, label: "Bonnenblok", desc: "Papieren factuur beschikbaar" },
              { icon: Phone, label: "Telefoonlijst", desc: "Bereikbaar zonder internet" },
              { icon: Battery, label: "Noodstroom", desc: "Powerbank of generator" },
              { icon: Users, label: "Offline werk", desc: "Kan zonder computer" },
            ].map((badge, idx) => (
              <Card key={idx} data-testid={`card-badge-${idx}`} className="text-center">
                <CardContent className="p-4">
                  <badge.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">{badge.label}</h4>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Wat ondernemers zeggen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Maria van den Berg",
                business: "Bakkerij De Gouden Korrel",
                quote: "Eindelijk weet ik welke collega's ook cash accepteren. Vorige week viel de pin uit – ik kon mijn klanten gewoon doorsturen.",
              },
              {
                name: "Henk Jansen",
                business: "Fietsenmaker Henk",
                quote: "Die Basischeck was een wake-up call. Nu heb ik een bonnenblok en een telefoonlijst op papier. Kost niks, werkt altijd.",
              },
              {
                name: "Sophie de Vries",
                business: "Groen Advies",
                quote: "Geen algoritmes, geen gedoe. Gewoon een lijst met ondernemers in mijn buurt die ik kan bellen. Zoals het hoort.",
              },
            ].map((testimonial, idx) => (
              <Card key={idx} data-testid={`card-testimonial-${idx}`}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
            €9,95 per maand, maandelijks opzegbaar
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Geen contracten, geen gedoe. Toegang tot het lokale netwerk, de Basischeck, 
            printbare templates en alle weerbaarheidsbadges.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/start?plan=basic">
              <Button size="lg" data-testid="button-cta-join">
                Word lid – €9,95 p/m
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/basischeck">
              <Button variant="outline" size="lg" data-testid="button-cta-basischeck">
                Eerst de Basischeck doen
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Later: RegioPunten als interne strippenkaart voor doorverwijzingen en hulp.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-accent font-bold text-lg mb-4">OpenRegio</h3>
              <p className="text-sm text-muted-foreground">
                Een platform waar lokale ondernemers weer simpel kunnen ondernemen, 
                met cash, papier en korte lijntjes — én een offline modus.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link 
                    href="/lidmaatschap"
                    className="hover:text-primary transition-colors" 
                    data-testid="link-footer-membership"
                  >
                    Lidmaatschap
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/basischeck"
                    className="hover:text-primary transition-colors" 
                    data-testid="link-footer-basischeck"
                  >
                    Basischeck
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/login"
                    className="hover:text-primary transition-colors" 
                    data-testid="link-footer-login"
                  >
                    Inloggen
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Juridisch</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link 
                    href="/privacy"
                    className="hover:text-primary transition-colors" 
                    data-testid="link-footer-privacy"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/voorwaarden"
                    className="hover:text-primary transition-colors" 
                    data-testid="link-footer-terms"
                  >
                    Voorwaarden
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:info@openregio.nl" className="hover:text-primary transition-colors" data-testid="link-footer-email">
                  info@openregio.nl
                </a>
              </p>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 OpenRegio – lokaal netwerk, ondernemen terug naar de basis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
