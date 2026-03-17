import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Copy, Check, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [plan, setPlan] = useState<string>("basic");
  const [result, setResult] = useState<{
    user: { id: string; email: string; plan: string };
    onboardingLink: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [resendEmail, setResendEmail] = useState("");
  const [resendResult, setResendResult] = useState<{
    onboardingLink: string;
    emailSent: boolean;
  } | null>(null);
  const [resendCopied, setResendCopied] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/create-user", {
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        plan,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Gebruiker aangemaakt",
        description: `${data.user.email} is aangemaakt als ${data.user.plan}-lid.`,
      });
      setEmail("");
      setFirstName("");
      setLastName("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error.message || "Kon gebruiker niet aanmaken",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/resend-activation", {
        email: resendEmail,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResendResult(data);
      toast({
        title: "Activatielink verstuurd",
        description: `Nieuwe activatielink is aangemaakt voor ${resendEmail}.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error.message || "Kon activatielink niet opnieuw versturen",
      });
    },
  });

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendResult(null);
    resendMutation.mutate();
  };

  const copyResendLink = async () => {
    if (!resendResult?.onboardingLink) return;
    await navigator.clipboard.writeText(resendResult.onboardingLink);
    setResendCopied(true);
    setTimeout(() => setResendCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !plan) return;
    setResult(null);
    createUserMutation.mutate();
  };

  const copyLink = async () => {
    if (!result?.onboardingLink) return;
    await navigator.clipboard.writeText(result.onboardingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold font-accent" data-testid="text-page-title">Gebruiker aanmaken</h1>
          <p className="text-sm text-muted-foreground">Maak accounts aan voor partners, team of leden</p>
        </div>
      </div>

      <Card data-testid="card-create-user">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5" />
            Nieuw account
          </CardTitle>
          <CardDescription>
            De gebruiker ontvangt een activatie-email om een wachtwoord in te stellen.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                placeholder="naam@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createUserMutation.isPending}
                required
                data-testid="input-email"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Voornaam</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={createUserMutation.isPending}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Achternaam</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="de Vries"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={createUserMutation.isPending}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select
                value={plan}
                onValueChange={setPlan}
                disabled={createUserMutation.isPending}
              >
                <SelectTrigger id="plan" data-testid="select-plan">
                  <SelectValue placeholder="Kies een plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basis (€12,95/maand)</SelectItem>
                  <SelectItem value="pro">Pro (alle functies)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createUserMutation.isPending || !email}
              data-testid="button-create-user"
            >
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Account aanmaken
            </Button>
          </CardContent>
        </form>
      </Card>

      {result && (
        <Alert data-testid="alert-success">
          <AlertDescription className="space-y-3">
            <p className="font-medium">
              Account aangemaakt voor {result.user.email} ({result.user.plan})
            </p>
            {result.emailSent ? (
              <p className="text-sm text-muted-foreground">
                Een activatie-email is verstuurd. De gebruiker kan via de link in de email een wachtwoord instellen.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                De email kon niet worden verstuurd. Deel de activatielink hieronder handmatig.
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={result.onboardingLink}
                className="text-xs font-mono"
                data-testid="input-onboarding-link"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                data-testid="button-copy-link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card data-testid="card-resend-activation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5" />
            Activatielink opnieuw versturen
          </CardTitle>
          <CardDescription>
            Stuur een nieuwe activatielink als de vorige is verlopen of niet is aangekomen.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResend}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resendEmail">E-mailadres</Label>
              <Input
                id="resendEmail"
                type="email"
                placeholder="naam@voorbeeld.nl"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={resendMutation.isPending}
                required
                data-testid="input-resend-email"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={resendMutation.isPending || !resendEmail}
              data-testid="button-resend-activation"
            >
              {resendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nieuwe activatielink versturen
            </Button>
          </CardContent>
        </form>
      </Card>

      {resendResult && (
        <Alert data-testid="alert-resend-success">
          <AlertDescription className="space-y-3">
            <p className="font-medium">
              Nieuwe activatielink aangemaakt
            </p>
            {resendResult.emailSent ? (
              <p className="text-sm text-muted-foreground">
                Een nieuwe activatie-email is verstuurd met een nieuw tijdelijk wachtwoord.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                De email kon niet worden verstuurd. Deel de activatielink hieronder handmatig.
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={resendResult.onboardingLink}
                className="text-xs font-mono"
                data-testid="input-resend-link"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyResendLink}
                data-testid="button-copy-resend-link"
              >
                {resendCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
