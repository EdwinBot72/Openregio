import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Users, Vote, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in"),
  plan: z.enum(["basic", "pro"]),
  ref: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: "basic" | "pro";
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basis-lid",
    price: "€12,95 excl. BTW",
    description: "Volwaardig lid van de coöperatie",
    features: [
      { text: "Bedrijfsprofiel in lokaal netwerk", included: true },
      { text: "Ontdek en ontmoet ondernemers", included: true },
      { text: "Volledige stemrecht in de coöperatie", included: true },
      { text: "Basischeck & weerbaarheidsbadges", included: true },
      { text: "RegioBot & WOO-bibliotheek", included: false },
      { text: "Printbare overzichten", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro-bijdrager",
    price: "€24 excl. BTW",
    description: "Draag extra bij en krijg krachtige tools",
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

export default function StartPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  const params = new URLSearchParams(searchParams);
  const urlPlan = params.get("plan");
  const urlEmail = params.get("email");
  const ref = params.get("ref") || undefined;
  
  const initialPlan = (urlPlan === "pro" ? "pro" : "basic") as "basic" | "pro";
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: urlEmail || "",
      plan: initialPlan,
      ref: ref,
    },
  });
  
  useEffect(() => {
    if (ref) form.setValue("ref", ref);
    if (urlPlan === "pro" || urlPlan === "basic") {
      form.setValue("plan", urlPlan);
      setSelectedPlan(urlPlan);
    }
    if (urlEmail) form.setValue("email", urlEmail);
  }, [ref, urlPlan, urlEmail, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Er is iets misgegaan");
      }

      const result = await response.json();
      
      // Redirect naar Mollie betaalpagina
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Geen betaallink ontvangen. Probeer het opnieuw.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout bij betaling",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
      });
      setIsSubmitting(false);
    }
  };

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
              className={`relative ${
                selectedPlan === plan.id ? "ring-2 ring-primary" : ""
              } ${plan.popular ? "border-primary" : ""}`}
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
                  <span className="text-muted-foreground"> /maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  className="w-full mb-6"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    form.setValue("plan", plan.id);
                  }}
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

        {/* Payment Form */}
        <Card className="max-w-md mx-auto" data-testid="card-payment-form">
          <CardHeader>
            <CardTitle>Start jouw lidmaatschap</CardTitle>
            <CardDescription>
              Vul je e-mailadres in en ga door naar betaling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mailadres</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jouw@email.nl"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Geselecteerd plan: <span className="font-semibold text-foreground">{selectedPlan === "basic" ? "Basic (€12,95/maand excl. BTW)" : "Pro (€24/maand excl. BTW)"}</span>
                  </p>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-submit-payment"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bezig met voorbereiden...
                      </>
                    ) : (
                      <>
                        Ga naar betaling
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
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
