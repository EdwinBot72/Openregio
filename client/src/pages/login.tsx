import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Vul alle velden in",
        description: "Email en wachtwoord zijn verplicht",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/login", { email, password });

      // Refetch user data to update authentication state
      await refetch();

      toast({
        title: "Ingelogd!",
        description: "Je wordt doorgestuurd naar het dashboard...",
      });

      // Redirect to dashboard after successful login
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: error.message || "Controleer je inloggegevens en probeer opnieuw",
      });
    } finally {
      setIsLoading(false);
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
            <Link href="/lidmaatschap" asChild>
              <Button size="sm" data-testid="button-nav-start">
                Start nu
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-muted/30">
        <Card className="w-full max-w-md" data-testid="card-login">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-accent">Inloggen</CardTitle>
            <CardDescription>
              Welkom terug! Log in met je emailadres en wachtwoord.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Inloggen
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Nog geen account?{" "}
                <Link 
                  href="/lidmaatschap"
                  className="text-primary hover:underline font-medium"
                  data-testid="link-register"
                >
                  Word lid
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
