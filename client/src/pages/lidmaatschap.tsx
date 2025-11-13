import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Euro, Users, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription } from "@shared/schema";

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
  const { toast } = useToast();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // NOTE: Hardcoded user ID for MVP - will be replaced with authentication
  const userId = "user-jan";

  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ["/api/billing/subscription", { search: { userId } }],
    enabled: !!userId,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (plan: "basic" | "pro") => {
      setIsCreatingCheckout(true);
      const response = await apiRequest("POST", "/api/billing/create-checkout", {
        userId,
        plan,
        returnUrl: `${window.location.origin}/lidmaatschap`,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setIsCreatingCheckout(false);
        toast({
          title: "Geen checkout URL ontvangen",
          description: "Probeer het later opnieuw",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsCreatingCheckout(false);
      toast({
        title: "Fout bij aanmaken checkout",
        description: error.message || "Probeer het later opnieuw",
        variant: "destructive",
      });
    },
  });

  const handleStartSubscription = (plan: "basic" | "pro") => {
    createCheckoutMutation.mutate(plan);
  };

  const hasActiveSubscription = subscription && ["trialing", "active"].includes(subscription.status);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
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

      {hasActiveSubscription && (
        <Card className="mb-8 border-primary/50 bg-primary/5" data-testid="card-current-subscription">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Actief lidmaatschap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg capitalize">
                  {subscription.plan} Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {subscription.status === "trialing" ? "Proefperiode" : "Actief"}
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Verlengd op: {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL")}
                  </p>
                )}
              </div>
              <Badge variant="default" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Lid
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
            <Button
              className="w-full"
              onClick={() => handleStartSubscription("basic")}
              disabled={isCreatingCheckout || (hasActiveSubscription && subscription?.plan === "basic")}
              data-testid="button-subscribe-basic"
            >
              {hasActiveSubscription && subscription?.plan === "basic" 
                ? "Huidig plan" 
                : isCreatingCheckout 
                ? "Bezig..." 
                : "Word Basic lid"}
            </Button>
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
            <Button
              className="w-full"
              variant="default"
              onClick={() => handleStartSubscription("pro")}
              disabled={isCreatingCheckout || (hasActiveSubscription && subscription?.plan === "pro")}
              data-testid="button-subscribe-pro"
            >
              {hasActiveSubscription && subscription?.plan === "pro" 
                ? "Huidig plan" 
                : isCreatingCheckout 
                ? "Bezig..." 
                : "Word Pro lid"}
            </Button>
          </CardFooter>
        </Card>
      </div>

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

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Betalingen worden veilig verwerkt door Mollie. Je kunt op elk moment opzeggen.
        </p>
      </div>
    </div>
  );
}
