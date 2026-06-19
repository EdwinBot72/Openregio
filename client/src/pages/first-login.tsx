import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient, parseApiError } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FirstLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate token on mount
  const { data: validation, isLoading: isValidating, error: validationError } = useQuery<{
    valid: boolean;
    user?: { email: string; plan: string };
  }>({
    queryKey: ["/api/first-login/validate", { search: { token: token || "" } }],
    enabled: !!token,
    retry: false,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Array<{ value: string; label: string }>>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Geen token gevonden",
        description: "Deze link is ongeldig. Gebruik de link uit de email die je hebt ontvangen.",
      });
    }
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword || !businessName || !category) {
      toast({
        variant: "destructive",
        title: "Vul alle verplichte velden in",
        description: "Wachtwoord, bedrijfsnaam en categorie zijn verplicht",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Wachtwoord te kort",
        description: "Wachtwoord moet minimaal 6 tekens zijn",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Wachtwoorden komen niet overeen",
        description: "Controleer je wachtwoord en probeer opnieuw",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/first-login", {
        token,
        password,
        businessName,
        bio: bio || undefined,
        category,
      });

      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Welkom bij OpenRegio!",
        description: "Je account is succesvol aangemaakt. Je wordt doorgestuurd naar het dashboard...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("First login error:", error);
      toast({
        variant: "destructive",
        title: "Fout bij aanmaken account",
        description: error.message || "Er ging iets mis. Probeer het later opnieuw.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while validating
  if (!token || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Valideren van onboarding link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if validation failed
  if (validationError) {
    const rawMsg = (validationError as any).message || "";
    const isExpired = rawMsg.includes("410") || rawMsg.toLowerCase().includes("verlopen");
    const errorMessage = parseApiError(validationError, "De activatielink is ongeldig.");

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-accent">{isExpired ? "Link verlopen" : "Link niet meer geldig"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isExpired ? "Activatielink verlopen" : "Activatielink ongeldig"}</AlertTitle>
              <AlertDescription>
                {isExpired
                  ? "Deze activatielink is verlopen. Links zijn 7 tot 30 dagen geldig."
                  : errorMessage.includes("ongeldig")
                    ? "Deze activatielink is niet langer geldig. Mogelijk heb je je account al geactiveerd, of is de link verlopen."
                    : errorMessage}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Heb je je account al eerder geactiveerd? Dan kun je gewoon{" "}
              <a href="/login" className="text-primary underline underline-offset-2">inloggen</a>.
              Lukt dat niet? Neem contact op via{" "}
              <a href="mailto:info@openregio.nl" className="text-primary underline underline-offset-2">info@openregio.nl</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-lg" data-testid="card-first-login">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-accent">Welkom bij OpenRegio!</CardTitle>
          <CardDescription>
            Stel je wachtwoord in en vertel ons meer over je bedrijf om te beginnen.
            {validation?.user && (
              <span className="block mt-2 text-sm">
                Account: <strong>{validation.user.email}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimaal 6 tekens"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Herhaal je wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
                data-testid="input-confirm-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Bedrijfsnaam *</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Naam van je bedrijf"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isSubmitting}
                required
                data-testid="input-business-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue placeholder="Kies een categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optioneel)</Label>
              <Textarea
                id="bio"
                placeholder="Vertel kort iets over je bedrijf..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                data-testid="input-bio"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Account aanmaken
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
