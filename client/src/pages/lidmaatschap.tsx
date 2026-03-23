import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { Link, useSearch } from "wouter";

const MOLLIE_BASIC_LINK = import.meta.env.VITE_MOLLIE_BASIC_PAYMENT_LINK as string || "https://payment-links.mollie.com/payment/FNnWr8uofpfEd6PJQMWHk";
const MOLLIE_PRO_LINK = import.meta.env.VITE_MOLLIE_PRO_PAYMENT_LINK as string || "https://payment-links.mollie.com/payment/nEdtEni7GkJG7rHHetyBs";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: "basic" | "pro";
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: PlanFeature[];
  paymentLink: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basis-lid",
    price: "€12,95",
    priceNote: "excl. BTW / maand",
    description: "Volwaardig lid van de coöperatie",
    paymentLink: MOLLIE_BASIC_LINK,
    features: [
      { text: "Bedrijfsprofiel in lokaal netwerk", included: true },
      { text: "Ontdek en ontmoet ondernemers", included: true },
      { text: "Volledig stemrecht in de coöperatie", included: true },
      { text: "Basischeck & weerbaarheidsbadges", included: true },
      { text: "RegioBot & WOO-bibliotheek", included: false },
      { text: "Printbare overzichten", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro-bijdrager",
    price: "€24,95",
    priceNote: "excl. BTW / maand",
    description: "Draag extra bij en krijg krachtige tools",
    paymentLink: MOLLIE_PRO_LINK,
    features: [
      { text: "Alles van Basis-lid", included: true },
      { text: "RegioBot: WOO & regelgeving AI", included: true },
      { text: "Persoonlijke WOO-bibliotheek", included: true },
      { text: "Printbare overzichten", included: true },
      { text: "Prioriteit ondersteuning", included: true },
      { text: "Bouw mee aan nieuwe features", included: true },
    ],
    popular: true,
  },
];

export default function LidmaatschapPage() {
  usePageTitle("Lidmaatschap");
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const urlPlan = params.get("plan");

  const initialPlan = (urlPlan === "pro" ? "pro" : "basic") as "basic" | "pro";
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">(initialPlan);

  useEffect(() => {
    if (urlPlan === "pro" || urlPlan === "basic") {
      setSelectedPlan(urlPlan);
    }
  }, [urlPlan]);

  const activePlan = plans.find((p) => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
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
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
            data-testid="link-login"
          >
            Al lid? Inloggen
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">
            Word lid van OpenRegio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kies een plan dat bij jouw onderneming past en start vandaag nog met lokale samenwerking
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-primary" : ""
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Populair
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-accent text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.priceNote}</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  className="w-full mb-6"
                  onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.id); }}
                  data-testid={`button-select-${plan.id}`}
                >
                  {selectedPlan === plan.id ? "Geselecteerd" : "Selecteer dit plan"}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          feature.included ? "text-primary" : "text-muted-foreground/30"
                        }`}
                      />
                      <span
                        className={feature.included ? "" : "text-muted-foreground line-through"}
                        data-testid={`text-feature-${plan.id}-${idx}`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA — always a direct Mollie Payment Link */}
        <Card className="max-w-md mx-auto" data-testid="card-payment-cta">
          <CardHeader>
            <CardTitle>Start {activePlan.name}</CardTitle>
            <CardDescription>
              Maandelijks abonnement van {activePlan.price} {activePlan.priceNote} — opzegbaar per maand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Je betaalt veilig via Mollie. Na betaling maak je direct je account aan.
            </p>
            <Button
              className="w-full"
              asChild
              data-testid="button-payment-link"
            >
              <a href={activePlan.paymentLink} target="_blank" rel="noopener noreferrer">
                Ga naar betaling ({activePlan.price}/mnd)
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Na betaling word je teruggestuurd om je account aan te maken
            </p>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Veilige betaling via Mollie • Direct toegang na betaling • Opzeggen wanneer je wilt</p>
        </div>
      </div>
    </div>
  );
}
