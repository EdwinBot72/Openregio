import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Tag } from "lucide-react";
import type { RegioDeal, InsertRegioDeal } from "@shared/schema";
import { insertRegioDealSchema, REGIO_DEAL_CATEGORIES } from "@shared/schema";

function DealForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<InsertRegioDeal>;
  onSubmit: (data: InsertRegioDeal) => void;
  isPending: boolean;
}) {
  const form = useForm<InsertRegioDeal>({
    resolver: zodResolver(insertRegioDealSchema),
    defaultValues: {
      title: "",
      provider: "",
      category: "Overig",
      description: "",
      discount: "",
      url: "",
      promoCode: "",
      validUntil: "",
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="30% korting op Twinfield boekhouden" {...field} data-testid="input-deal-title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aanbieder</FormLabel>
                <FormControl>
                  <Input placeholder="Twinfield" {...field} data-testid="input-deal-provider" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-deal-category">
                      <SelectValue placeholder="Kies categorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGIO_DEAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschrijving</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Korte omschrijving van de deal en voorwaarden..."
                  {...field}
                  data-testid="input-deal-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Korting</FormLabel>
                <FormControl>
                  <Input placeholder="30% korting" {...field} data-testid="input-deal-discount" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} data-testid="input-deal-url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promoCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promocode (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="OPENREGIO30" {...field} value={field.value ?? ""} data-testid="input-deal-promo-code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geldig t/m (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="2026-12-31" {...field} value={field.value ?? ""} data-testid="input-deal-valid-until" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-deal-active"
                />
              </FormControl>
              <FormLabel className="!mt-0">Deal actief (zichtbaar voor leden)</FormLabel>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-save-deal">
            {isPending ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function RegiodealsAdminPage() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<RegioDeal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: deals, isLoading } = useQuery<RegioDeal[]>({
    queryKey: ["/api/regio-deals/all"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRegioDeal) =>
      apiRequest("POST", "/api/regio-deals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals"] });
      setShowCreate(false);
      toast({ title: "Deal aangemaakt" });
    },
    onError: () => toast({ title: "Fout", description: "Kon deal niet aanmaken.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertRegioDeal> }) =>
      apiRequest("PUT", `/api/regio-deals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals"] });
      setEditing(null);
      toast({ title: "Deal bijgewerkt" });
    },
    onError: () => toast({ title: "Fout", description: "Kon deal niet bijwerken.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/regio-deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regio-deals"] });
      setConfirmDelete(null);
      toast({ title: "Deal verwijderd" });
    },
    onError: () => toast({ title: "Fout", description: "Kon deal niet verwijderen.", variant: "destructive" }),
  });

  const toggleActive = (deal: RegioDeal) => {
    updateMutation.mutate({ id: deal.id, data: { isActive: !deal.isActive } });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-admin-regio-deals">Regio Deals beheer</h1>
          <p className="text-muted-foreground mt-1">Beheer exclusieve deals voor OpenRegio-leden.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} data-testid="button-new-deal">
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe deal
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Laden...</p>
      )}

      {!isLoading && (!deals || deals.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground" data-testid="text-no-deals">
            Nog geen deals aangemaakt. Klik op "Nieuwe deal" om te beginnen.
          </CardContent>
        </Card>
      )}

      {deals && deals.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                  data-testid={`row-deal-${deal.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm" data-testid={`text-deal-title-${deal.id}`}>
                        {deal.title}
                      </span>
                      <Badge variant="outline" className="text-xs">{deal.category}</Badge>
                      {!deal.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactief</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{deal.provider}</span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />{deal.discount}
                      </span>
                      {deal.validUntil && <span>t/m {deal.validUntil}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={deal.isActive}
                      onCheckedChange={() => toggleActive(deal)}
                      data-testid={`switch-active-${deal.id}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(deal)}
                      data-testid={`button-edit-${deal.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfirmDelete(deal.id)}
                      data-testid={`button-delete-${deal.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuwe deal toevoegen</DialogTitle>
          </DialogHeader>
          <DealForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deal bewerken</DialogTitle>
          </DialogHeader>
          {editing && (
            <DealForm
              defaultValues={editing}
              onSubmit={(data) => updateMutation.mutate({ id: editing.id, data })}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deal verwijderen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deze deal wordt definitief verwijderd en is niet meer zichtbaar voor leden.
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
