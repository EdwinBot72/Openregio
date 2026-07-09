import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Users,
  MapPin,
  Lock,
  History,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye as EyeIcon, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

type VisibilityLevel = "public" | "members" | "region_only" | "private";

interface FieldVisibility {
  id: string;
  userId: string;
  fieldName: string;
  visibility: VisibilityLevel;
  updatedAt: string;
}

interface ConsentLogEntry {
  id: string;
  userId: string;
  fieldName: string;
  oldVisibility: VisibilityLevel | null;
  newVisibility: VisibilityLevel;
  changedAt: string;
}

interface PrivacyDashboardData {
  profile: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    businessName: string | null;
    bio: string | null;
    category: string | null;
    profileImageUrl: string | null;
    plan: string;
    createdAt: string;
  };
  bedrijfsprofiel: {
    naam: string;
    eigenaarnaam: string;
    regio: string;
    beschrijving: string;
    telefoon: string;
    email: string;
    website: string;
  } | null;
  visibility: FieldVisibility[];
  consentLog: ConsentLogEntry[];
}

const visibilityLevels: { value: VisibilityLevel; label: string; icon: typeof Eye; description: string }[] = [
  { value: "public", label: "Openbaar", icon: Eye, description: "Zichtbaar voor iedereen" },
  { value: "members", label: "Alleen leden", icon: Users, description: "Alleen voor ingelogde leden" },
  { value: "region_only", label: "Mijn regio", icon: MapPin, description: "Alleen leden in jouw regio" },
  { value: "private", label: "Privé", icon: Lock, description: "Alleen voor jou zichtbaar" },
];

const fieldLabels: Record<string, string> = {
  email: "E-mailadres",
  telefoon: "Telefoonnummer",
  adres: "Adres",
  website: "Website",
  beschrijving: "Bedrijfsomschrijving",
  naam: "Bedrijfsnaam",
  eigenaarnaam: "Naam eigenaar",
  regio: "Regio",
};

export default function PrivacyDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<PrivacyDashboardData>({
    queryKey: ["/api/privacy/dashboard"],
    enabled: !!user,
  });

  const emailNewsDigest = user?.emailNewsDigest ?? true;
  const emailLokaleActiesDigest = user?.emailLokaleActiesDigest ?? true;
  const notificationMutation = useMutation({
    mutationFn: async (payload: { emailNewsDigest?: boolean; emailLokaleActiesDigest?: boolean }) => {
      return apiRequest("PATCH", "/api/account/notification-settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Voorkeuren opgeslagen",
        description: "Je notificatie-instellingen zijn bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon voorkeuren niet opslaan. Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ fieldName, visibility }: { fieldName: string; visibility: VisibilityLevel }) => {
      return apiRequest("POST", "/api/privacy/visibility", { fieldName, visibility });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy/dashboard"] });
      toast({
        title: "Zichtbaarheid bijgewerkt",
        description: "Je privacy-instelling is opgeslagen.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon zichtbaarheid niet bijwerken. Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/privacy/delete-account", { confirm: deleteConfirm });
    },
    onSuccess: () => {
      toast({
        title: "Account verwijderd",
        description: "Je account is succesvol verwijderd.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error?.message || "Kon account niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword });
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Wachtwoord gewijzigd", description: "Je nieuwe wachtwoord is opgeslagen." });
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error?.message || "Kon wachtwoord niet wijzigen.",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Fout", description: "Nieuwe wachtwoorden komen niet overeen.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Fout", description: "Nieuw wachtwoord moet minimaal 8 tekens bevatten.", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleExport = async () => {
    try {
      const response = await apiRequest("GET", "/api/privacy/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mijn-openregio-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data geëxporteerd",
        description: "Je data is gedownload als JSON-bestand.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon data niet exporteren.",
        variant: "destructive",
      });
    }
  };

  const getVisibilityForField = (fieldName: string): VisibilityLevel => {
    const setting = dashboardData?.visibility?.find((v) => v.fieldName === fieldName);
    return setting?.visibility || "members";
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Log in om je privacy-instellingen te bekijken.</p>
          <Link href="/login">
            <Button className="mt-4" data-testid="button-login">
              Inloggen
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const configurableFields = ["email", "telefoon", "adres", "website", "beschrijving"];

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield style={{ width: 24, height: 24, color: "#0b2240" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-page-title">Instellingen</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Beheer je privacy-instellingen en bekijk je opgeslagen gegevens.
            </p>
          </div>
        </div>
      </div>

      <Card data-testid="card-profile-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Jouw profiel
          </CardTitle>
          <CardDescription>
            Een overzicht van de gegevens die we over je opslaan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <span className="text-sm font-medium" data-testid="text-email">
                  {dashboardData?.profile?.email || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Naam</span>
                <span className="text-sm font-medium">
                  {dashboardData?.profile?.firstName || ""} {dashboardData?.profile?.lastName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lidmaatschap</span>
                <Badge variant={dashboardData?.profile?.plan === "pro" || dashboardData?.profile?.plan === "coaching" ? "default" : "outline"}>
                  {dashboardData?.profile?.plan === "coaching" ? "1-op-1 coaching" : dashboardData?.profile?.plan === "pro" ? "Pro" : "Basis"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bedrijf</span>
                <span className="text-sm font-medium">
                  {dashboardData?.bedrijfsprofiel?.naam || dashboardData?.profile?.businessName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Regio</span>
                <span className="text-sm font-medium">
                  {dashboardData?.bedrijfsprofiel?.regio || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lid sinds</span>
                <span className="text-sm font-medium">
                  {dashboardData?.profile?.createdAt
                    ? format(new Date(dashboardData.profile.createdAt), "d MMMM yyyy", { locale: nl })
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-change-password">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Wachtwoord wijzigen
          </CardTitle>
          <CardDescription>Stel een nieuw wachtwoord in voor je account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Huidig wachtwoord</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Voer huidig wachtwoord in"
                data-testid="input-current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-toggle-current-password"
                aria-label={showCurrentPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nieuw wachtwoord</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimaal 8 tekens"
                data-testid="input-new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-toggle-new-password"
                aria-label={showNewPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                tabIndex={-1}
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Bevestig nieuw wachtwoord</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Herhaal nieuw wachtwoord"
                data-testid="input-confirm-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-toggle-confirm-password"
                aria-label={showConfirmPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                tabIndex={-1}
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
            data-testid="button-change-password"
          >
            {changePasswordMutation.isPending ? "Opslaan..." : "Wachtwoord opslaan"}
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="card-notification-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaties
          </CardTitle>
          <CardDescription>
            Bepaal hoe je op de hoogte wordt gehouden van nieuwe leden-updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="min-w-0">
              <p className="font-medium">Wekelijkse e-mail digest</p>
              <p className="text-xs text-muted-foreground">
                Ontvang één keer per week een samenvatting van nieuwe platform-aankondigingen voor leden.
                Je ziet ongelezen updates altijd in de zijbalk bij &quot;Vandaag&quot;.
              </p>
            </div>
            <Switch
              checked={emailNewsDigest}
              disabled={notificationMutation.isPending}
              onCheckedChange={(v) => notificationMutation.mutate({ emailNewsDigest: v })}
              data-testid="switch-email-news-digest"
              aria-label="Wekelijkse e-mail digest voor leden-updates"
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-2 border-t pt-4">
            <div className="min-w-0">
              <p className="font-medium">Nieuwe lokale acties in jouw regio</p>
              <p className="text-xs text-muted-foreground">
                Ontvang elke maandagochtend een e-mail met nieuwe lokale acties die in jouw regio zijn
                aangemaakt. Je krijgt alleen een mail als er die week iets nieuws is.
              </p>
            </div>
            <Switch
              checked={emailLokaleActiesDigest}
              disabled={notificationMutation.isPending}
              onCheckedChange={(v) => notificationMutation.mutate({ emailLokaleActiesDigest: v })}
              data-testid="switch-email-lokale-acties-digest"
              aria-label="Wekelijkse e-mail over nieuwe lokale acties in jouw regio"
            />
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-visibility-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Zichtbaarheidsinstellingen
          </CardTitle>
          <CardDescription>
            Bepaal wie welke gegevens van jouw profiel kan zien.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configurableFields.map((fieldName) => (
            <div
              key={fieldName}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <div>
                <span className="font-medium">{fieldLabels[fieldName] || fieldName}</span>
                <p className="text-xs text-muted-foreground">
                  {visibilityLevels.find((v) => v.value === getVisibilityForField(fieldName))?.description}
                </p>
              </div>
              <Select
                value={getVisibilityForField(fieldName)}
                onValueChange={(value) =>
                  updateVisibilityMutation.mutate({
                    fieldName,
                    visibility: value as VisibilityLevel,
                  })
                }
                disabled={updateVisibilityMutation.isPending}
              >
                <SelectTrigger className="w-full sm:w-48" data-testid={`select-visibility-${fieldName}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <level.icon className="w-4 h-4" />
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card data-testid="card-consent-log">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Wijzigingsgeschiedenis
          </CardTitle>
          <CardDescription>
            De laatste 10 wijzigingen in je privacy-instellingen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData?.consentLog && dashboardData.consentLog.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.consentLog.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b last:border-0 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#f28a1a]" />
                    <span>
                      <strong>{fieldLabels[log.fieldName] || log.fieldName}</strong>: van{" "}
                      <Badge variant="outline" className="mx-1">
                        {visibilityLevels.find((v) => v.value === log.oldVisibility)?.label || "Onbekend"}
                      </Badge>
                      naar{" "}
                      <Badge variant="outline" className="mx-1">
                        {visibilityLevels.find((v) => v.value === log.newVisibility)?.label || "Onbekend"}
                      </Badge>
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.changedAt), "d MMM yyyy HH:mm", { locale: nl })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nog geen wijzigingen vastgelegd.</p>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-data-actions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Je gegevens
          </CardTitle>
          <CardDescription>
            Download of verwijder je gegevens volgens de AVG-wetgeving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-data">
              <Download className="w-4 h-4 mr-2" />
              Download mijn data (JSON)
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              data-testid="button-delete-account"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Verwijder mijn account
            </Button>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Je hebt het recht om je gegevens te downloaden en je account te laten verwijderen. Na
              verwijdering worden je gegevens binnen 30 dagen volledig gewist.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Account verwijderen
            </DialogTitle>
            <DialogDescription>
              Dit kan niet ongedaan worden gemaakt. Al je gegevens, bedrijfsprofiel en
              lidmaatschapshistorie worden permanent verwijderd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="delete-confirm">
              Typ <strong>VERWIJDER</strong> om te bevestigen:
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="VERWIJDER"
              data-testid="input-delete-confirm"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" data-testid="button-cancel-delete">
                Annuleren
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteAccountMutation.mutate()}
              disabled={deleteConfirm !== "VERWIJDER" || deleteAccountMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteAccountMutation.isPending ? "Bezig..." : "Definitief verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
