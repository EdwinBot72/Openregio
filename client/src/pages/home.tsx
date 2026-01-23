import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Users, Banknote, Phone, Battery, FileText, Printer, ArrowRight, Check, Sparkles, Bot, ShieldCheck, Lock, Cookie, Store, Eye, ClipboardCheck, UserPlus, BookOpen, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Blog } from "@shared/schema";
import heroImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1768374708257.png";
import howItWorksImage from "@assets/a6c26f1e-d111-4563-9ebd-09dd423e6ffd_1768342440500.png";

export default function HomePage() {
  const { data: blogs = [] } = useQuery<Blog[]>({
    queryKey: ["/api/blogs/public"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  };

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
              href="/blogs" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-blogs"
            >
              Blogs
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
                Inzicht maakt ondernemen voorspelbaarder.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4" data-testid="text-hero-subtitle">
                Onduidelijke regels en versnipperd werk kosten ondernemers meer tijd dan hun eigen vak.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                OpenRegio organiseert lokaal ondernemen rond vier vaste pijlers: werk in de regio, inzicht in regelgeving, lokale zichtbaarheid en operationele betrouwbaarheid.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Ondersteund door een gezamenlijke WOO-bibliotheek en RegioBot die documenten leest zoals ze bedoeld zijn.
              </p>
              <p className="text-base font-medium mb-6">
                Zo ontstaat rust, overzicht en continuïteit.
              </p>
              <p className="text-sm text-primary font-semibold mb-8" data-testid="text-hero-urgency">
                Elke regio die dit niet organiseert, verliest werk en grip zonder het te merken.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/start?plan=basic">
                  <Button size="lg" data-testid="button-hero-basic">
                    Claim je regio
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/regiobot">
                  <Button variant="outline" size="lg" data-testid="button-hero-basischeck">
                    Organiseer werk en regels
                  </Button>
                </Link>
              </div>
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

      {/* Waarom OpenRegio nodig is */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4">
              Waarom OpenRegio nodig is
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ondernemen wordt onvoorspelbaar wanneer werk, regels en besluiten niet als één geheel zijn georganiseerd.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-sm">
            {[
              "Werk niet kan worden doorverwezen binnen de regio",
              "Regels bestaan, maar niet inzichtelijk zijn",
              "Besluiten worden toegepast zonder zichtbaar kader",
              "Bevoegdheden onduidelijk zijn belegd",
              "Tijd verdwijnt in systemen in plaats van in ondernemen",
            ].map((punt, idx) => (
              <div key={idx} className="p-3 rounded-md bg-background border">
                {punt}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waarom ondernemers zich aansluiten */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4">
              Waarom ondernemers zich aansluiten
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ondernemers sluiten zich niet aan voor gezelligheid, maar om grip te houden op hun bedrijf.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-3xl mx-auto">
            {[
              "Omdat werk onnodig uit de regio verdwijnt",
              "Omdat regels en besluiten bestaan, maar niet doorzichtig zijn",
              "Omdat afhankelijkheid van platforms kwetsbaar maakt",
              "Omdat rust en continuïteit geen luxe zijn",
            ].map((reden, idx) => (
              <div key={idx} className="p-4 rounded-md bg-muted/50 border-l-4 border-l-primary">
                {reden}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hoe OpenRegio Werkt - Infographic */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <img 
            src={howItWorksImage} 
            alt="Hoe OpenRegio Werkt - RegioMarkt, RegioBot, RegioCrew, Zichtbaarheid, Basischeck" 
            className="rounded-md shadow-lg w-full h-auto"
            data-testid="img-how-it-works"
          />
        </div>
      </section>

      {/* De 4 pijlers van OpenRegio */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              De 4 pijlers van OpenRegio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card data-testid="card-feature-regiomarkt" className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <Store className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  RegioMarkt — Werk blijft in de regio
                </h3>
                <p className="text-muted-foreground mb-4">
                  Een gesloten netwerk waar ondernemers elkaar gericht doorverwijzen en werk verdelen. Geen algoritmes. Geen advertenties.
                </p>
                <p className="text-sm font-medium text-blue-600">
                  Effect: stabiele instroom en minder afhankelijkheid van platforms.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-regiobot" className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <Bot className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  RegioBot — WOO & regelgeving, zonder ruis
                </h3>
                <p className="text-muted-foreground mb-4">
                  Document-gedreven inzicht in WOO-verzoeken, besluiten, mandaten en beleidsregels. Geen meningen, alleen feiten.
                </p>
                <p className="text-sm font-medium text-primary">
                  Effect: minder risico, sneller schakelen, meer controle.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-zichtbaarheid" className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <Eye className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Zichtbaarheid — Vindbaar waar het telt
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lokale basis op orde: Google-profiel, reviews en regionale vindbaarheid.
                </p>
                <p className="text-sm font-medium text-green-600">
                  Effect: meer aanvragen uit de regio.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-basischeck" className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <ClipboardCheck className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="font-accent text-xl font-semibold mb-2">
                  Basischeck — Betrouwbaar, ook als systemen falen
                </h3>
                <p className="text-muted-foreground mb-4">
                  Check op cash, bereikbaarheid en offline werken. Je positie in het netwerk is gebaseerd op betrouwbaarheid.
                </p>
                <p className="text-sm font-medium text-orange-600">
                  Resultaat: vertrouwen en continuïteit in je regio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* RegioCrew Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card data-testid="card-regiocrew">
            <CardContent className="p-8 text-center">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4">
                RegioCrew — Capaciteit uit de regio
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Te veel werk, te weinig mensen? Regel het regionaal.
                Schuif werk door naar betrouwbare ondernemers, huur sneller in en werk met een flex-pool die je niet eerst hoeft te 'leren kennen'.
              </p>
              <p className="font-medium text-primary mb-6">
                Resultaat: geen omzetverlies door onderbezetting.
              </p>
              <Link href="/regiocrew">
                <Button variant="outline" data-testid="button-regiocrew">
                  Bekijk RegioCrew
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Zo werkt OpenRegio */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-accent text-2xl md:text-3xl font-bold mb-8 text-center">
            Zo werkt OpenRegio
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { step: "1", label: "Maak je profiel aan" },
              { step: "2", label: "Doe de Basischeck" },
              { step: "3", label: "Gebruik RegioMarkt + RegioBot (WOO)" },
              { step: "4", label: "Bouw voordeel op in je regio" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <p className="text-sm font-medium">{item.label}</p>
              </div>
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
              Word lid v.a. €12,95 per maand
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
                  <span className="text-4xl font-bold">€12,95</span>
                  <span className="text-muted-foreground">/ maand</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Profiel in het lokale netwerk",
                    "Ledenlijst met contactgegevens",
                    "Vraag & aanbod-bord",
                    "RegioCrew flexpool toegang",
                    "Basischeck + weerbaarheidsbadges",
                    "Printbare ledenlijst",
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
                  <span className="text-4xl font-bold">€24,00</span>
                  <span className="text-muted-foreground">/ maand</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Alles van Basis, plus:",
                    "RegioBot (WOO & mandaat-checks)",
                    "Dossier-modus (werken op WOO-dossiers)",
                    "Vervolg-WOO vragen generator",
                    "Bronnen & verwijzingen per antwoord",
                    "RegioCrew hulpvragen plaatsen",
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

      {/* Blog Section */}
      {blogs.length > 0 && (
        <section className="py-16 px-4 bg-muted/20" data-testid="section-blogs">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Laatste nieuws
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tips, updates en inzichten voor regionale ondernemers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.slice(0, 6).map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card 
                    className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all" 
                    data-testid={`card-blog-${blog.id}`}
                  >
                    {blog.featuredImage && (
                      <div className="aspect-video overflow-hidden rounded-t-md">
                        <img 
                          src={blog.featuredImage} 
                          alt={blog.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className={`p-5 ${!blog.featuredImage ? "pt-6" : ""}`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(blog.publishedAt)}
                      </div>
                      <h3 className="font-accent font-semibold text-lg mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {blog.excerpt}
                      </p>
                      <div className="mt-4 text-sm text-primary font-medium flex items-center gap-1">
                        Lees meer <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4">
            Geen praatclub. Dit is infrastructuur.
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            OpenRegio is er voor ondernemers die regionaal willen winnen én grip willen op regels.
            We bouwen samen een WOO-bibliotheek voor toezicht op beleid, mandaten en uitvoering — zonder ruis van persoonlijke boetes of privézaken.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/start?plan=basic">
              <Button size="lg" data-testid="button-final-cta">
                Word lid
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline" size="lg" data-testid="button-view-region">
                Bekijk jouw regio
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

      {/* Slot */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4">
            OpenRegio is geen platform.
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Het is infrastructuur voor lokaal ondernemen.
          </p>
          <p className="text-lg text-muted-foreground">
            Wie werk, regels en continuïteit organiseert, is minder afhankelijk van systemen die hij niet beheerst.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-accent font-bold text-lg mb-4">OpenRegio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Infrastructuur voor lokaal ondernemen.
              </p>
              <p className="text-xs text-muted-foreground">
                OpenRegio biedt informatie en documentanalyse. Geen juridisch advies.
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
            <p>© 2026 OpenRegio – Regio-omzet. Regels doorzichtig. Sterke ondernemers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
