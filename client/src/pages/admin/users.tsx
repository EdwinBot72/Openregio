import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, UserPlus, Copy, Check, ArrowLeft, RefreshCw,
  Trash2, Search, Users, ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  role: string;
  sector: string | null;
  region: string | null;
  createdAt: string | null;
  deletedAt: string | null;
  mustCompleteOnboarding: boolean;
};

// ─── Delete confirm inline ────────────────────────────────────────────────────

function DeleteConfirm({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const del = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/users/${user.id}`),
    onSuccess: () => {
      toast({ title: "Gebruiker verwijderd", description: `${user.email} is verwijderd.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setOpen(false);
      onDone();
    },
    onError: (e: any) => {
      toast({ variant: "destructive", title: "Fout", description: e.message || "Verwijderen mislukt" });
    },
  });

  if (!open) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        data-testid={`button-delete-${user.id}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-destructive font-medium">Zeker?</span>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 px-2 text-xs"
        onClick={() => del.mutate()}
        disabled={del.isPending}
        data-testid={`button-confirm-delete-${user.id}`}
      >
        {del.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verwijder"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs"
        onClick={() => setOpen(false)}
        data-testid={`button-cancel-delete-${user.id}`}
      >
        Annuleer
      </Button>
    </div>
  );
}

// ─── Gebruikersrij ────────────────────────────────────────────────────────────

function UserRow({ user }: { user: AdminUser }) {
  const [expanded, setExpanded] = useState(false);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const isDeleted = !!user.deletedAt;

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden transition ${isDeleted ? "opacity-50" : ""}`}
      data-testid={`row-user-${user.id}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        {/* Avatar initialen */}
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-user-email-${user.id}`}>
            {user.email}
          </p>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge variant={user.plan === "pro" ? "default" : "secondary"} className="text-[10px]" data-testid={`badge-plan-${user.id}`}>
            {user.plan === "pro" ? "Pro" : "Basis"}
          </Badge>
          {user.role === "admin" || user.role === "master" ? (
            <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">Admin</Badge>
          ) : null}
          {isDeleted && (
            <Badge variant="destructive" className="text-[10px]">Verwijderd</Badge>
          )}
          {user.mustCompleteOnboarding && !isDeleted && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Onboarding</Badge>
          )}
        </div>

        {/* Acties */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setExpanded((v) => !v)}
            data-testid={`button-expand-${user.id}`}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          {!isDeleted && <DeleteConfirm user={user} onDone={() => setExpanded(false)} />}
        </div>
      </div>

      {/* Uitklap-detail */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-0.5">Sector</p>
            <p className="font-medium text-foreground">{user.sector ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Regio</p>
            <p className="font-medium text-foreground">{user.region ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Aangemeld</p>
            <p className="font-medium text-foreground">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("nl-NL") : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">ID</p>
            <p className="font-mono text-[10px] text-muted-foreground truncate">{user.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hoofdpagina ──────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── State formulieren ──
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
  const [resendResult, setResendResult] = useState<{ onboardingLink: string; emailSent: boolean } | null>(null);
  const [resendCopied, setResendCopied] = useState(false);

  // ── Zoek + filter ──
  const [zoek, setZoek] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "basic" | "pro">("all");
  const [toonVerwijderd, setToonVerwijderd] = useState(false);

  // ── Data ──
  const { data, isLoading } = useQuery<{ users: AdminUser[] }>({
    queryKey: ["/api/admin/users"],
  });

  const gebruikers = (data?.users ?? []).filter((u) => {
    if (!toonVerwijderd && u.deletedAt) return false;
    if (filterPlan !== "all" && u.plan !== filterPlan) return false;
    if (zoek.trim()) {
      const q = zoek.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        (u.firstName ?? "").toLowerCase().includes(q) ||
        (u.lastName ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Mutations ──
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/create-user", {
        email, firstName: firstName || undefined, lastName: lastName || undefined, plan,
      });
      return res.json();
    },
    onSuccess: (d) => {
      setResult(d);
      toast({ title: "Gebruiker aangemaakt", description: `${d.user.email} is aangemaakt.` });
      setEmail(""); setFirstName(""); setLastName("");
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon gebruiker niet aanmaken" }),
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/resend-activation", { email: resendEmail });
      return res.json();
    },
    onSuccess: (d) => { setResendResult(d); },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon activatielink niet versturen" }),
  });

  const copyLink = async () => {
    if (!result?.onboardingLink) return;
    await navigator.clipboard.writeText(result.onboardingLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const copyResendLink = async () => {
    if (!resendResult?.onboardingLink) return;
    await navigator.clipboard.writeText(resendResult.onboardingLink);
    setResendCopied(true); setTimeout(() => setResendCopied(false), 2000);
  };

  const aantalActief = (data?.users ?? []).filter((u) => !u.deletedAt).length;
  const aantalPro = (data?.users ?? []).filter((u) => !u.deletedAt && u.plan === "pro").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold font-accent" data-testid="text-page-title">Gebruikers</h1>
          <p className="text-sm text-muted-foreground">Alle ingeschreven ondernemers beheren</p>
        </div>
      </div>

      {/* ── Stat-pillen ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground" data-testid="text-count-actief">{aantalActief}</span>
          <span className="text-xs text-muted-foreground">actieve leden</span>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground" data-testid="text-count-pro">{aantalPro}</span>
          <span className="text-xs text-muted-foreground">Pro-leden</span>
        </div>
      </div>

      {/* ── Gebruikerslijst ── */}
      <Card data-testid="card-user-list">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Alle gebruikers</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam of e-mail…"
                  value={zoek}
                  onChange={(e) => setZoek(e.target.value)}
                  className="pl-8 h-8 text-xs w-48"
                  data-testid="input-zoek"
                />
              </div>
              <Select value={filterPlan} onValueChange={(v) => setFilterPlan(v as any)}>
                <SelectTrigger className="h-8 text-xs w-28" data-testid="select-filter-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle plannen</SelectItem>
                  <SelectItem value="basic">Basis</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={toonVerwijderd ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setToonVerwijderd((v) => !v)}
                data-testid="button-toon-verwijderd"
              >
                {toonVerwijderd ? "Verberg verwijderd" : "Toon verwijderd"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Laden…</span>
            </div>
          ) : gebruikers.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground" data-testid="text-empty">
              Geen gebruikers gevonden.
            </div>
          ) : (
            gebruikers.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </CardContent>
      </Card>

      {/* ── Gebruiker aanmaken ── */}
      <Card data-testid="card-create-user">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4" />
            Nieuw account aanmaken
          </CardTitle>
          <CardDescription>
            De gebruiker ontvangt een activatie-email om een wachtwoord in te stellen.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (!email || !plan) return; setResult(null); createUserMutation.mutate(); }}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input id="email" type="email" placeholder="naam@voorbeeld.nl" value={email} onChange={(e) => setEmail(e.target.value)} disabled={createUserMutation.isPending} required data-testid="input-email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Voornaam</Label>
                <Input id="firstName" placeholder="Jan" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={createUserMutation.isPending} data-testid="input-first-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Achternaam</Label>
                <Input id="lastName" placeholder="de Vries" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={createUserMutation.isPending} data-testid="input-last-name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select value={plan} onValueChange={setPlan} disabled={createUserMutation.isPending}>
                <SelectTrigger id="plan" data-testid="select-plan">
                  <SelectValue placeholder="Kies een plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basis</SelectItem>
                  <SelectItem value="pro">Pro (alle functies)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createUserMutation.isPending || !email} data-testid="button-create-user">
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Account aanmaken
            </Button>
          </CardContent>
        </form>
      </Card>

      {result && (
        <Alert data-testid="alert-success">
          <AlertDescription className="space-y-3">
            <p className="font-medium">Account aangemaakt voor {result.user.email} ({result.user.plan})</p>
            {!result.emailSent && <p className="text-sm text-muted-foreground">Email kon niet worden verstuurd. Deel de link hieronder.</p>}
            <div className="flex items-center gap-2">
              <Input readOnly value={result.onboardingLink} className="text-xs font-mono" data-testid="input-onboarding-link" />
              <Button variant="outline" size="icon" onClick={copyLink} data-testid="button-copy-link">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Activatielink opnieuw ── */}
      <Card data-testid="card-resend-activation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="w-4 h-4" />
            Activatielink opnieuw versturen
          </CardTitle>
          <CardDescription>Stuur een nieuwe link als de vorige is verlopen.</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (!resendEmail) return; setResendResult(null); resendMutation.mutate(); }}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resendEmail">E-mailadres</Label>
              <Input id="resendEmail" type="email" placeholder="naam@voorbeeld.nl" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} disabled={resendMutation.isPending} required data-testid="input-resend-email" />
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={resendMutation.isPending || !resendEmail} data-testid="button-resend-activation">
              {resendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nieuwe activatielink versturen
            </Button>
          </CardContent>
        </form>
      </Card>

      {resendResult && (
        <Alert data-testid="alert-resend-success">
          <AlertDescription className="space-y-3">
            <p className="font-medium">Nieuwe activatielink aangemaakt</p>
            {!resendResult.emailSent && <p className="text-sm text-muted-foreground">Email kon niet worden verstuurd. Deel de link handmatig.</p>}
            <div className="flex items-center gap-2">
              <Input readOnly value={resendResult.onboardingLink} className="text-xs font-mono" data-testid="input-resend-link" />
              <Button variant="outline" size="icon" onClick={copyResendLink} data-testid="button-copy-resend-link">
                {resendCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
