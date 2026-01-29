import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setError("Ongeldige of ontbrekende herstellink");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Vul alle velden in",
        description: "Beide wachtwoordvelden zijn verplicht",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Wachtwoorden komen niet overeen",
        description: "Zorg dat beide wachtwoorden hetzelfde zijn",
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

    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setIsSuccess(true);
      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je kunt nu inloggen met je nieuwe wachtwoord.",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Er is een fout opgetreden");
      toast({
        variant: "destructive",
        title: "Fout",
        description: err.message || "Er is een fout opgetreden",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary"
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-muted/30">
        <Card className="w-full max-w-md" data-testid="card-reset-password">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-accent">
              {isSuccess ? "Wachtwoord gewijzigd" : error && !token ? "Ongeldige link" : "Nieuw wachtwoord instellen"}
            </CardTitle>
            <CardDescription>
              {isSuccess 
                ? "Je wordt doorgestuurd naar de inlogpagina..."
                : error && !token
                  ? "Deze herstellink is ongeldig of verlopen."
                  : "Kies een nieuw wachtwoord voor je account."
              }
            </CardDescription>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-muted-foreground">
                  Je wachtwoord is succesvol gewijzigd. Je wordt nu doorgestuurd naar de inlogpagina.
                </p>
              </div>
            </CardContent>
          ) : error && !token ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {error}
                </p>
                <Link href="/forgot-password">
                  <Button data-testid="button-try-again">
                    Vraag een nieuwe herstellink aan
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Nieuw wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                    data-testid="input-confirm-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Wachtwoord wijzigen
                </Button>
                <Link 
                  href="/login"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-back-to-login"
                >
                  Terug naar inloggen
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
