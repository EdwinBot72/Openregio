import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  AlertTriangle,
  Bell,
  Info,
  Landmark,
} from "lucide-react";
import type { IntelSignaal, InsertIntelSignaal } from "@shared/schema";
import { insertIntelSignaalSchema, INTEL_CATEGORIES, INTEL_URGENTIE } from "@shared/schema";

const CATEGORIE_LABELS: Record<string, string> = {
  wetgeving: "Wetgeving",
  beleid: "Lokaal beleid",
  financieel: "Financieel",
  subsidies: "Subsidies",
};

const URGENTIE_LABELS: Record<string, string> = {
  hoog: "Urgent",
  normaal: "Actueel",
  info: "Info",
};

const URGENTIE_BADGE: Record<string, "destructive" | "secondary" | "outline"> = {
  hoog: "destructive",
  normaal: "secondary",
  info: "outline",
};

const URGENTIE_ICON: Record<string, typeof AlertTriangle> = {
  hoog: AlertTriangle,
  normaal: Bell,
  info: Info,
};

function SignaalForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<InsertIntelSignaal>;
  onSubmit: (data: InsertIntelSignaal) => void;
  isPending: boolean;
}) {
  const form = useForm<InsertIntelSignaal>({
    resolver: zodResolver(insertIntelSignaalSchema),
    defaultValues: {
      categorie: "wetgeving",
      urgentie: "normaal",
      titel: "",
      samenvatting: "",
      bron: "",
      regio: "Nationaal",
      bronUrl: "",
      isPublished: true,
      datum: new Date(),
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder="Nieuwe omgevingswet per 1 januari van kracht" {...field} data-testid="input-signaal-titel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-signaal-categorie">
                      <SelectValue placeholder="Kies categorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTEL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORIE_LABELS[cat] ?? cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urgentie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgentie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-signaal-urgentie">
                      <SelectValue placeholder="Kies urgentie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTEL_URGENTIE.map((u) => (
                      <SelectItem key={u} value={u}>{URGENTIE_LABELS[u] ?? u}</SelectItem>
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
          name="samenvatting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Samenvatting</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Korte beschrijving van het signaal en wat dit betekent voor ondernemers..."
                  rows={3}
                  {...field}
                  data-testid="input-signaal-samenvatting"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bron"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bron</FormLabel>
                <FormControl>
                  <Input placeholder="Rijksoverheid" {...field} data-testid="input-signaal-bron" />
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
                <FormLabel>Regio</FormLabel>
                <FormControl>
                  <Input placeholder="Nationaal" {...field} data-testid="input-signaal-regio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bronUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bron-URL (optioneel)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.rijksoverheid.nl/..." {...field} value={field.value ?? ""} data-testid="input-signaal-bron-url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  data-testid="switch-signaal-published"
                />
              </FormControl>
              <FormLabel className="!mt-0">Zichtbaar voor leden</FormLabel>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-save-signaal">
            {isPending ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminIntelPage() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<IntelSignaal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: signalen, isLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen/all"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertIntelSignaal) => apiRequest("POST", "/api/intel/signalen", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      setShowCreate(false);
      toast({ title: "Signaal aangemaakt" });
    },
    onError: () => toast({ title: "Fout", description: "Kon signaal niet aanmaken.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertIntelSignaal> }) =>
      apiRequest("PATCH", `/api/intel/signalen/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      setEditing(null);
      toast({ title: "Signaal bijgewerkt" });
    },
    onError: () => toast({ title: "Fout", description: "Kon signaal niet bijwerken.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/intel/signalen/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      setConfirmDelete(null);
      toast({ title: "Signaal verwijderd" });
    },
    onError: () => toast({ title: "Fout", description: "Kon signaal niet verwijderen.", variant: "destructive" }),
  });

  const fetchMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/intel/fetch"),
    onSuccess: async (res: any) => {
      const json = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      toast({ title: `Fetch klaar — ${json.nieuwSignalen ?? 0} nieuwe signalen opgeslagen` });
    },
    onError: () => toast({ title: "Fout", description: "Fetch mislukt.", variant: "destructive" }),
  });

  const togglePublished = (signaal: IntelSignaal) => {
    updateMutation.mutate({ id: signaal.id, data: { isPublished: !signaal.isPublished } });
  };

  const formatDatum = (d: string | Date) =>
    new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="heading-admin-intel">
            <Landmark className="h-6 w-6 text-primary" />
            Regio Intel beheer
          </h1>
          <p className="text-muted-foreground mt-1">Beheer signalen die zichtbaar zijn op de Intel-pagina.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => fetchMutation.mutate()}
            disabled={fetchMutation.isPending}
            data-testid="button-fetch-signalen"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchMutation.isPending ? "animate-spin" : ""}`} />
            {fetchMutation.isPending ? "Ophalen..." : "Nu ophalen"}
          </Button>
          <Button onClick={() => setShowCreate(true)} data-testid="button-new-signaal">
            <Plus className="w-4 h-4 mr-2" />
            Nieuw signaal
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Laden...</p>
      )}

      {!isLoading && (!signalen || signalen.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground" data-testid="text-no-signalen">
            Nog geen signalen. Klik op "Nu ophalen" om automatisch signalen te importeren, of voeg er handmatig een toe.
          </CardContent>
        </Card>
      )}

      {signalen && signalen.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {signalen.length} signaal{signalen.length !== 1 ? "en" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <div className="divide-y">
              {signalen.map((signaal) => {
                const UrgIcon = URGENTIE_ICON[signaal.urgentie] ?? Info;
                return (
                  <div
                    key={signaal.id}
                    className="flex flex-wrap items-center gap-3 p-4"
                    data-testid={`row-signaal-${signaal.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={URGENTIE_BADGE[signaal.urgentie] ?? "outline"} className="text-xs gap-1">
                          <UrgIcon className="h-3 w-3" />
                          {URGENTIE_LABELS[signaal.urgentie] ?? signaal.urgentie}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIE_LABELS[signaal.categorie] ?? signaal.categorie}
                        </Badge>
                        {!signaal.isPublished && (
                          <Badge variant="secondary" className="text-xs">Verborgen</Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm leading-snug" data-testid={`text-signaal-titel-${signaal.id}`}>
                        {signaal.titel}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{signaal.bron}</span>
                        <span>{signaal.regio}</span>
                        <span>{formatDatum(signaal.datum)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={signaal.isPublished}
                        onCheckedChange={() => togglePublished(signaal)}
                        data-testid={`switch-published-${signaal.id}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(signaal)}
                        data-testid={`button-edit-${signaal.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setConfirmDelete(signaal.id)}
                        data-testid={`button-delete-${signaal.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nieuw signaal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuw signaal toevoegen</DialogTitle>
          </DialogHeader>
          <SignaalForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Bewerken */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Signaal bewerken</DialogTitle>
          </DialogHeader>
          {editing && (
            <SignaalForm
              defaultValues={{ ...editing, datum: editing.datum ? new Date(editing.datum) : new Date() }}
              onSubmit={(data) => updateMutation.mutate({ id: editing.id, data })}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Verwijder bevestiging */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaal verwijderen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Dit signaal wordt definitief verwijderd en is niet meer zichtbaar voor leden.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} data-testid="button-cancel-delete">
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
