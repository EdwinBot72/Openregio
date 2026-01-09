import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Users, Banknote, Phone, Battery, FileText, Printer, ArrowRight, Check, Sparkles, Bot, ShieldCheck, Lock, Cookie } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1767604990134.png";

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
              href="/blog" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-nav-blog"
            >
              Blog
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
                    Word lid v.a. €9,95 p/m
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
                Maandelijks opzegbaar, geen contracten. Minder afhankelijk, meer grip op je eigen netwerk.
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

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Word lid v.a. €9,95 per maand
            </h2>
            <p className="text-xl text-muted-foreground">
              Maandelijks opzegbaar, geen contracten
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basis Plan */}
            <Card data-testid="card-plan-basic" className="relative">
              <CardContent className="p-8">
                <h3 className="font-accent text-2xl font-bold mb-2">Basis</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€9,95</span>
                  <span className="text-muted-foreground">/ maand</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Profiel in het lokale netwerk",
                    "Ledenlijst met contactgegevens",
                    "Vraag & aanbod-bord",
                    "Basischeck + weerbaarheidsbadges",
                    "Printbare ledenlijst",
                    "Factuur- en kasboek-templates",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/start?plan=basic">
                  <Button className="w-full" size="lg" data-testid="button-plan-basic">
                    Word Basis lid
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card data-testid="card-plan-pro" className="relative border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Populair
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-accent text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€19,95</span>
                  <span className="text-muted-foreground">/ maand</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Alles van Basis, plus:",
                    "RegioBot AI-assistent",
                    "Juridische documenten uitleg",
                    "Marketing content generator",
                    "Documenten uploaden",
                    "Prioriteit support",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {idx === 0 ? (
                        <span className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      )}
                      <span className={idx === 0 ? "font-semibold text-primary" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/start?plan=pro">
                  <Button className="w-full" size="lg" data-testid="button-plan-pro">
                    Word Pro lid
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/basischeck">
              <Button variant="ghost" size="lg" data-testid="button-cta-basischeck">
                Eerst de gratis Basischeck doen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy & Veiligheid Section */}
      <section className="py-16 px-4 bg-muted/20" data-testid="section-privacy">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Privacy & Veiligheid voorop
            </h2>
            <p className="text-muted-foreground">
              OpenRegio is gebouwd met privacy als uitgangspunt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background" data-testid="card-privacy-tracking">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Geen trackers of Big Tech</h3>
                  <p className="text-sm text-muted-foreground">
                    Geen Google Analytics, Meta pixel of andere tracking. Je wordt niet gevolgd.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background" data-testid="card-privacy-cookies">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Alleen functionele cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Uitsluitend voor inloggen, geen marketing of advertenties.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background" data-testid="card-privacy-docs">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Jouw documenten zijn privé</h3>
                  <p className="text-sm text-muted-foreground">
                    RegioBot gesprekken en uploads zijn alleen voor jou zichtbaar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background" data-testid="card-privacy-data">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Geen dataverkoop</h3>
                  <p className="text-sm text-muted-foreground">
                    We verkopen of verhandelen jouw gegevens nooit. Punt.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <Link href="/privacy" className="text-sm text-primary hover:underline" data-testid="link-privacy-more">
              Lees onze volledige privacyverklaring
              <ArrowRight className="inline ml-1 h-3 w-3" />
            </Link>
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
            <p>© 2026 OpenRegio – lokaal netwerk, ondernemen terug naar de basis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
