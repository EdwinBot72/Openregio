import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle as useTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Search, Plus, MapPin, Trash2, Clock, ArrowRight, Store,
  Package, Lightbulb, Handshake, Building2, Wrench, HelpCircle,
} from "lucide-react";
import type { LokaalAanbod } from "@shared/schema";
import { LOKAAL_AANBOD_CATEGORIEEN } from "@shared/schema";

const CATEGORIE_LABELS: Record<string, string> = {
  diensten: "Diensten",
  producten: "Producten",
  ruimte: "Ruimte",
  materieel: "Materieel",
  kennis: "Kennis",
  samenwerking: "Samenwerking",
  overig: "Overig",
};

const CATEGORIE_ICON: Record<string, typeof Store> = {
  diensten: Wrench,
  producten: Package,
  ruimte: Building2,
  materieel: Store,
  kennis: Lightbulb,
  samenwerking: Handshake,
  overig: HelpCircle,
};

const plaatsingSchema = z.object({
  type: z.enum(["zoek", "bied"]),
  titel: z.string().min(5, "Minimaal 5 tekens").max(255),
  beschrijving: z.string().min(20, "Minimaal 20 tekens"),
  categorie: z.enum(LOKAAL_AANBOD_CATEGORIEEN),
  regio: z.string().min(2, "Vul je gemeente of regio in"),
  bedrijfsnaam: z.string().optional(),
  contactInfo: z.string().optional(),
  zichtbaarheid: z.enum(["lokaal", "leden"]),
});
type PlaatsingForm = z.infer<typeof plaatsingSchema>;

function formatDatum(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d as string);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default function LokaalMarktplaatsPage() {
  usePageTitle("Lokale Marktplaats");
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState("alle");
  const [filterCat, setFilterCat] = useState("alle");
  const [zoek, setZoek] = useState("");

  const { data: items = [], isLoading } = useQuery<LokaalAanbod[]>({
    queryKey: ["/api/lokaal-marktplaats"],
  });

  const { data: eigenItems = [] } = useQuery<LokaalAanbod[]>({
    queryKey: ["/api/lokaal-marktplaats/me"],
    enabled: !!user,
  });

  const form = useForm<PlaatsingForm>({
    resolver: zodResolver(plaatsingSchema),
    defaultValues: {
      type: "bied",
      titel: "",
      beschrijving: "",
      categorie: "diensten",
      regio: "",
      bedrijfsnaam: "",
      contactInfo: "",
      zichtbaarheid: "leden",
    },
  });

  const maakAanMutation = useMutation({
    mutationFn: (data: PlaatsingForm) =>
      apiRequest("POST", "/api/lokaal-marktplaats", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokaal-marktplaats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lokaal-marktplaats/me"] });
      setOpen(false);
      form.reset();
      toast({ title: "Geplaatst!", description: "Je aanbod staat nu op de marktplaats." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon aanbod niet plaatsen.", variant: "destructive" });
    },
  });

  const verwijderMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/lokaal-marktplaats/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokaal-marktplaats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lokaal-marktplaats/me"] });
      toast({ title: "Verwijderd", description: "Je aanbod is verwijderd." });
    },
  });

  const gefilterd = items.filter((item) => {
    const matchType = filterType === "alle" || item.type === filterType;
    const matchCat = filterCat === "alle" || item.categorie === filterCat;
    const matchZoek =
      zoek.trim() === "" ||
      item.titel.toLowerCase().includes(zoek.toLowerCase()) ||
      item.beschrijving.toLowerCase().includes(zoek.toLowerCase());
    return matchType && matchCat && matchZoek;
  });

  const eigenIds = new Set(eigenItems.map((i) => i.id));

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Store style={{ width: 24, height: 24, color: "#0891b2" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Lokale Marktplaats</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Lokale ondernemers zoeken en bieden: diensten, producten, ruimte en samenwerking.
            </p>
          </div>
        </div>
        {user ? (
          <Button onClick={() => setOpen(true)} data-testid="button-nieuw-aanbod">
            <Plus className="mr-2 h-4 w-4" /> Nieuw aanbod
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" data-testid="button-login-om-te-plaatsen">
              Inloggen om te plaatsen
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoeken..."
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9"
            data-testid="input-zoek-marktplaats"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger data-testid="select-type">
            <SelectValue placeholder="Zoek & bied" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alles</SelectItem>
            <SelectItem value="bied">Ik bied</SelectItem>
            <SelectItem value="zoek">Ik zoek</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger data-testid="select-cat">
            <SelectValue placeholder="Alle categorieën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle categorieën</SelectItem>
            {LOKAAL_AANBOD_CATEGORIEEN.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORIE_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultaten */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gefilterd.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Store className="h-10 w-10 mx-auto opacity-30" />
          <p className="font-medium">Geen aanbod gevonden</p>
          <p className="text-sm">Wees de eerste en plaats een oproep!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {gefilterd.map((item) => {
            const Icon = CATEGORIE_ICON[item.categorie] ?? Store;
            const isEigen = eigenIds.has(item.id);
            return (
              <Card key={item.id} className="hover-elevate" data-testid={`card-item-${item.id}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] shrink-0 ${item.type === "bied" ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300" : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"}`}
                        data-testid={`badge-type-${item.id}`}
                      >
                        {item.type === "bied" ? "Ik bied" : "Ik zoek"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORIE_LABELS[item.categorie]}
                      </Badge>
                    </div>
                    {isEigen && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => verwijderMutation.mutate(item.id)}
                        disabled={verwijderMutation.isPending}
                        data-testid={`button-verwijder-${item.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{item.titel}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.beschrijving}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{item.regio}
                      </span>
                      {item.bedrijfsnaam && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{item.bedrijfsnaam}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDatum(item.createdAt)}
                    </span>
                  </div>
                  {item.contactInfo && (
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground">{item.contactInfo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Plaatsing modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nieuw aanbod plaatsen</DialogTitle>
            <DialogDescription>
              Vertel wat je zoekt of aanbiedt. Alleen ingelogde OpenRegio-leden zien je contactinfo.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => maakAanMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-form-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bied">Ik bied aan</SelectItem>
                        <SelectItem value="zoek">Ik zoek</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel</FormLabel>
                    <FormControl>
                      <Input placeholder="Bijv. 'Freelance ontwerper beschikbaar'" {...field} data-testid="input-form-titel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="categorie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-form-categorie">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOKAAL_AANBOD_CATEGORIEEN.map((c) => (
                            <SelectItem key={c} value={c}>{CATEGORIE_LABELS[c]}</SelectItem>
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
                      <FormLabel>Gemeente / regio</FormLabel>
                      <FormControl>
                        <Input placeholder="Bijv. Utrecht" {...field} data-testid="input-form-regio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="beschrijving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Omschrijving</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschrijf wat je zoekt of aanbiedt, voor wie, en eventuele voorwaarden..."
                        className="min-h-[80px]"
                        {...field}
                        data-testid="textarea-form-beschrijving"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="bedrijfsnaam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrijfsnaam <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Jouw bedrijfsnaam" {...field} data-testid="input-form-bedrijf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contactinfo <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Email of telefoon" {...field} data-testid="input-form-contact" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="zichtbaarheid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zichtbaarheid</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-form-zichtbaarheid">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="leden">Alleen leden (na inloggen)</SelectItem>
                        <SelectItem value="lokaal">Publiek zichtbaar (ook zonder inloggen)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                  data-testid="button-annuleer"
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={maakAanMutation.isPending}
                  data-testid="button-plaatsen"
                >
                  {maakAanMutation.isPending ? "Plaatsen..." : "Plaatsen"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
