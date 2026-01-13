import { ArrowRight, BadgeCheck, HandCoins, ShieldCheck, Users, Wrench, Check, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import heroImage from "@assets/stock_images/local_business_entre_58180e30.jpg";
import featMarket from "@assets/stock_images/small_business_owner_251014d7.jpg";
import featBot from "@assets/stock_images/small_business_owner_c1f9562b.jpg";
import featResilience from "@assets/stock_images/small_business_owner_da583765.jpg";
import testimonial1 from "@assets/stock_images/professional_woman_b_1e05183c.jpg";
import testimonial2 from "@assets/stock_images/professional_man_tra_3355e112.jpg";
import testimonial3 from "@assets/stock_images/professional_man_tra_59ee30f0.jpg";

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  image: string;
};

type Step = {
  title: string;
  desc: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: string;
};

const features: Feature[] = [
  {
    title: "RegioMarkt",
    desc: "Ondernemers geven elkaar klussen en klanten. Geen ruis, wel deals.",
    icon: <Users className="h-5 w-5" />,
    image: featMarket,
  },
  {
    title: "RegioBot",
    desc: "Check boetes, aanslagen en regels met één klik. WOO & templates klaar.",
    icon: <ShieldCheck className="h-5 w-5" />,
    image: featBot,
  },
  {
    title: "Weerbaar ondernemen",
    desc: "Cash, bonnen, offline werken, noodstroom. Jij blijft draaien.",
    icon: <BadgeCheck className="h-5 w-5" />,
    image: featResilience,
  },
];

const steps: Step[] = [
  {
    title: "Meld je aan",
    desc: "Maak je bedrijfsprofiel en kies je regio.",
  },
  {
    title: "Doe de basischeck",
    desc: "Score 0–5 op cash, bonnen, bereikbaarheid en noodstroom.",
  },
  {
    title: "Krijg leads uit je regio",
    desc: "Doorverwijzingen, bundels en vaste samenwerkingen.",
  },
  {
    title: "Gebruik RegioBot als het misgaat",
    desc: "WOO/bezwaar/mandaatvragen: bewijsgedreven en simpel.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote: "Ik krijg nu elke week werk via andere ondernemers.",
    name: "Sanne",
    role: "Schoonmaak & onderhoud",
    image: testimonial1,
  },
  {
    quote: "RegioBot scheelt me zóveel gezeik met brieven en termijnen.",
    name: "Mo",
    role: "Installateur",
    image: testimonial2,
  },
  {
    quote: "Geen praatclub. Gewoon doorverwijzen en leveren.",
    name: "Jeroen",
    role: "Drukwerk & signage",
    image: testimonial3,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <div className="h-8 w-8 rounded-xl bg-primary" />
            <span className="font-semibold tracking-tight">OpenRegio</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a className="hover:text-primary transition-colors" href="#wat" data-testid="link-nav-wat">
              Wat is dit?
            </a>
            <a className="hover:text-primary transition-colors" href="#hoe" data-testid="link-nav-hoe">
              Hoe werkt het
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

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <HandCoins className="h-4 w-4" />
              Terug naar de basis. Meer omzet. Minder gedoe.
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl" data-testid="text-hero-title">
              Meer lokale klanten.
              <br />
              Minder gedoe.
            </h1>
            <p className="mt-4 max-w-prose text-base text-muted-foreground md:text-lg" data-testid="text-hero-subtitle">
              OpenRegio is het regionale netwerk waar ondernemers elkaar{" "}
              <span className="font-semibold text-foreground">
                werk, klanten en bescherming
              </span>{" "}
              geven. Geen ruis, wel resultaat.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/start?plan=basic" data-testid="link-hero-register">
                <Button size="lg" data-testid="button-hero-register">
                  Word lid <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/regios" data-testid="link-hero-regions">
                <Button variant="outline" size="lg" data-testid="button-hero-regions">
                  Bekijk jouw regio
                </Button>
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniStat icon={<Wrench className="h-4 w-4" />} label="Deals" value="B2B doorverwijzing" />
              <MiniStat icon={<ShieldCheck className="h-4 w-4" />} label="RegioBot" value="WOO + bezwaar" />
              <MiniStat icon={<BadgeCheck className="h-4 w-4" />} label="Basischeck" value="weerbaarheid 0–5" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-primary/10" />
            <img
              src={heroImage}
              alt="OpenRegio hero"
              className="h-[340px] w-full rounded-3xl object-cover shadow-sm md:h-[420px]"
              data-testid="img-hero"
            />
          </div>
        </div>
      </section>

      <section id="wat" className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-3xl font-extrabold tracking-tight" data-testid="text-features-title">
            Wat is OpenRegio?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Drie motoren. Eén doel: jouw bedrijf lokaal sterker maken.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="overflow-hidden" data-testid={`card-feature-${f.title.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="flex items-center gap-2 border-b px-5 py-4">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    {f.icon}
                  </div>
                  <div className="font-semibold">{f.title}</div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                  <img
                    src={f.image}
                    alt={f.title}
                    className="mt-4 h-40 w-full rounded-xl object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="hoe" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-extrabold tracking-tight" data-testid="text-steps-title">
          Herkenbaar?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Lege agenda. Gedoe met brieven. Onzichtbaar in je regio. Dit is de flow.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((s, idx) => (
            <Card key={s.title} className="p-4" data-testid={`card-step-${idx + 1}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="basischeck" className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6" data-testid="card-testimonials">
              <h3 className="text-xl font-extrabold tracking-tight">
                Zo klinkt het bij leden
              </h3>
              <div className="mt-5 space-y-4">
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="flex gap-3 rounded-xl border bg-card p-4"
                    data-testid={`testimonial-${t.name.toLowerCase()}`}
                  >
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">"{t.quote}"</p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {t.name}
                        </span>{" "}
                        • {t.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/start?plan=basic" data-testid="link-testimonials-register">
                  <Button data-testid="button-testimonials-register">
                    Word lid <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <BasischeckCard />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-10" data-testid="section-cta">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Sluit je aan bij ondernemers in jouw regio.
              </h2>
              <p className="mt-3 text-primary-foreground/90">
                Start simpel. Regel je basis. Pak door met deals.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/start?plan=basic" data-testid="link-cta-register">
                <Button variant="secondary" data-testid="button-cta-register">
                  Word lid
                </Button>
              </Link>
              <Link href="/regios" data-testid="link-cta-regions">
                <Button variant="secondary" data-testid="button-cta-regions">
                  Bekijk beschikbare plekken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} OpenRegio • Lokaal. Direct. Weerbaar.
        </div>
      </footer>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </Card>
  );
}

function BasischeckCard() {
  const items = [
    { label: "Cash", value: "Ja", ok: true },
    { label: "Bonnenblok", value: "Ja", ok: true },
    { label: "Papieren telefoonlijst", value: "Nee", ok: false },
    { label: "Offline kunnen werken", value: "Ja", ok: true },
    { label: "Noodstroom", value: "Nee", ok: false },
  ];

  return (
    <Card className="p-6" data-testid="card-basischeck-preview">
      <h3 className="text-xl font-extrabold tracking-tight">
        De Basischeck:{" "}
        <span className="text-primary">3/5</span>
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Een snelle score die bepaalt hoe betrouwbaar je bent als handelspartner.
      </p>

      <div className="mt-5 divide-y rounded-xl border">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  it.ok ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {it.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <span className="text-sm font-medium">{it.label}</span>
            </div>
            <span className="text-sm text-muted-foreground">{it.value}</span>
          </div>
        ))}
      </div>

      <Link href="/basischeck" className="block mt-6" data-testid="link-basischeck-start">
        <Button className="w-full" data-testid="button-basischeck-start">
          Verbeter mijn score <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>

      <p className="mt-3 text-xs text-muted-foreground">
        * In RegioMarkt kun je hiermee straks ook toegang/slots sturen (score 3+).
      </p>
    </Card>
  );
}
