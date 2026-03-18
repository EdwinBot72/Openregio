import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBedrijfsprofielSchema, type InsertBedrijfsprofiel, type Bedrijfsprofiel, PROVINCES_GEMEENTEN, PROVINCES } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Save, MapPin, CreditCard, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BusinessMapView } from "@/components/BusinessMapView";

const formSchema = insertBedrijfsprofielSchema.omit({ gebruikerId: true });

type FormData = z.infer<typeof formSchema>;

export default function BedrijfsprofielPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: existingProfile, isLoading: isLoadingProfile } = useQuery<Bedrijfsprofiel>({
    queryKey: ["/api/business-profile/me"],
    retry: false,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Array<{ value: string; label: string }>>({
    queryKey: ["/api/categories"],
  });

  const { data: allProfiles = [] } = useQuery<Bedrijfsprofiel[]>({
    queryKey: ["/api/business-profiles/public"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      naam: "",
      eigenaarnaam: "",
      categorieId: "",
      regio: "",
      beschrijving: "",
      websiteUrl: "",
      stemtoon: "",
      status: "actief",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/business-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile/me"] });
      toast({
        title: "Profiel opgeslagen",
        description: "Je bedrijfsprofiel is succesvol opgeslagen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden bij het opslaan van je profiel.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscription/cancel", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Abonnement opgezegd",
        description: "Je Pro-abonnement is opgezegd. Je houdt tot het einde van de periode toegang.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij opzeggen",
        description: error.message || "Er is een fout opgetreden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    },
  });

  // Pre-populate form when profile data is loaded
  useEffect(() => {
    if (existingProfile && !form.formState.isDirty) {
      form.reset({
        naam: existingProfile.naam,
        eigenaarnaam: existingProfile.eigenaarnaam,
        categorieId: existingProfile.categorieId,
        regio: existingProfile.regio,
        beschrijving: existingProfile.beschrijving,
        websiteUrl: existingProfile.websiteUrl ?? "",
        stemtoon: existingProfile.stemtoon ?? "",
        status: existingProfile.status as "actief" | "inactief" | "concept",
      });
    }
  }, [existingProfile, form]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-profile" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-heading">Bedrijfsprofiel</h1>
        </div>
        <p className="text-muted-foreground">
          {existingProfile
            ? "Bewerk je bedrijfsprofiel om zichtbaar te zijn voor andere ondernemers."
            : "Maak je bedrijfsprofiel aan om zichtbaar te zijn voor andere ondernemers."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bedrijfsgegevens</CardTitle>
          <CardDescription>
            Vul je bedrijfsgegevens in zodat andere leden van de coöperatie je kunnen vinden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="naam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsnaam *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Bakkerij de Gouden Korrel"
                        {...field}
                        data-testid="input-naam"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eigenaarnaam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam eigenaar *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Jan de Bakker"
                        {...field}
                        data-testid="input-eigenaarnaam"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categorieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-categorie">
                          <SelectValue placeholder="Selecteer een categorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemeente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-regio">
                          <SelectValue placeholder="Selecteer je gemeente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-80">
                        {PROVINCES.map((province) => (
                          <SelectGroup key={province}>
                            <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
                            {PROVINCES_GEMEENTEN[province].map((gemeente) => (
                              <SelectItem key={gemeente} value={gemeente} className="pl-6">
                                {gemeente}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      De gemeente waar je bedrijf gevestigd is
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beschrijving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vertel over je bedrijf, wat je doet en wat je uniek maakt..."
                        className="min-h-[120px] resize-none"
                        {...field}
                        data-testid="textarea-beschrijving"
                      />
                    </FormControl>
                    <FormDescription>
                      Beschrijf je bedrijf in enkele zinnen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.jouwbedrijf.nl"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-website"
                      />
                    </FormControl>
                    <FormDescription>Optioneel: je bedrijfswebsite</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stemtoon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stemtoon voor AI-content</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. vriendelijk en professioneel, informeel, zakelijk"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-stemtoon"
                      />
                    </FormControl>
                    <FormDescription>
                      Optioneel: hoe wil je dat RegioBot schrijft voor jou?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actief">Actief</SelectItem>
                        <SelectItem value="inactief">Inactief</SelectItem>
                        <SelectItem value="concept">Concept</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Alleen actieve profielen zijn zichtbaar voor andere leden
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Profiel opslaan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Map of all businesses */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Ondernemers op de kaart</CardTitle>
              <CardDescription>
                Bekijk waar alle OpenRegio ondernemers gevestigd zijn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allProfiles.length > 0 ? (
            <BusinessMapView businesses={allProfiles} />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Nog geen bedrijfsprofielen beschikbaar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lidmaatschap sectie — alleen zichtbaar voor Pro-leden */}
      {user?.plan === "pro" && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base font-medium">Lidmaatschap</CardTitle>
                <CardDescription>Beheer je abonnement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" data-testid="badge-plan">
                  Pro
                </Badge>
                <span className="text-sm text-muted-foreground">Actief abonnement</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground text-sm"
                    data-testid="button-cancel-subscription"
                  >
                    Abonnement opzeggen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Abonnement opzeggen?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <span className="block">
                        Als je je Pro-abonnement opzegt, verlies je toegang tot:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Onbeperkt gebruik van RegioBot</li>
                        <li>Zichtbaarheid voor andere ondernemers</li>
                        <li>Toegang tot exclusieve deals en kansen</li>
                        <li>WOO-verzoeken en geavanceerde tools</li>
                      </ul>
                      <span className="block pt-1">
                        Je houdt tot het einde van de huidige periode toegang. Daarna wordt je plan teruggezet naar Basis.
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-dialog-cancel">
                      Toch niet
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                      className="bg-destructive text-destructive-foreground"
                      data-testid="button-confirm-cancel-subscription"
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Bezig...
                        </>
                      ) : (
                        "Ja, zeg op"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
