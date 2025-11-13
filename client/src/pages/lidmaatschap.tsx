import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sparkles, Euro, Users, TrendingUp, Shield, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/lib/authUtils";

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
  const { profile, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return <LidmaatschapContent userId={profile?.id} />;
}

function LidmaatschapContent({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
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

  if (subscriptionLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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

      <Card className="mb-12" data-testid="card-what-we-do">
        <CardHeader>
          <CardTitle className="font-accent text-2xl">Wat doet OpenRegio?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            OpenRegio is een coöperatief platform voor lokale ondernemers die hun digitale onafhankelijkheid terug willen pakken. We zijn geen Big Tech-platform — we zijn van en voor ondernemers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Lokale Zichtbaarheid
              </h3>
              <p className="text-muted-foreground text-sm">
                Jouw bedrijf vindbaar voor klanten in de buurt, zonder Google-advertenties of algoritmes die tegen je werken.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Ondernemersnetwerk
              </h3>
              <p className="text-muted-foreground text-sm">
                Ontdek andere lokale bedrijven, deel leads, werk samen aan projecten en versterk elkaar.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Assistent RegioBot
              </h3>
              <p className="text-muted-foreground text-sm">
                Hulp bij marketing, content, lokale SEO en klantbereik — speciaal getraind voor lokale ondernemers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Democratische Coöperatie
              </h3>
              <p className="text-muted-foreground text-sm">
                Stem mee over beslissingen, geen verborgen algoritmes, transparante bijdragen. Het platform is van ons allemaal.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Contact:</strong> Vragen over OpenRegio? Mail ons op{" "}
              <a 
                href="mailto:info@openregio.nl" 
                className="text-primary hover:underline"
                data-testid="link-contact-email"
              >
                info@openregio.nl
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

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
            {!userId ? (
              <Button
                className="w-full"
                asChild
                data-testid="button-subscribe-basic"
              >
                <a href={getLoginUrl()}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in om lid te worden
                </a>
              </Button>
            ) : (
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
            )}
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
            {!userId ? (
              <Button
                className="w-full"
                variant="default"
                asChild
                data-testid="button-subscribe-pro"
              >
                <a href={getLoginUrl()}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in om lid te worden
                </a>
              </Button>
            ) : (
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
            )}
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

      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          Betalingen worden veilig verwerkt door Mollie. Je kunt op elk moment opzeggen.
        </p>
        <p>
          Vragen over lidmaatschap? Neem contact op via{" "}
          <a 
            href="mailto:info@openregio.nl" 
            className="text-primary hover:underline font-medium"
            data-testid="link-contact-email-footer"
          >
            info@openregio.nl
          </a>
        </p>
      </div>
    </div>
  );
}
