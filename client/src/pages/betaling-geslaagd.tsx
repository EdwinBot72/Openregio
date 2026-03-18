import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Vul een geldig e-mailadres in"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn"),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function PostPaymentRegisterForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...payload } = data;
      const response = await fetch("/api/auth/register-after-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registratie mislukt");
      }

      await refetch();

      toast({
        title: "Account aangemaakt!",
        description: "Je wordt doorgestuurd naar je dashboard...",
      });

      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full" data-testid="card-post-payment-register">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" data-testid="icon-success" />
          </div>
          <CardTitle className="text-3xl font-accent">Betaling geslaagd!</CardTitle>
          <CardDescription className="text-lg">
            Maak nu je account aan om direct aan de slag te gaan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" data-testid="input-first-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achternaam (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jansen" data-testid="input-last-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jouw@email.nl"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wachtwoord *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimaal 6 tekens"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bevestig wachtwoord *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Herhaal je wachtwoord"
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-create-account"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Account aanmaken...
                  </>
                ) : (
                  "Account aanmaken en inloggen"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Heb je al een account?{" "}
                <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                  Log hier in
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function EmailCheckPage({ email }: { email: string }) {
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
          {email && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Check je inbox</p>
                  <p className="text-sm text-muted-foreground">
                    We hebben je registratiegegevens verstuurd naar{" "}
                    <span className="font-semibold text-foreground" data-testid="text-email">
                      {email}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Volgende stappen:</h3>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
              <li>Check je e-mail voor je persoonlijke onboarding link</li>
              <li>Klik op de link om je account te activeren</li>
              <li>Maak je bedrijfsprofiel compleet</li>
              <li>Start met netwerken en ontdek RegioBot!</li>
            </ol>
          </div>

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
              Heb je al toegang tot je account?{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                Log direct in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BetalingGeslaagd() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const email = params.get("email") || "";

  if (plan === "basic") {
    return <PostPaymentRegisterForm />;
  }

  return <EmailCheckPage email={email} />;
}
