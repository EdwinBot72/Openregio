import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QueryState } from "@/components/query-state";
import { UserPlus, Briefcase, Clock, MapPin, Euro, Plus, Send, Users, Search, Trash2 } from "lucide-react";
import { CREW_CATEGORIES, PROVINCES_REGIONS, PROVINCES, type CrewProfile, type CrewRequest } from "@shared/schema";
import { RegionSelect } from "@/components/region-select";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const crewProfileSchema = z.object({
  displayName: z.string().min(2, "Naam is verplicht"),
  headline: z.string().optional(),
  region: z.string().min(1, "Regio is verplicht"),
  categories: z.array(z.string()).min(1, "Selecteer minimaal 1 categorie"),
  skills: z.array(z.string()).default([]),
  rateType: z.enum(["hour", "day", "fixed"]).default("hour"),
  rateMinEur: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
});

const crewRequestSchema = z.object({
  title: z.string().min(3, "Titel is verplicht"),
  description: z.string().optional(),
  region: z.string().min(1, "Regio is verplicht"),
  category: z.string().min(1, "Categorie is verplicht"),
  skills: z.array(z.string()).default([]),
  startAt: z.string().min(1, "Startdatum is verplicht"),
  endAt: z.string().min(1, "Einddatum is verplicht"),
  rateType: z.enum(["hour", "day", "fixed", "negotiable"]).default("negotiable"),
  rateEur: z.string().optional(),
  locationText: z.string().optional(),
});

const categoryLabels: Record<string, string> = {
  retail: "Retail",
  horeca: "Horeca",
  logistiek: "Logistiek",
  administratie: "Administratie",
  techniek: "Techniek",
  zorg: "Zorg",
  onderwijs: "Onderwijs",
  creatief: "Creatief",
  it: "IT",
  overig: "Overig",
};

const rateTypeLabels: Record<string, string> = {
  hour: "Per uur",
  day: "Per dag",
  fixed: "Vaste prijs",
  negotiable: "Bespreekbaar",
};

export default function RegioCrewPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const { data: myProfile, isLoading: profileLoading } = useQuery<CrewProfile | null>({
    queryKey: ["/api/crew/profile"],
  });

  const { data: allProfiles, isLoading: profilesLoading } = useQuery<CrewProfile[]>({
    queryKey: ["/api/crew/profiles", filterRegion, filterCategory],
  });

  const { data: openRequests, isLoading: requestsLoading } = useQuery<CrewRequest[]>({
    queryKey: ["/api/crew/requests", filterRegion, filterCategory],
  });

  const { data: myRequests } = useQuery<CrewRequest[]>({
    queryKey: ["/api/crew/my-requests"],
  });

  const profileForm = useForm<z.infer<typeof crewProfileSchema>>({
    resolver: zodResolver(crewProfileSchema),
    defaultValues: {
      displayName: "",
      headline: "",
      region: "",
      categories: [],
      skills: [],
      rateType: "hour",
      rateMinEur: "",
      phone: "",
      bio: "",
      isActive: true,
    },
  });

  const requestForm = useForm<z.infer<typeof crewRequestSchema>>({
    resolver: zodResolver(crewRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      region: "",
      category: "",
      skills: [],
      startAt: "",
      endAt: "",
      rateType: "negotiable",
      rateEur: "",
      locationText: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof crewProfileSchema>) => {
      return apiRequest("POST", "/api/crew/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/profiles"] });
      setShowProfileDialog(false);
      toast({ title: "Flex-profiel aangemaakt!" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof crewProfileSchema>) => {
      return apiRequest("PUT", "/api/crew/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/profiles"] });
      toast({ title: "Profiel bijgewerkt!" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof crewRequestSchema>) => {
      return apiRequest("POST", "/api/crew/requests", {
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/my-requests"] });
      setShowRequestDialog(false);
      requestForm.reset();
      toast({ title: "Hulpvraag geplaatst!" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message?: string }) => {
      return apiRequest("POST", `/api/crew/requests/${requestId}/apply`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/my-applications"] });
      toast({ title: "Reactie verzonden!" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest("DELETE", `/api/crew/requests/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/my-requests"] });
      toast({ title: "Hulpvraag verwijderd" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const toggleCategory = (cat: string) => {
    const current = profileForm.getValues("categories");
    if (current.includes(cat)) {
      profileForm.setValue("categories", current.filter(c => c !== cat));
    } else {
      profileForm.setValue("categories", [...current, cat]);
    }
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-regiocrew">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eaf6ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserPlus style={{ width: 24, height: 24, color: "#1a6b3a" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>RegioCrew</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Flex-pool voor tijdelijke hulp bij personeelstekorten
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!myProfile && (
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-profile">
                  <Plus className="h-4 w-4 mr-2" />
                  Maak flex-profiel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nieuw Flex-profiel</DialogTitle>
                  <DialogDescription>
                    Bied je diensten aan bij andere ondernemers
                  </DialogDescription>
                </DialogHeader>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit((data) => createProfileMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Naam</FormLabel>
                          <FormControl>
                            <Input placeholder="Jouw naam" {...field} data-testid="input-profile-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tagline (optioneel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Bijv: Ervaren horeca-allrounder" {...field} data-testid="input-profile-headline" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-profile-region">
                                <SelectValue placeholder="Selecteer regio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80">
                              {PROVINCES.map((province) => (
                                <SelectGroup key={province}>
                                  <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
                                  {PROVINCES_REGIONS[province].map((region) => (
                                    <SelectItem key={region} value={region} className="pl-6">
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="categories"
                      render={() => (
                        <FormItem>
                          <FormLabel>Categorieën</FormLabel>
                          <FormDescription>Selecteer waar je beschikbaar voor bent</FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {CREW_CATEGORIES.map((cat) => (
                              <Badge
                                key={cat}
                                variant={profileForm.watch("categories").includes(cat) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleCategory(cat)}
                                data-testid={`badge-category-${cat}`}
                              >
                                {categoryLabels[cat]}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="rateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tarief type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hour">Per uur</SelectItem>
                                <SelectItem value="day">Per dag</SelectItem>
                                <SelectItem value="fixed">Vaste prijs</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="rateMinEur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tarief vanaf (€)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="25" {...field} data-testid="input-profile-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefoon (optioneel)</FormLabel>
                          <FormControl>
                            <Input placeholder="06-12345678" {...field} data-testid="input-profile-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Over jezelf (optioneel)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Vertel iets over je ervaring..." {...field} data-testid="input-profile-bio" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Beschikbaar</FormLabel>
                            <FormDescription>Toon mijn profiel aan andere ondernemers</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Annuleren</Button>
                      </DialogClose>
                      <Button type="submit" disabled={createProfileMutation.isPending} data-testid="button-submit-profile">
                        {createProfileMutation.isPending ? "Bezig..." : "Aanmaken"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-request">
                <Briefcase className="h-4 w-4 mr-2" />
                Plaats hulpvraag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nieuwe Hulpvraag</DialogTitle>
                <DialogDescription>
                  Zoek tijdelijke hulp bij je bedrijf
                </DialogDescription>
              </DialogHeader>
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit((data) => createRequestMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titel</FormLabel>
                        <FormControl>
                          <Input placeholder="Bijv: Kassamedewerker gezocht" {...field} data-testid="input-request-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={requestForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Omschrijving</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Beschrijf de werkzaamheden..." {...field} data-testid="input-request-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={requestForm.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-request-region">
                                <SelectValue placeholder="Selecteer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80">
                              {PROVINCES.map((province) => (
                                <SelectGroup key={province}>
                                  <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
                                  {PROVINCES_REGIONS[province].map((region) => (
                                    <SelectItem key={region} value={region} className="pl-6">
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requestForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categorie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-request-category">
                                <SelectValue placeholder="Selecteer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CREW_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={requestForm.control}
                      name="startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startdatum</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-request-start" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requestForm.control}
                      name="endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Einddatum</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-request-end" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={requestForm.control}
                      name="rateType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vergoeding</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hour">Per uur</SelectItem>
                              <SelectItem value="day">Per dag</SelectItem>
                              <SelectItem value="fixed">Vaste prijs</SelectItem>
                              <SelectItem value="negotiable">Bespreekbaar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requestForm.control}
                      name="rateEur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrag (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} data-testid="input-request-rate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={requestForm.control}
                    name="locationText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locatie (optioneel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Bijv: Winkelcentrum De Boog" {...field} data-testid="input-request-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Annuleren</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createRequestMutation.isPending} data-testid="button-submit-request">
                      {createRequestMutation.isPending ? "Bezig..." : "Plaatsen"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {myProfile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{myProfile.displayName}</CardTitle>
                  {myProfile.headline && (
                    <p className="text-sm text-muted-foreground">{myProfile.headline}</p>
                  )}
                </div>
              </div>
              <Badge variant={myProfile.isActive ? "default" : "secondary"}>
                {myProfile.isActive ? "Beschikbaar" : "Niet beschikbaar"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {myProfile.region}
              </span>
              {myProfile.rateMinEur && (
                <span className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  Vanaf €{myProfile.rateMinEur} {rateTypeLabels[myProfile.rateType as keyof typeof rateTypeLabels]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {myProfile.categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {categoryLabels[cat as keyof typeof categoryLabels]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse" data-testid="tab-browse">
            <Search className="h-4 w-4 mr-2" />
            Hulpvragen
          </TabsTrigger>
          <TabsTrigger value="profiles" data-testid="tab-profiles">
            <Users className="h-4 w-4 mr-2" />
            Beschikbare mensen
          </TabsTrigger>
          <TabsTrigger value="my-requests" data-testid="tab-my-requests">
            <Briefcase className="h-4 w-4 mr-2" />
            Mijn hulpvragen
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap gap-4 my-4">
          <Select value={filterRegion || "all"} onValueChange={(v) => setFilterRegion(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48" data-testid="filter-region">
              <SelectValue placeholder="Alle regio's" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">Alle regio's</SelectItem>
              {PROVINCES.map((province) => (
                <SelectGroup key={province}>
                  <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
                  {PROVINCES_REGIONS[province].map((region) => (
                    <SelectItem key={region} value={region} className="pl-6">
                      {region}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48" data-testid="filter-category">
              <SelectValue placeholder="Alle categorieën" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle categorieën</SelectItem>
              {CREW_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="browse" className="space-y-4">
          <QueryState
            isLoading={requestsLoading}
            isError={false}
            isEmpty={!openRequests?.length}
            emptyMessage="Geen open hulpvragen gevonden"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {openRequests?.map((req) => (
                <Card key={req.id} data-testid={`card-request-${req.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      <Badge>{categoryLabels[req.category as keyof typeof categoryLabels]}</Badge>
                    </div>
                    {req.description && (
                      <CardDescription className="line-clamp-2">{req.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {req.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(req.startAt), "d MMM", { locale: nl })} - {format(new Date(req.endAt), "d MMM", { locale: nl })}
                      </span>
                      {req.rateEur && (
                        <span className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          €{req.rateEur} {rateTypeLabels[req.rateType as keyof typeof rateTypeLabels]}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => applyMutation.mutate({ requestId: req.id })}
                      disabled={applyMutation.isPending || !myProfile}
                      data-testid={`button-apply-${req.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reageer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <QueryState
            isLoading={profilesLoading}
            isError={false}
            isEmpty={!allProfiles?.length}
            emptyMessage="Geen beschikbare profielen gevonden"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allProfiles?.map((profile) => (
                <Card key={profile.id} data-testid={`card-profile-${profile.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{profile.displayName}</CardTitle>
                        {profile.headline && (
                          <p className="text-sm text-muted-foreground">{profile.headline}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.region}
                      </span>
                      {profile.rateMinEur && (
                        <span className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          Vanaf €{profile.rateMinEur}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {categoryLabels[cat as keyof typeof categoryLabels]}
                        </Badge>
                      ))}
                      {profile.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <QueryState
            isLoading={false}
            isError={false}
            isEmpty={!myRequests?.length}
            emptyMessage="Je hebt nog geen hulpvragen geplaatst"
          >
            <div className="grid gap-4">
              {myRequests?.map((req) => (
                <Card key={req.id} data-testid={`card-my-request-${req.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={req.status === "open" ? "default" : "secondary"}>
                          {req.status === "open" ? "Open" : req.status === "filled" ? "Ingevuld" : "Gesloten"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Weet je zeker dat je deze hulpvraag wilt verwijderen?")) {
                              deleteRequestMutation.mutate(req.id);
                            }
                          }}
                          disabled={deleteRequestMutation.isPending}
                          data-testid={`button-delete-request-${req.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {req.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(req.startAt), "d MMM", { locale: nl })} - {format(new Date(req.endAt), "d MMM", { locale: nl })}
                      </span>
                      <Badge variant="outline">{categoryLabels[req.category as keyof typeof categoryLabels]}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryState>
        </TabsContent>
      </Tabs>
    </div>
  </div>
  );
}
