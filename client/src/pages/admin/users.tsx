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
  Trash2, Search, Users, ChevronDown, ChevronUp, AlertTriangle, UserCog,
  RotateCcw, ShieldAlert, Mail, MailCheck,
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

// ─── Herstel bevestiging ──────────────────────────────────────────────────────

function RestoreConfirm({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const mut = useMutation({
    mutationFn: () => apiRequest("POST", `/api/admin/users/${user.id}/restore`),
    onSuccess: () => {
      toast({ title: "Account hersteld", description: `${user.email} is weer actief.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setOpen(false);
      onDone();
    },
    onError: (e: any) => {
      toast({ variant: "destructive", title: "Fout", description: e.message || "Herstellen mislukt" });
    },
  });

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs gap-1"
        onClick={() => setOpen(true)}
        data-testid={`button-restore-${user.id}`}
      >
        <RotateCcw className="h-3 w-3" />
        Herstellen
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Account terugzetten?</span>
      <Button
        size="sm"
        variant="default"
        className="h-7 px-2 text-xs"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        data-testid={`button-confirm-restore-${user.id}`}
      >
        {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ja, herstellen"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs"
        onClick={() => setOpen(false)}
        data-testid={`button-cancel-restore-${user.id}`}
      >
        Annuleer
      </Button>
    </div>
  );
}

// ─── Permanent verwijderen ─────────────────────────────────────────────────────

function PermanentDeleteConfirm({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const mut = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/users/${user.id}/permanent`),
    onSuccess: () => {
      toast({ title: "Account definitief verwijderd", description: `${user.email} is permanent verwijderd.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setOpen(false);
      onDone();
    },
    onError: (e: any) => {
      toast({ variant: "destructive", title: "Fout", description: e.message || "Permanent verwijderen mislukt" });
    },
  });

  if (!open) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        data-testid={`button-permanent-delete-${user.id}`}
      >
        <ShieldAlert className="h-3 w-3" />
        Permanent weg
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-destructive font-semibold">Niet terug te draaien!</span>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 px-2 text-xs"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        data-testid={`button-confirm-permanent-delete-${user.id}`}
      >
        {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Definitief verwijderen"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs"
        onClick={() => setOpen(false)}
        data-testid={`button-cancel-permanent-delete-${user.id}`}
      >
        Annuleer
      </Button>
    </div>
  );
}

// ─── Gebruikersrij ────────────────────────────────────────────────────────────

function SetPlanButton({ user }: { user: AdminUser }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newPlan, setNewPlan] = useState(user.plan);

  const mut = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/admin/users/${user.id}/set-plan`, { plan: newPlan }),
    onSuccess: () => {
      toast({ title: "Plan bijgewerkt", description: `${user.email} is nu ${newPlan}.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setOpen(false);
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Plan wijzigen mislukt" }),
  });

  if (!open) {
    return (
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setOpen(true)} data-testid={`button-set-plan-${user.id}`} title="Plan wijzigen">
        <UserCog className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={newPlan} onValueChange={setNewPlan}>
        <SelectTrigger className="h-7 text-xs w-28" data-testid={`select-new-plan-${user.id}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basic">Basis</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="coaching">Coaching</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" variant="default" className="h-7 px-2 text-xs" onClick={() => mut.mutate()} disabled={mut.isPending || newPlan === user.plan} data-testid={`button-confirm-plan-${user.id}`}>
        {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Opslaan"}
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setOpen(false)} data-testid={`button-cancel-plan-${user.id}`}>
        Annuleer
      </Button>
    </div>
  );
}

function SendActivationButton({ user }: { user: AdminUser }) {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sendMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/resend-activation", { email: user.email });
      return res.json();
    },
    onSuccess: (d) => {
      setSent(true);
      setLink(d.onboardingLink);
      if (d.emailSent) {
        toast({ title: "Activatiemail verstuurd", description: `De activatielink is verstuurd naar ${user.email}.` });
      } else {
        toast({ variant: "destructive", title: "E-mail niet verstuurd", description: "Controleer de SMTP-instellingen." });
      }
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon mail niet versturen" }),
  });

  const linkMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/get-activation-link", { email: user.email });
      return res.json();
    },
    onSuccess: (d) => setLink(d.onboardingLink),
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon link niet ophalen" }),
  });

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mail sturen */}
        {sent ? (
          <div className="flex items-center gap-1.5 text-xs text-[#f28a1a] font-medium">
            <MailCheck className="h-3.5 w-3.5" />
            Activatiemail verstuurd
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={() => sendMut.mutate()}
            disabled={sendMut.isPending || linkMut.isPending}
            data-testid={`button-send-activation-${user.id}`}
          >
            {sendMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
            Stuur activatiemail
          </Button>
        )}

        {/* Link ophalen (zonder mail) */}
        {!link && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={() => linkMut.mutate()}
            disabled={linkMut.isPending || sendMut.isPending}
            data-testid={`button-get-link-${user.id}`}
          >
            {linkMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
            Toon link
          </Button>
        )}
      </div>

      {/* Link zichtbaar + kopiëren */}
      {link && (
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={link}
            className="text-[11px] font-mono h-7"
            data-testid={`input-activation-link-${user.id}`}
          />
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 shrink-0"
            onClick={copyLink}
            data-testid={`button-copy-link-${user.id}`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}
    </div>
  );
}

function ResetPasswordButton({ user }: { user: AdminUser }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [customPassword, setCustomPassword] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetMut = useMutation({
    mutationFn: async () => {
      if (customPassword && customPassword.length < 8) {
        throw new Error("Wachtwoord moet minimaal 8 tekens zijn");
      }
      const res = await apiRequest("POST", "/api/admin/reset-user-password", {
        email: user.email,
        customPassword: customPassword || undefined,
      });
      return res.json();
    },
    onSuccess: (d) => {
      setPassword(d.tempPassword);
      setShowForm(false);
      if (d.emailSent) {
        toast({ title: "Wachtwoord gereset", description: `Het nieuwe wachtwoord is gemaild naar ${user.email}.` });
      } else {
        toast({ title: "Wachtwoord gereset", description: "Kopieer het wachtwoord hieronder om het zelf door te sturen." });
      }
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon wachtwoord niet resetten" }),
  });

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (password) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Input
          readOnly
          value={password}
          className="text-[11px] font-mono h-7"
          data-testid={`input-temp-password-${user.id}`}
        />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 shrink-0"
          onClick={copyPassword}
          data-testid={`button-copy-password-${user.id}`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2 w-full flex-wrap">
        <Input
          placeholder="Eigen wachtwoord (optioneel, min. 8 tekens)"
          value={customPassword}
          onChange={(e) => setCustomPassword(e.target.value)}
          className="text-xs h-7 flex-1 min-w-[180px]"
          data-testid={`input-custom-reset-password-${user.id}`}
        />
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={() => resetMut.mutate()}
          disabled={resetMut.isPending}
          data-testid={`button-confirm-reset-password-${user.id}`}
        >
          {resetMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Bevestig"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => { setShowForm(false); setCustomPassword(""); }}
          disabled={resetMut.isPending}
          data-testid={`button-cancel-reset-password-${user.id}`}
        >
          Annuleer
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1.5 text-xs"
      onClick={() => setShowForm(true)}
      data-testid={`button-reset-password-${user.id}`}
    >
      <RotateCcw className="h-3 w-3" />
      Reset wachtwoord
    </Button>
  );
}

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
          <Badge
            variant={user.plan === "pro" ? "default" : user.plan === "coaching" ? "outline" : "secondary"}
            className={`text-[10px] ${user.plan === "coaching" ? "border-[#0b2240] text-[#0b2240]" : ""}`}
            data-testid={`badge-plan-${user.id}`}
          >
            {user.plan === "pro" ? "Pro" : user.plan === "coaching" ? "1-op-1 coaching" : "Basis"}
          </Badge>
          {user.role === "admin" || user.role === "master" ? (
            <Badge variant="outline" className="text-[10px] border-[#f28a1a] text-[#f28a1a]">Admin</Badge>
          ) : null}
          {isDeleted && (
            <Badge variant="destructive" className="text-[10px]">Verwijderd</Badge>
          )}
          {user.mustCompleteOnboarding && !isDeleted && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Onboarding</Badge>
          )}
        </div>

        {/* Acties */}
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          {!isDeleted && <SetPlanButton user={user} />}
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
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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

          {/* Activatiemail sturen of wachtwoord resetten */}
          {!isDeleted && (
            <div className="pt-1 border-t border-border flex items-center gap-3 flex-wrap">
              {user.mustCompleteOnboarding ? (
                <SendActivationButton user={user} />
              ) : (
                <ResetPasswordButton user={user} />
              )}
            </div>
          )}

          {/* Acties voor verwijderde accounts */}
          {isDeleted && (
            <div className="pt-1 border-t border-border flex items-center gap-3 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Verwijderd op {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString("nl-NL") : "—"}
              </p>
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                <RestoreConfirm user={user} onDone={() => setExpanded(false)} />
                <PermanentDeleteConfirm user={user} onDone={() => setExpanded(false)} />
              </div>
            </div>
          )}
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
  const [customPassword, setCustomPassword] = useState("");
  const [skipOnboarding, setSkipOnboarding] = useState(false);
  const [result, setResult] = useState<{
    user: { id: string; email: string; plan: string };
    onboardingLink: string;
    tempPassword: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  const [resendEmail, setResendEmail] = useState("");
  const [resendResult, setResendResult] = useState<{ onboardingLink: string; emailSent: boolean } | null>(null);
  const [resendCopied, setResendCopied] = useState(false);

  // ── Zoek + filter ──
  const [zoek, setZoek] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "basic" | "pro" | "coaching">("all");
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
        customPassword: customPassword || undefined, skipOnboarding,
      });
      return res.json();
    },
    onSuccess: (d) => {
      setResult(d);
      setMailSent(d.emailSent); // al verstuurd bij aanmaken? markeer dan direct
      toast({ title: "Gebruiker aangemaakt", description: `${d.user.email} is aangemaakt.` });
      setEmail(""); setFirstName(""); setLastName(""); setCustomPassword(""); setSkipOnboarding(false);
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

  const sendToNewUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/admin/resend-activation", { email });
      return res.json();
    },
    onSuccess: (d) => {
      setMailSent(true);
      if (d.emailSent) {
        toast({ title: "Activatiemail verstuurd", description: `De activatielink is verstuurd naar ${result?.user.email}.` });
      } else {
        toast({ variant: "destructive", title: "E-mail niet verstuurd", description: "Controleer de SMTP-instellingen." });
      }
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon mail niet versturen" }),
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
  const aantalCoaching = (data?.users ?? []).filter((u) => !u.deletedAt && u.plan === "coaching").length;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#ffffff", border: "1px solid #dce6f0", color: "#64748b", flexShrink: 0 }} data-testid="button-back">
          <ArrowLeft size={14} />
        </Link>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eaf6ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Users style={{ width: 24, height: 24, color: "#1a6b3a" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-page-title">Gebruikers beheren</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Alle ingeschreven ondernemers beheren</p>
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
        <div className="rounded-xl border border-[#0b2240]/20 bg-card px-4 py-2.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0b2240]" data-testid="text-count-coaching">{aantalCoaching}</span>
          <span className="text-xs text-muted-foreground">Coaching-leden</span>
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
                  <SelectItem value="coaching">Coaching</SelectItem>
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
                  <SelectItem value="coaching">Coaching (handmatig)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customPassword">Wachtwoord (optioneel)</Label>
              <Input
                id="customPassword"
                type="text"
                placeholder="Leeg = automatisch gegenereerd"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                disabled={createUserMutation.isPending}
                data-testid="input-custom-password"
              />
              <p className="text-xs text-muted-foreground">Minimaal 8 tekens. Laat leeg om er automatisch één te laten genereren.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="skipOnboarding"
                type="checkbox"
                checked={skipOnboarding}
                onChange={(e) => setSkipOnboarding(e.target.checked)}
                disabled={createUserMutation.isPending}
                className="h-4 w-4"
                data-testid="checkbox-skip-onboarding"
              />
              <Label htmlFor="skipOnboarding" className="font-normal text-sm cursor-pointer">
                Account direct actief (geen onboarding-stap nodig)
              </Label>
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
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-medium">Account aangemaakt voor {result.user.email}</p>
              <Badge variant="secondary" className="text-[10px]">{result.user.plan}</Badge>
            </div>

            {/* Activatiemail sturen */}
            <div className="flex items-center gap-2">
              {mailSent ? (
                <div className="flex items-center gap-1.5 text-sm text-[#f28a1a] font-medium">
                  <MailCheck className="h-4 w-4" />
                  Activatiemail verstuurd naar {result.user.email}
                </div>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => sendToNewUserMutation.mutate(result.user.email)}
                    disabled={sendToNewUserMutation.isPending}
                    data-testid="button-send-activation-email"
                  >
                    {sendToNewUserMutation.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Mail className="h-3.5 w-3.5" />}
                    Stuur activatiemail
                  </Button>
                  <span className="text-xs text-muted-foreground">of kopieer de link hieronder</span>
                </>
              )}
            </div>

            {/* Link kopiëren */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Activatielink</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={result.onboardingLink} className="text-xs font-mono" data-testid="input-onboarding-link" />
                <Button variant="outline" size="icon" onClick={copyLink} data-testid="button-copy-link">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Wachtwoord kopiëren */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Wachtwoord</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={result.tempPassword} className="text-xs font-mono" data-testid="input-created-password" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    await navigator.clipboard.writeText(result.tempPassword);
                    setPasswordCopied(true);
                    setTimeout(() => setPasswordCopied(false), 2000);
                  }}
                  data-testid="button-copy-created-password"
                >
                  {passwordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
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
  </div>
  );
}
