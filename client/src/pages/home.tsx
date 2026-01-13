import { ArrowRight, Users, FileText, MapPin, Wallet, Handshake, Bot, Shield, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import heroImage from "@assets/32ce6a59-6745-406f-98f9-83d9c58d115e_1768314351466.png";
import regioMarktImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1768314409698.png";

type PainPoint = {
  title: string;
  icon: React.ReactNode;
};

type Step = {
  number: number;
  title: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const painPoints: PainPoint[] = [
  {
    title: "Te weinig vaste klanten",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Onzekerheid door brieven en regelgeving",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Slecht vindbaar in je regio",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Te late betalingen / onrustige cashflow",
    icon: <Wallet className="h-6 w-6" />,
  },
];

const steps: Step[] = [
  { number: 1, title: "Maak je profiel aan" },
  { number: 2, title: "Doe de basischeck" },
  { number: 3, title: "Kies: RegioMarkt (klanten) of RegioBot (brieven)" },
  { number: 4, title: "Word sterker in je regio" },
];

const testimonials: Testimonial[] = [
  {
    quote: "Ik krijg nu elke week werk via andere ondernemers.",
    name: "Sanne",
    role: "Schoonmaak",
  },
  {
    quote: "RegioBot scheelt tijd en geeft direct overzicht.",
    name: "Mo",
    role: "Installateur",
  },
  {
    quote: "Duidelijke afspraken. Korte lijnen. Gewoon samenwerken.",
    name: "Jeroen",
    role: "Drukwerk",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <div className="h-8 w-8 rounded-xl bg-primary" />
            <span className="font-semibold tracking-tight">OpenRegio</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a className="hover:text-primary transition-colors" href="#herkenbaar" data-testid="link-nav-herkenbaar">
              Herkenbaar?
            </a>
            <a className="hover:text-primary transition-colors" href="#wat-doet" data-testid="link-nav-wat">
              Wat doet OpenRegio?
            </a>
            <a className="hover:text-primary transition-colors" href="#basischeck" data-testid="link-nav-basischeck">
              Basischeck
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" data-testid="link-nav-login">
              <Button variant="ghost" size="sm" data-testid="button-nav-login">
                Inloggen
              </Button>
            </Link>
            <Link href="/start?plan=basic" data-testid="link-nav-start">
              <Button size="sm" data-testid="button-nav-start">
                Word lid
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary mb-2">Voor lokale ondernemers</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl leading-tight" data-testid="text-hero-title">
              Meer lokale klanten.
              <br />
              <span className="text-muted-foreground">Duidelijkheid bij brieven en regels.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed" data-testid="text-hero-subtitle">
              Veel ondernemers lopen vast op wisselende omzet, online zichtbaarheid en onduidelijke communicatie van instanties.
              OpenRegio helpt je aan meer werk en meer grip — lokaal, praktisch en zonder omwegen.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/regiomarkt" data-testid="link-hero-klanten">
                <Button size="lg" data-testid="button-hero-klanten">
                  Ik wil meer klanten <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/regiobot" data-testid="link-hero-brieven">
                <Button variant="outline" size="lg" data-testid="button-hero-brieven">
                  Ik wil brieven begrijpen
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5" />
            <img
              src={heroImage}
              alt="Lokale ondernemer"
              className="w-full rounded-2xl object-cover shadow-lg"
              data-testid="img-hero"
            />
          </div>
        </div>
      </section>

      <section id="herkenbaar" className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight mb-4" data-testid="text-herkenbaar-title">
            Herkenbaar?
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            OpenRegio maakt dit concreet en oplosbaar.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point) => (
              <Card key={point.title} className="text-center p-6" data-testid={`card-pain-${point.title.toLowerCase().replace(/\s/g, '-').slice(0, 20)}`}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {point.icon}
                </div>
                <p className="font-medium">{point.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="wat-doet" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight mb-2" data-testid="text-wat-title">
            Wat doet OpenRegio?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Twee dingen die het verschil maken
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="overflow-hidden border-2 border-blue-200 dark:border-blue-900" data-testid="card-regiomarkt">
              <div className="bg-blue-50 dark:bg-blue-950 px-6 py-4 border-b border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">MEER KLANTEN</p>
                    <h3 className="font-bold text-lg">RegioMarkt (B2B)</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Je krijgt geen netwerk om "te praten".<br />
                  <span className="font-medium text-foreground">Je krijgt doorverwijzingen en samenwerkingen.</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Lokale ondernemers verwijzen klanten naar elkaar, maken bundels en werken met vaste partners — zonder advertenties of platforms.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Doorverwijzingen uit je regio</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Gezamenlijke acties & bundels</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Meer zekerheid via vaste partners</span>
                  </li>
                </ul>
                <img
                  src={regioMarktImage}
                  alt="Ondernemers in je regio"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <Link href="/regiomarkt" data-testid="link-regiomarkt">
                  <Button className="w-full" data-testid="button-regiomarkt">
                    Bekijk RegioMarkt <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-900" data-testid="card-regiobot">
              <div className="bg-purple-50 dark:bg-purple-950 px-6 py-4 border-b border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">BRIEVEN & REGELS</p>
                    <h3 className="font-bold text-lg">RegioBot & WOO</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Upload een brief.<br />
                  <span className="font-medium text-foreground">Krijg helderheid: wat staat er, wat betekent het, welke stukken horen erbij.</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  RegioBot helpt je met:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Brieven begrijpelijk maken</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>WOO-verzoeken genereren</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Reactie- en bezwaar-templates</span>
                  </li>
                </ul>
                <div className="bg-muted rounded-xl p-6 mb-4 flex items-center justify-center h-48">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-primary mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">AI-assistent voor juridische documenten</p>
                  </div>
                </div>
                <Link href="/regiobot" data-testid="link-regiobot">
                  <Button className="w-full" data-testid="button-regiobot">
                    Start RegioBot <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="basischeck" className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Shield className="h-4 w-4" />
              Continuïteit
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4" data-testid="text-basischeck-title">
              De Basischeck
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Cash. Bonnen. Bereikbaarheid. Offline kunnen werken. Noodstroom.
            </p>
            <p className="text-muted-foreground mb-8">
              Een snelle check die laat zien hoe goed je bedrijf blijft functioneren als systemen haperen.
              <br />
              <span className="font-medium text-foreground">Je score bepaalt welke functies en kansen je krijgt binnen het netwerk.</span>
            </p>
            <Link href="/basischeck" data-testid="link-basischeck">
              <Button size="lg" data-testid="button-basischeck">
                Doe de Basischeck <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight mb-12" data-testid="text-steps-title">
            Zo werkt het
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.number} className="p-6" data-testid={`card-step-${step.number}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {step.number}
                  </div>
                  <p className="font-medium pt-2">{step.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight mb-12" data-testid="text-testimonials-title">
            Ervaringen van leden
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6" data-testid={`testimonial-${t.name.toLowerCase()}`}>
                <p className="text-muted-foreground mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground text-center" data-testid="section-cta">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Sluit je aan bij ondernemers in jouw regio
            </h2>
            <p className="text-primary-foreground/90 mb-8 text-lg max-w-xl mx-auto">
              Start simpel. Werk lokaal. Bouw aan continuïteit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/start?plan=basic" data-testid="link-cta-register">
                <Button variant="secondary" size="lg" data-testid="button-cta-register">
                  Word lid
                </Button>
              </Link>
              <Link href="/regios" data-testid="link-cta-regions">
                <Button variant="secondary" size="lg" data-testid="button-cta-regions">
                  Bekijk beschikbare plekken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} OpenRegio • Lokaal. Direct. Weerbaar.
        </div>
      </footer>
    </div>
  );
}
