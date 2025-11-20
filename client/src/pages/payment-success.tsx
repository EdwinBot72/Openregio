import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // Simulate a small loading delay for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full" data-testid="card-loading">
          <CardContent className="pt-6 pb-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Bezig met verwerken van je betaling...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full" data-testid="card-success">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-accent">
            Welkom bij OpenRegio!
          </CardTitle>
          <CardDescription>
            Je betaling is succesvol verwerkt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Check je e-mail</p>
                <p className="text-sm text-muted-foreground">
                  We hebben een e-mail gestuurd naar{" "}
                  <span className="font-semibold text-foreground" data-testid="text-email">
                    {email || "je e-mailadres"}
                  </span>{" "}
                  met je inloggegevens en een speciale onboarding link.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Wat nu?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Open de e-mail van OpenRegio</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Klik op de onboarding link in de e-mail</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Maak je profiel compleet en start met netwerken!</span>
              </li>
            </ol>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors hover-elevate active-elevate-2 min-h-10 px-6 py-2 w-full bg-primary text-primary-foreground border border-primary-border"
              data-testid="button-login"
            >
              Ga naar inloggen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              E-mail niet ontvangen? Check je spam folder of neem contact op via info@openregio.nl
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
