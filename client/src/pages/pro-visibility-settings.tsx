import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { VisibilityLevel } from "@shared/schema";

interface VisibilityData {
  user: {
    id: string;
    email: string;
    businessName: string | null;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    region: string | null;
  };
  settings: Record<string, VisibilityLevel>;
  options: readonly string[];
  labels: Record<string, string>;
  fieldLabels: Record<string, string>;
}

export default function ProVisibilitySettings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading, error } = useQuery<VisibilityData>({
    queryKey: ["/api/pro/visibility-settings"],
  });

  useEffect(() => {
    if (data?.settings) {
      setLocalSettings(data.settings);
      setHasChanges(false);
    }
  }, [data?.settings]);

  const saveMutation = useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/pro/visibility-settings", settings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opgeslagen",
        description: "Je zichtbaarheidsinstellingen zijn bijgewerkt.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/pro/visibility-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon instellingen niet opslaan.",
        variant: "destructive",
      });
    },
  });

  const handleVisibilityChange = (fieldName: string, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(localSettings);
  };

  if (error) {
    const errorMessage = (error as any)?.message || "Onbekende fout";
    if (errorMessage.includes("403") || errorMessage.includes("PRO")) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                PRO Functie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Data & Consent Control is alleen beschikbaar voor PRO-leden.{" "}
                  <Link href="/upgrade" className="underline font-medium">
                    Upgrade naar PRO
                  </Link>{" "}
                  om toegang te krijgen.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Er is een fout opgetreden bij het laden van de instellingen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getFieldValue = (fieldName: string): string => {
    if (!data?.user) return "-";
    switch (fieldName) {
      case "company_name":
        return data.user.businessName || "-";
      case "phone":
        return data.user.email || "-";
      case "address":
        return data.user.region || "-";
      case "website":
        return "-";
      case "description":
        return data.user.bio ? data.user.bio.substring(0, 50) + "..." : "-";
      default:
        return "-";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Data & Consent Control
        </h1>
        <p className="text-muted-foreground mt-1">
          Bepaal wie welke informatie over jouw bedrijf kan zien.
        </p>
      </div>

      <Card data-testid="card-visibility-settings">
        <CardHeader>
          <CardTitle>Zichtbaarheidsinstellingen</CardTitle>
          <CardDescription>
            Kies per veld wie de informatie mag bekijken. Wijzigingen worden pas opgeslagen als je op "Opslaan" klikt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veld</TableHead>
                    <TableHead>Huidige waarde</TableHead>
                    <TableHead>Zichtbaarheid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.fieldLabels &&
                    Object.entries(data.fieldLabels).map(([fieldName, label]) => (
                      <TableRow key={fieldName}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {getFieldValue(fieldName)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={localSettings[fieldName] || "public"}
                            onValueChange={(value) => handleVisibilityChange(fieldName, value)}
                            data-testid={`select-visibility-${fieldName}`}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {data.labels[opt] || opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={!hasChanges || saveMutation.isPending}
                  data-testid="button-save-visibility"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Opslaan..." : "Opslaan"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Zichtbaarheidsniveaus uitgelegd</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium">Openbaar</dt>
              <dd className="text-muted-foreground">Iedereen kan dit veld zien, ook niet-ingelogde bezoekers.</dd>
            </div>
            <div>
              <dt className="font-medium">Alleen leden</dt>
              <dd className="text-muted-foreground">Alleen ingelogde OpenRegio-leden kunnen dit veld zien.</dd>
            </div>
            <div>
              <dt className="font-medium">Alleen mijn regio</dt>
              <dd className="text-muted-foreground">Alleen leden uit dezelfde regio kunnen dit veld zien.</dd>
            </div>
            <div>
              <dt className="font-medium">Privé</dt>
              <dd className="text-muted-foreground">Alleen jij kunt dit veld zien. Niemand anders heeft toegang.</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
