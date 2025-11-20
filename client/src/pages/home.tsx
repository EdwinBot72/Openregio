import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Users, Sparkles, Vote, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/stock_images/happy_diverse_local__1fc55774.jpg";

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
              href="/lidmaatschap" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2 bg-primary text-primary-foreground border border-primary-border" 
              data-testid="button-nav-start"
            >
              Start nu
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-accent text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Jouw digitale onafhankelijkheid begint hier
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Sluit je aan bij de coöperatieve beweging van lokale ondernemers. 
                Geen Big Tech, geen algoritmes, wel échte samenwerking.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/lidmaatschap?plan=basic" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors hover-elevate active-elevate-2 min-h-10 px-6 py-2 text-lg border border-input bg-background" 
                  data-testid="button-hero-basic"
                >
                  Word Basis lid – €9,95
                </Link>
                <Link 
                  href="/lidmaatschap?plan=pro" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors hover-elevate active-elevate-2 min-h-10 px-6 py-2 text-lg bg-primary text-primary-foreground border border-primary-border" 
                  data-testid="button-hero-pro"
                >
                  Word Pro – €19,95 (incl. RegioBot)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Lokale ondernemers die samenwerken" 
                className="rounded-md shadow-lg w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Waarom OpenRegio?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Een platform gemaakt door en voor lokale ondernemers
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
                  Ontdek en verbind met ondernemers in jouw regio. Vind samenwerkingspartners en bouw samen aan een sterker lokaal bedrijfsleven.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-regiobot">
              <CardContent className="p-6">
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  RegioBot AI Assistent
                </h3>
                <p className="text-muted-foreground">
                  Krijg gratis hulp bij marketing, SEO en bedrijfsstrategie van onze slimme AI-assistent, speciaal voor lokale ondernemers.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-coop">
              <CardContent className="p-6">
                <Vote className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Democratisch Platform
                </h3>
                <p className="text-muted-foreground">
                  Stem mee over de toekomst van het platform. Als lid van onze coöperatie heb jij direct invloed op alle beslissingen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
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
                quote: "Eindelijk een platform dat echt werkt voor lokale ondernemers. Ik heb al drie samenwerkingen opgezet!",
              },
              {
                name: "Ahmed Hassan",
                business: "Tech Solutions NL",
                quote: "RegioBot helpt me enorm met marketing. Mijn bereik is verdubbeld sinds ik OpenRegio gebruik.",
              },
              {
                name: "Sophie de Vries",
                business: "Groen Advies",
                quote: "Het is fijn om onderdeel te zijn van een coöperatie. We hebben eindelijk een stem in ons eigen platform.",
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

      {/* CTA Section - Membership Plans */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Kies jouw lidmaatschap
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start met een Basic plan of ontgrendel alle functies met Pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card data-testid="card-plan-basic" className="relative">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="font-accent text-2xl font-bold mb-2">Basis</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">€9,95</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect om te starten met lokaal netwerken
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Toegang tot lokaal netwerk</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Vote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Stemrecht in coöperatie</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Zichtbaar bedrijfsprofiel</span>
                  </li>
                </ul>

                <Link href="/lidmaatschap?plan=basic" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    data-testid="button-plan-basic"
                  >
                    Word Basis lid – €9,95
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card data-testid="card-plan-pro" className="relative border-primary/50 shadow-lg">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-md text-xs font-semibold">
                POPULAIR
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="font-accent text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">€19,95</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Volledige toegang inclusief AI-assistent
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold">RegioBot AI Assistent</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Alle Basis functies</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>AI marketing & juridische hulp</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Document upload & analyse</span>
                  </li>
                </ul>

                <Link href="/lidmaatschap?plan=pro" className="w-full">
                  <Button 
                    className="w-full" 
                    size="lg"
                    data-testid="button-plan-pro"
                  >
                    Word Pro – €19,95 (incl. RegioBot)
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-accent font-bold text-lg mb-4">OpenRegio</h3>
              <p className="text-sm text-muted-foreground">
                Het coöperatieve platform voor lokale ondernemers in Nederland.
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
            <p>© 2024 OpenRegio Coöperatie U.A. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
