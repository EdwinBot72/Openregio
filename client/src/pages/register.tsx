import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Extend register schema with confirmPassword field
const registerFormSchema = registerUserSchema.extend({
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

const PLAN_FEATURES = {
  basic: [
    "Profiel op het platform",
    "Toegang tot netwerk van lokale ondernemers",
    "Community & Kansenbord",
    "Chat met andere leden",
    "Stemrecht in coöperatie",
    "Basis toegang tot RegioBot",
  ],
  pro: [
    "Alles van Basis-lid",
    "Volledige RegioBot met WOO-bibliotheek",
    "Uitgebreide analytics",
    "Premium zichtbaarheid",
    "Prioriteit support",
    "Vroege toegang tot nieuwe features",
  ],
};

export default function RegisterPage() {
  usePageTitle("Registreren");
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const planParam = urlParams.get("plan");
  const selectedPlan = planParam === "pro" ? "pro" : "basic";

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      plan: selectedPlan,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Omit confirmPassword from API request
      const { confirmPassword, ...registerData } = data;
      
      await apiRequest("POST", "/api/auth/register", registerData);

      toast({
        title: "Account aangemaakt!",
        description: "Je wordt doorgestuurd naar het dashboard...",
      });

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: error.message || "Probeer het later opnieuw",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
            <Link href="/login" asChild>
              <Button variant="ghost" size="sm" data-testid="button-nav-login">
                Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Registration Form */}
      <div className="flex-1 px-4 py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Form Section */}
            <Card data-testid="card-register">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-accent">Account aanmaken</CardTitle>
                <CardDescription>
                  Start vandaag nog met je {selectedPlan === "pro" ? "Pro" : "Basic"} lidmaatschap
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    {/* Hidden plan field */}
                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voornaam (optioneel)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jan"
                                data-testid="input-first-name"
                                {...field}
                              />
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
                              <Input
                                placeholder="Jansen"
                                data-testid="input-last-name"
                                {...field}
                              />
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
                          <FormLabel>Email *</FormLabel>
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
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-register"
                    >
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Account aanmaken (€{selectedPlan === "pro" ? "49" : "19"}/maand excl. BTW)
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                      Al een account?{" "}
                      <Link 
                        href="/login"
                        className="text-primary hover:underline font-medium"
                        data-testid="link-login"
                      >
                        Log hier in
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            {/* Plan Details Section */}
            <div className="space-y-6">
              <Card data-testid="card-plan-details">
                <CardHeader>
                  <CardTitle className="text-2xl capitalize">{selectedPlan} Plan</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      €{selectedPlan === "pro" ? "49" : "19"}
                    </span>
                    <span className="text-muted-foreground">/maand excl. BTW</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {PLAN_FEATURES[selectedPlan].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`feature-${idx}`}>
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-sm text-muted-foreground">
                    <p>
                      Wil je een ander plan?{" "}
                      <Link 
                        href="/lidmaatschap"
                        className="text-primary hover:underline"
                        data-testid="link-change-plan"
                      >
                        Bekijk alle opties
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </Card>

              <Card className="bg-muted/50" data-testid="card-info">
                <CardContent className="pt-6 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Let op:</strong> Door je account aan te maken, ga je akkoord met een maandelijks lidmaatschap van €{selectedPlan === "pro" ? "49" : "19"} excl. BTW.
                  </p>
                  <p>
                    Je kunt op elk moment opzeggen via je dashboard.
                  </p>
                  <p>
                    Vragen? Mail ons op{" "}
                    <a href="mailto:info@openregio.nl" className="text-primary hover:underline" data-testid="link-contact">
                      info@openregio.nl
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
