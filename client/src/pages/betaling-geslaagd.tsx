import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Loader2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BetalingGeslaagd() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState<string>("");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full" data-testid="card-payment-success">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" data-testid="icon-success" />
          </div>
          <CardTitle className="text-3xl font-accent">Betaling geslaagd!</CardTitle>
          <CardDescription className="text-lg">
            Welkom bij OpenRegio! Je bent nu onderdeel van de coöperatieve beweging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email confirmation */}
          {email && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Check je inbox</p>
                  <p className="text-sm text-muted-foreground">
                    We hebben je registratiegegevens verstuurd naar <span className="font-semibold text-foreground" data-testid="text-email">{email}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">Volgende stappen:</h3>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
              <li>Check je e-mail voor je persoonlijke onboarding link</li>
              <li>Klik op de link om je account te activeren</li>
              <li>Maak je bedrijfsprofiel compleet</li>
              <li>Start met netwerken en ontdek RegioBot!</li>
            </ol>
          </div>

          {/* Info box */}
          <div className="bg-muted/30 border border-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Geen email ontvangen?</p>
                <p className="text-sm text-muted-foreground">
                  Check je spam folder. Als je na 10 minuten nog geen email hebt ontvangen, neem dan contact met ons op via info@openregio.nl
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/">
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-back-home"
              >
                Terug naar homepage
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Heb je al toegang tot je account? <Link href="/login" className="text-primary hover:underline" data-testid="link-login">Log direct in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
