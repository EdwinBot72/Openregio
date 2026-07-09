import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { queryClient, apiRequest, parseApiError } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  CalendarDays, MapPin, Users, Plus, Pencil, Trash2,
  Search, Sparkles, Building2, Lock, ArrowRight, CheckCircle2, Clock,
  AlertTriangle, Loader2,
} from "lucide-react";
import type { LokaleActie } from "@shared/schema";
import { LOKALE_ACTIE_DOELGROEPEN, insertLokaleActieSchema } from "@shared/schema";

const DOELGROEP_LABELS: Record<string, string> = {
  iedereen: "Iedereen",
  buurtbewoners: "Buurtbewoners",
  ouderen: "Ouderen",
  studenten: "Studenten",
  gezinnen: "Gezinnen",
  ondernemers: "Ondernemers",
  kinderen: "Kinderen",
};

// Derived from shared insertLokaleActieSchema: ownerUserId is set server-side,
// and we override timestamp/url/email fields to accept the UI's string-input shapes.
const actieSchema = insertLokaleActieSchema
  .omit({
    ownerUserId: true,
    datum: true,
    externeLink: true,
    contactEmail: true,
    bedrijfsnaam: true,
  })
  .extend({
    titel: z.string().min(5, "Minimaal 5 tekens").max(255),
    beschrijving: z.string().min(20, "Minimaal 20 tekens"),
    locatie: z.string().min(2, "Vul een locatie in").max(255),
    regio: z.string().min(2, "Vul je gemeente of regio in").max(255),
    datum: z.string().optional(),
    externeLink: z.string().url("Vul een geldige URL in").or(z.literal("")).optional(),
    contactEmail: z.string().email("Ongeldig e-mailadres").or(z.literal("")).optional(),
    bedrijfsnaam: z.string().max(255).optional(),
  });
type ActieForm = z.infer<typeof actieSchema>;

function formatDatum(d: string | Date | null | undefined) {
  if (!d) return "Doorlopend";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "EEEE d MMM yyyy 'om' HH:mm", { locale: nl });
}

function formatDatumKort(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "d MMM", { locale: nl });
}

type GeocodeStatus = "idle" | "checking" | "ok" | "notfound" | "error";

async function checkAdresGeocodeerbaar(locatie: string, regio: string): Promise<boolean | null> {
  const query = `${locatie}, ${regio}, Nederland`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=nl&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json) && json.length > 0;
  } catch {
    return null;
  }
}

function toDatetimeLocalValue(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LokaleActiesPage() {
  usePageTitle("Lokale acties");
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.plan === "pro" || user?.plan === "coaching";

  // Markeer lokale acties als gezien zodra de pagina wordt bezocht → zet badge op nul
  useEffect(() => {
    if (!user) return;
    apiRequest("POST", "/api/lokale-acties/mark-seen").then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties/unread-count"] });
    }).catch(() => {});
  }, [user]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LokaleActie | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LokaleActie | null>(null);
  const [zoek, setZoek] = useState("");
  const [filterDoelgroep, setFilterDoelgroep] = useState("alle");
  const [filterRegio, setFilterRegio] = useState("");
  const [sortBy, setSortBy] = useState<"datum" | "regio">("datum");
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>("idle");
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeCallId = useRef(0);

  const { data: acties = [], isLoading } = useQuery<LokaleActie[]>({
    queryKey: ["/api/lokale-acties"],
    enabled: !!user,
  });

  const form = useForm<ActieForm>({
    resolver: zodResolver(actieSchema),
    defaultValues: {
      titel: "",
      beschrijving: "",
      datum: "",
      locatie: "",
      regio: user?.region ?? "",
      doelgroep: "iedereen",
      externeLink: "",
      contactEmail: user?.email ?? "",
      bedrijfsnaam: user?.businessName ?? "",
    },
  });

  const watchedLocatie = form.watch("locatie");
  const watchedRegio = form.watch("regio");

  useEffect(() => {
    if (!open) return;
    const locatie = watchedLocatie?.trim() ?? "";
    const regio = watchedRegio?.trim() ?? "";

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

    if (locatie.length < 2 || regio.length < 2) {
      setGeocodeStatus("idle");
      return;
    }

    setGeocodeStatus("checking");
    const callId = ++geocodeCallId.current;

    geocodeTimer.current = setTimeout(async () => {
      const found = await checkAdresGeocodeerbaar(locatie, regio);
      if (geocodeCallId.current !== callId) return;
      if (found === null) {
        setGeocodeStatus("error");
      } else {
        setGeocodeStatus(found ? "ok" : "notfound");
      }
    }, 900);

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, [watchedLocatie, watchedRegio, open]);

  function openNieuw() {
    setEditing(null);
    setGeocodeStatus("idle");
    form.reset({
      titel: "",
      beschrijving: "",
      datum: "",
      locatie: "",
      regio: user?.region ?? "",
      doelgroep: "iedereen",
      externeLink: "",
      contactEmail: user?.email ?? "",
      bedrijfsnaam: user?.businessName ?? "",
    });
    setOpen(true);
  }

  function openBewerken(actie: LokaleActie) {
    setEditing(actie);
    setGeocodeStatus("idle");
    form.reset({
      titel: actie.titel,
      beschrijving: actie.beschrijving,
      datum: toDatetimeLocalValue(actie.datum),
      locatie: actie.locatie,
      regio: actie.regio,
      doelgroep: actie.doelgroep as ActieForm["doelgroep"],
      externeLink: actie.externeLink ?? "",
      contactEmail: actie.contactEmail ?? "",
      bedrijfsnaam: actie.bedrijfsnaam ?? "",
    });
    setOpen(true);
  }

  const opslaanMutation = useMutation({
    mutationFn: (data: ActieForm) => {
      const payload = {
        ...data,
        datum: data.datum ? new Date(data.datum).toISOString() : null,
        externeLink: data.externeLink || null,
        contactEmail: data.contactEmail || null,
        bedrijfsnaam: data.bedrijfsnaam || null,
      };
      if (editing) {
        return apiRequest("PATCH", `/api/lokale-acties/${editing.id}`, payload);
      }
      return apiRequest("POST", "/api/lokale-acties", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties"] });
      setOpen(false);
      setEditing(null);
      toast({
        title: editing ? "Actie bijgewerkt" : "Actie geplaatst",
        description: editing ? "Je wijzigingen zijn opgeslagen." : "Je lokale actie staat nu online.",
      });
    },
    onError: (err: unknown) => {
      toast({
        title: "Fout",
        description: parseApiError(err, "Kon actie niet opslaan."),
        variant: "destructive",
      });
    },
  });

  const verwijderenMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/lokale-acties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties"] });
      setConfirmDelete(null);
      toast({ title: "Verwijderd", description: "Je actie is verwijderd." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon actie niet verwijderen.", variant: "destructive" });
    },
  });

  const verlopenMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/lokale-acties/${id}/verlopen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties"] });
      toast({ title: "Verlopen", description: "Je actie is gemarkeerd als verlopen." });
    },
  });

  const gefilterd = useMemo(() => {
    const filtered = acties.filter((a) => {
      const matchDoel = filterDoelgroep === "alle" || a.doelgroep === filterDoelgroep;
      const matchRegio = filterRegio.trim() === "" || a.regio.toLowerCase().includes(filterRegio.toLowerCase());
      const matchZoek = zoek.trim() === "" ||
        a.titel.toLowerCase().includes(zoek.toLowerCase()) ||
        a.beschrijving.toLowerCase().includes(zoek.toLowerCase()) ||
        a.locatie.toLowerCase().includes(zoek.toLowerCase());
      return matchDoel && matchRegio && matchZoek;
    });
    const sorted = [...filtered];
    if (sortBy === "regio") {
      sorted.sort((a, b) => a.regio.localeCompare(b.regio, "nl") || a.titel.localeCompare(b.titel, "nl"));
    } else {
      const FAR = Number.POSITIVE_INFINITY;
      sorted.sort((a, b) => {
        const ta = a.datum ? new Date(a.datum).getTime() : FAR;
        const tb = b.datum ? new Date(b.datum).getTime() : FAR;
        return ta - tb;
      });
    }
    return sorted;
  }, [acties, filterDoelgroep, filterRegio, zoek, sortBy]);

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-lokale-acties">
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CalendarDays style={{ width: 24, height: 24, color: "#f28a1a" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-pagina-titel">Lokale Acties</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Evenementen, buurtacties en ondernemersinitiatieven van lokale Pro-leden.
            </p>
          </div>
        </div>
        <div>
        {isPro ? (
          <Button onClick={openNieuw} data-testid="button-nieuwe-actie">
            <Plus className="mr-2 h-4 w-4" /> Start lokale actie
          </Button>
        ) : (
          <Link href="/lidmaatschap?plan=pro">
            <Button variant="outline" data-testid="button-upgrade-pro">
              <Lock className="mr-2 h-4 w-4" /> Upgrade naar Pro om te plaatsen
            </Button>
          </Link>
        )}
      </div>

      {/* Pro upgrade-teaser */}
      {!isPro && (
        <Card className="border-dashed" data-testid="card-pro-teaser">
          <CardContent className="p-4 sm:p-5 flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Wil je zelf een actie organiseren?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pro-leden kunnen lokale acties aanmaken en zo zichtbaar worden bij andere ondernemers en buurtbewoners in hun regio.
              </p>
            </div>
            <Link href="/lidmaatschap?plan=pro" className="shrink-0">
              <Button variant="default" size="sm" data-testid="button-teaser-upgrade">
                Bekijk Pro <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Filters + sortering */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3" data-testid="row-filters">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op titel, locatie..."
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9"
            data-testid="input-zoek"
          />
        </div>
        <Input
          placeholder="Filter op gemeente..."
          value={filterRegio}
          onChange={(e) => setFilterRegio(e.target.value)}
          data-testid="input-filter-regio"
        />
        <Select value={filterDoelgroep} onValueChange={setFilterDoelgroep}>
          <SelectTrigger data-testid="select-filter-doelgroep">
            <SelectValue placeholder="Alle doelgroepen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle doelgroepen</SelectItem>
            {LOKALE_ACTIE_DOELGROEPEN.map((d) => (
              <SelectItem key={d} value={d}>{DOELGROEP_LABELS[d]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "datum" | "regio")}>
          <SelectTrigger data-testid="select-sortering">
            <SelectValue placeholder="Sorteren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="datum">Sorteer op datum</SelectItem>
            <SelectItem value="regio">Sorteer op regio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resultaten */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gefilterd.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2" data-testid="empty-state">
          <CalendarDays className="h-10 w-10 mx-auto opacity-30" />
          <p className="font-medium">Geen lokale acties gevonden</p>
          <p className="text-sm">
            {acties.length === 0
              ? "Wees de eerste en organiseer een actie in jouw regio."
              : "Pas je filters aan om meer resultaten te zien."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4" data-testid="lijst-acties">
          {gefilterd.map((actie) => {
            const isEigen = user?.id === actie.ownerUserId;
            return (
              <Card
                key={actie.id}
                className="hover-elevate"
                data-testid={`card-actie-${actie.id}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" data-testid={`badge-doelgroep-${actie.id}`}>
                        <Users className="mr-1 h-3 w-3" />
                        {DOELGROEP_LABELS[actie.doelgroep] ?? actie.doelgroep}
                      </Badge>
                      {actie.datum && (
                        <Badge variant="outline" data-testid={`badge-datum-${actie.id}`}>
                          <CalendarDays className="mr-1 h-3 w-3" />
                          {formatDatumKort(actie.datum)}
                        </Badge>
                      )}
                    </div>
                    {isEigen && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openBewerken(actie)}
                          data-testid={`button-bewerk-${actie.id}`}
                          aria-label="Bewerk actie"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => verlopenMutation.mutate(actie.id)}
                          disabled={verlopenMutation.isPending}
                          data-testid={`button-verlopen-${actie.id}`}
                          aria-label="Markeer als verlopen"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDelete(actie)}
                          data-testid={`button-verwijder-${actie.id}`}
                          aria-label="Verwijder actie"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/lokale-acties/${actie.id}`}
                    className="block space-y-3"
                    data-testid={`link-detail-${actie.id}`}
                  >
                    <div>
                      <p className="font-semibold text-base mb-1" data-testid={`text-titel-${actie.id}`}>
                        {actie.titel}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {actie.beschrijving}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {actie.datum && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{formatDatum(actie.datum)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{actie.locatie} — {actie.regio}</span>
                      </div>
                      {actie.bedrijfsnaam && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span>{actie.bedrijfsnaam}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 flex items-center justify-end gap-2 flex-wrap">
                      <span className="text-xs text-primary inline-flex items-center">
                        Bekijk details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Aanmaken / bewerken dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Actie bewerken" : "Nieuwe lokale actie"}
            </DialogTitle>
            <DialogDescription>
              Vul de details van je actie in. Andere leden zien deze in het overzicht in jouw regio.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => opslaanMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="titel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. 'Buurtbarbecue voor ouderen'"
                        {...field}
                        data-testid="input-form-titel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beschrijving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschrijf wat je organiseert, wat bezoekers kunnen verwachten en eventuele kosten."
                        className="min-h-[90px]"
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
                  name="datum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum &amp; tijd <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          data-testid="input-form-datum"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doelgroep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doelgroep</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-form-doelgroep">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOKALE_ACTIE_DOELGROEPEN.map((d) => (
                            <SelectItem key={d} value={d}>{DOELGROEP_LABELS[d]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="locatie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locatie</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. 'Café Centraal, Hoofdstraat 12'"
                        {...field}
                        data-testid="input-form-locatie"
                      />
                    </FormControl>
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
                      <Input
                        placeholder="Bijv. Utrecht"
                        {...field}
                        data-testid="input-form-regio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {geocodeStatus === "checking" && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  data-testid="status-geocode-checking"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Adres wordt gecontroleerd op de kaart...</span>
                </div>
              )}
              {geocodeStatus === "notfound" && (
                <div
                  className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-3 text-xs text-amber-800 dark:text-amber-300"
                  data-testid="warning-geocode-notfound"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Dit adres kon niet worden gevonden op de kaart. Je actie wordt wel geplaatst,
                    maar verschijnt dan niet op de kaart bij /acties. Controleer de locatie en regio
                    en pas ze eventueel aan.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="externeLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Externe link <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          data-testid="input-form-link"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact-e-mail <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@bedrijf.nl"
                          {...field}
                          data-testid="input-form-contact"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bedrijfsnaam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsnaam <span className="text-muted-foreground">(optioneel)</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jouw bedrijf"
                        {...field}
                        data-testid="input-form-bedrijf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setOpen(false); setEditing(null); }}
                  data-testid="button-annuleer"
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={opslaanMutation.isPending}
                  data-testid="button-opslaan"
                >
                  {opslaanMutation.isPending
                    ? "Opslaan..."
                    : editing
                      ? "Wijzigingen opslaan"
                      : "Actie plaatsen"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bevestig verwijderen */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Actie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie wordt permanent verwijderd en is niet meer zichtbaar voor andere leden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-annuleer-verwijderen">Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && verwijderenMutation.mutate(confirmDelete.id)}
              data-testid="button-bevestig-verwijderen"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  </div>
  );
}
