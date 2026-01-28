import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Users, Banknote, Phone, Battery, FileText, Printer, ArrowRight, Check, Sparkles, Bot, ShieldCheck, Lock, Cookie, Store, Eye, ClipboardCheck, UserPlus, BookOpen, Calendar, User, CheckCircle2, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Blog } from "@shared/schema";
import heroImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1768374708257.png";

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

      {/* De 4 pijlers van OpenRegio */}
      <section className="py-20 px-4" id="pijlers">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              De 4 pijlers van OpenRegio
            </h2>
          </div>

          <div className="space-y-16">
            {/* RegioMarkt */}
            <div className="grid md:grid-cols-2 gap-8 items-center" data-testid="card-feature-regiomarkt">
              <img 
                src="/img/regiomarkt.png" 
                alt="RegioMarkt" 
                className="w-full rounded-xl shadow-lg"
              />
              <div>
                <p className="text-primary font-semibold mb-2">RegioMarkt</p>
                <h3 className="font-accent text-2xl font-bold mb-4">Werk blijft in de regio</h3>
                <p className="text-muted-foreground mb-4">
                  RegioMarkt is een open netwerk van ondernemers binnen één regio. Ondernemers kunnen werk doorverwijzen wanneer zij het zelf niet uitvoeren.
                </p>
                <p className="text-muted-foreground mb-4">
                  Er zijn geen advertenties en geen algoritmes. De indeling is vast per regio.
                </p>
                <p className="font-semibold">Effect: werk kan binnen de regio worden herverdeeld.</p>
              </div>
            </div>

            {/* RegioBot */}
            <div className="grid md:grid-cols-2 gap-8 items-center" data-testid="card-feature-regiobot">
              <img 
                src="/img/regiobot.png" 
                alt="RegioBot" 
                className="w-full rounded-xl shadow-lg md:order-2"
              />
              <div className="md:order-1">
                <p className="text-primary font-semibold mb-2">RegioBot</p>
                <h3 className="font-accent text-2xl font-bold mb-4">WOO & regelgeving, zonder ruis</h3>
                <p className="text-muted-foreground mb-4">
                  RegioBot ontsluit documenten zoals WOO-verzoeken, besluiten, beleidsregels en mandaten.
                </p>
                <p className="text-muted-foreground mb-4">
                  RegioBot geeft geen mening en geen interpretatie. Het toont wat er is en wat ontbreekt.
                </p>
                <p className="font-semibold">Effect: regelgeving is inzichtelijk op documentniveau.</p>
              </div>
            </div>

            {/* Zichtbaarheid */}
            <div className="grid md:grid-cols-2 gap-8 items-center" data-testid="card-feature-zichtbaarheid">
              <img 
                src="/img/zichtbaarheid.png" 
                alt="Zichtbaarheid" 
                className="w-full rounded-xl shadow-lg"
              />
              <div>
                <p className="text-primary font-semibold mb-2">Zichtbaarheid</p>
                <h3 className="font-accent text-2xl font-bold mb-4">Vindbaar waar het telt</h3>
                <p className="text-muted-foreground mb-4">
                  Dit onderdeel richt zich op correcte bedrijfsvermeldingen, reviews en regionale zoekresultaten.
                </p>
                <p className="text-muted-foreground mb-4">
                  Er wordt geen contentstrategie en geen advertentiemodel gebruikt.
                </p>
                <p className="font-semibold">Effect: bedrijven zijn vindbaar binnen hun regio.</p>
              </div>
            </div>

            {/* Basischeck */}
            <div className="grid md:grid-cols-2 gap-8 items-center" data-testid="card-feature-basischeck">
              <img 
                src="/img/basischeck.png" 
                alt="Basischeck" 
                className="w-full rounded-xl shadow-lg md:order-2"
              />
              <div className="md:order-1">
                <p className="text-primary font-semibold mb-2">Basischeck</p>
                <h3 className="font-accent text-2xl font-bold mb-4">Betrouwbaar, ook als systemen falen</h3>
                <p className="text-muted-foreground mb-4">
                  De Basischeck registreert of een bedrijf bereikbaar is, offline kan functioneren en basisbetalingen kan verwerken.
                </p>
                <p className="text-muted-foreground mb-4">
                  Deze gegevens worden gebruikt binnen het netwerk.
                </p>
                <p className="font-semibold">Effect: betrouwbaarheid is zichtbaar binnen de regio.</p>
              </div>
            </div>
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
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Zo werkt OpenRegio
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Van aanmelding tot voordeel in 4 stappen
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                step: "1", 
                icon: User,
                title: "Maak je profiel aan",
                description: "Vul je bedrijfsgegevens in en kies je regio en vakgebied"
              },
              { 
                step: "2", 
                icon: CheckCircle2,
                title: "Doe de Basischeck",
                description: "Beantwoord praktische vragen en verdien je weerbaarheidsbadges"
              },
              { 
                step: "3", 
                icon: Zap,
                title: "Gebruik RegioMarkt + RegioBot",
                description: "Vind collega's, verwijs werk door en krijg grip op WOO-documenten"
              },
              { 
                step: "4", 
                icon: TrendingUp,
                title: "Bouw voordeel op",
                description: "Stem mee, deel kennis en versterk je positie in de regio"
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="relative overflow-visible" data-testid={`card-step-${idx + 1}`}>
                  <div className="absolute -top-4 left-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <CardContent className="pt-8 pb-6 px-4">
                    <div className="mb-3">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/start?plan=basic">
              <Button size="lg" data-testid="button-steps-cta">
                Begin nu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
              Word lid v.a. €12,95 per maand excl. BTW
            </h2>
            <p className="text-xl text-muted-foreground">
              Maandelijks opzegbaar, geen contracten
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basis-lid */}
            <Card data-testid="card-plan-basic" className="relative">
              <CardContent className="p-8">
                <h3 className="font-accent text-2xl font-bold mb-2">Basis-lid</h3>
                <p className="text-sm text-muted-foreground mb-4">Volwaardig lid van de coöperatie</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€12,95</span>
                  <span className="text-muted-foreground">/ maand excl. BTW</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Profiel in het lokale netwerk",
                    "Ledenlijst met contactgegevens",
                    "Vraag & aanbod-bord (RegioMarkt)",
                    "RegioCrew flexpool toegang",
                    "Basischeck + weerbaarheidsbadges",
                    "Volledige stemrecht in coöperatie",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/start?plan=basic">
                  <Button className="w-full" size="lg" data-testid="button-plan-basic">
                    Word Basis-lid
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro-bijdrager */}
            <Card data-testid="card-plan-pro" className="relative border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Populair
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-accent text-2xl font-bold mb-2">Pro-bijdrager</h3>
                <p className="text-sm text-muted-foreground mb-4">Draag extra bij, krijg krachtige tools</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€24</span>
                  <span className="text-muted-foreground">/ maand excl. BTW</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Alles van Basis-lid, plus:",
                    "RegioBot (WOO & mandaat-checks)",
                    "Persoonlijke WOO-bibliotheek",
                    "Vervolg-WOO vragen generator",
                    "Bronnen & verwijzingen per antwoord",
                    "Prioriteit ondersteuning",
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
                    Word Pro-bijdrager
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
