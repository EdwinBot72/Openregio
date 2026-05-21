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

  const { data: dashboardData, isLoading } = useQuery<PrivacyDashboardData>({
    queryKey: ["/api/privacy/dashboard"],
    enabled: !!user,
  });

  const emailNewsDigest = user?.emailNewsDigest ?? true;
  const notificationMutation = useMutation({
    mutationFn: async (next: boolean) => {
      return apiRequest("PATCH", "/api/account/notification-settings", {
        emailNewsDigest: next,
      });
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Shield className="w-7 h-7 text-primary" />
            Privacy & Gegevens
          </h1>
          <p className="text-sm text-muted-foreground">
            Beheer je privacy-instellingen en bekijk je opgeslagen gegevens.
          </p>
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
                <Badge variant={dashboardData?.profile?.plan === "pro" ? "default" : "outline"}>
                  {dashboardData?.profile?.plan === "pro" ? "Pro" : "Basis"}
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
              onCheckedChange={(v) => notificationMutation.mutate(v)}
              data-testid="switch-email-news-digest"
              aria-label="Wekelijkse e-mail digest voor leden-updates"
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
                    <CheckCircle className="w-4 h-4 text-green-600" />
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
  );
}
