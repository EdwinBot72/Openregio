import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { REGIONS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/query-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { 
  MapPin, 
  Store, 
  Handshake, 
  Users, 
  Plus, 
  Check, 
  Lock, 
  Unlock,
  ArrowRight,
  Euro,
  Clock,
  TrendingUp
} from "lucide-react";

interface BusinessCategory {
  id: string;
  slug: string;
  name: string;
}

interface SlotWithCategory {
  categoryId: string;
  categoryName: string;
  regionName: string;
  status: "open" | "reserved" | "active";
  userId: string | null;
  slotId: string | null;
}

interface MarketLead {
  id: string;
  title: string;
  description: string | null;
  regionName: string;
  categoryId: string | null;
  status: string;
  valueEstimateEur: number | null;
  createdByUserId: string;
  claimedByUserId: string | null;
  createdAt: string;
}

interface MarketDeal {
  id: string;
  leadId: string;
  regionName: string;
  supplierUserId: string;
  referrerUserId: string | null;
  status: string;
  amountEur: number | null;
  createdAt: string;
}

const leadFormSchema = z.object({
  title: z.string().min(5, "Titel moet minimaal 5 tekens zijn"),
  description: z.string().min(10, "Beschrijving moet minimaal 10 tekens zijn"),
  categoryId: z.string().min(1, "Selecteer een categorie"),
  regionName: z.string().min(1, "Selecteer een regio"),
  valueEstimateEur: z.number().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

function RegionCombobox({ 
  value, 
  onChange,
  testId 
}: { 
  value: string; 
  onChange: (value: string) => void;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRegions = useMemo(() => {
    if (!search) return REGIONS.slice(0, 50);
    const lower = search.toLowerCase();
    return REGIONS.filter(r => r.toLowerCase().includes(lower)).slice(0, 50);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="justify-between min-w-[200px]"
          data-testid={testId}
        >
          <MapPin className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{value || "Selecteer regio"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Zoek regio..." 
            value={search}
            onValueChange={setSearch}
            data-testid="input-region-search"
          />
          <CommandList>
            <CommandEmpty>Geen regio gevonden.</CommandEmpty>
            <CommandGroup>
              {filteredRegions.map((region) => (
                <CommandItem
                  key={region}
                  value={region}
                  onSelect={() => {
                    onChange(region);
                    setOpen(false);
                  }}
                  data-testid={`option-region-${region}`}
                >
                  {region}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function RegioMarkt() {
  const [selectedRegion, setSelectedRegion] = useState<string>("Amsterdam");
  const [activeTab, setActiveTab] = useState("slots");
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      regionName: selectedRegion,
      valueEstimateEur: undefined,
    },
  });

  const { data: categories = [] } = useQuery<BusinessCategory[]>({
    queryKey: ["/api/regiomarkt/categories"],
  });

  const { data: slots = [], isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useQuery<SlotWithCategory[]>({
    queryKey: ["/api/regiomarkt/slots", { search: { region: selectedRegion } }],
    enabled: !!selectedRegion,
  });

  const { data: mySlots = [] } = useQuery<SlotWithCategory[]>({
    queryKey: ["/api/regiomarkt/my-slots"],
  });

  const { data: leads = [], isLoading: leadsLoading, isError: leadsError, refetch: refetchLeads } = useQuery<MarketLead[]>({
    queryKey: ["/api/regiomarkt/leads", { search: { region: selectedRegion } }],
    enabled: !!selectedRegion,
  });

  const { data: myLeads = [] } = useQuery<MarketLead[]>({
    queryKey: ["/api/regiomarkt/my-leads"],
  });

  const { data: myDeals = [] } = useQuery<MarketDeal[]>({
    queryKey: ["/api/regiomarkt/my-deals"],
  });

  const claimSlotMutation = useMutation({
    mutationFn: async (data: { regionName: string; categoryId: string }) => {
      const res = await apiRequest("POST", "/api/regiomarkt/slots/claim", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Slot geclaimed!", description: "Je bent nu de exclusieve aanbieder in deze categorie." });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/my-slots"] });
    },
    onError: (error: any) => {
      toast({ title: "Kon slot niet claimen", description: error.message, variant: "destructive" });
    },
  });

  const releaseSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const res = await apiRequest("POST", "/api/regiomarkt/slots/release", { slotId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Slot vrijgegeven", description: "Andere ondernemers kunnen nu deze categorie claimen." });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/my-slots"] });
    },
    onError: (error: any) => {
      toast({ title: "Kon slot niet vrijgeven", description: error.message, variant: "destructive" });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const res = await apiRequest("POST", "/api/regiomarkt/leads", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead gedeeld!", description: "Je lead is zichtbaar voor andere ondernemers in de regio." });
      setShowNewLeadDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/my-leads"] });
    },
    onError: (error: any) => {
      toast({ title: "Kon lead niet aanmaken", description: error.message, variant: "destructive" });
    },
  });

  const claimLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/regiomarkt/leads/${leadId}/claim`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead geclaimed!", description: "Neem contact op met de klant." });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regiomarkt/my-leads"] });
    },
    onError: (error: any) => {
      toast({ title: "Kon lead niet claimen", description: error.message, variant: "destructive" });
    },
  });

  const handleClaimSlot = (categoryId: string) => {
    claimSlotMutation.mutate({ regionName: selectedRegion, categoryId });
  };

  const handleReleaseSlot = (slotId: string) => {
    releaseSlotMutation.mutate(slotId);
  };

  const handleSubmitLead = (data: LeadFormValues) => {
    createLeadMutation.mutate(data);
  };

  const openSlots = slots.filter(s => s.status === "open").length;
  const activeSlots = slots.filter(s => s.status === "active").length;
  const availableLeads = leads.filter(l => l.status === "new").length;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl" data-testid="regiomarkt-page">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">RegioMarkt</h1>
        <p className="text-muted-foreground">
          Exclusieve B2B marketplace voor Pro-leden. Claim een slot in jouw categorie en ontvang leads van collega-ondernemers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Mijn Slots</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-my-slots-count">{mySlots.length}</div>
            <p className="text-xs text-muted-foreground">actieve categorie-slots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Open Slots</CardTitle>
            <Unlock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-open-slots-count">{openSlots}</div>
            <p className="text-xs text-muted-foreground">beschikbaar in {selectedRegion}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Nieuwe Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-leads-count">{availableLeads}</div>
            <p className="text-xs text-muted-foreground">wachten op je</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Mijn Deals</CardTitle>
            <Handshake className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-deals-count">{myDeals.length}</div>
            <p className="text-xs text-muted-foreground">actieve deals</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Regio:</span>
          <RegionCombobox 
            value={selectedRegion} 
            onChange={setSelectedRegion}
            testId="select-region"
          />
        </div>

        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-lead">
              <Plus className="mr-2 h-4 w-4" />
              Lead Delen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Deel een Lead</DialogTitle>
              <DialogDescription>
                Deel een klant of project met collega-ondernemers in je netwerk.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitLead)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bijv. Website nodig voor bakkerij" 
                          {...field} 
                          data-testid="input-lead-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschrijving</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Beschrijf de vraag of het project..." 
                          {...field} 
                          data-testid="input-lead-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categorie</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lead-category">
                              <SelectValue placeholder="Kies categorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
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
                    name="regionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lead-region">
                              <SelectValue placeholder="Kies regio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGIONS.slice(0, 20).map(region => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
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
                  name="valueEstimateEur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geschatte waarde (optioneel)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            placeholder="500" 
                            className="pl-9"
                            {...field}
                            value={field.value || ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-lead-value"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createLeadMutation.isPending}
                    data-testid="button-submit-lead"
                  >
                    {createLeadMutation.isPending ? "Bezig..." : "Lead Delen"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="slots" data-testid="tab-slots">
            <Store className="mr-2 h-4 w-4" />
            Slots ({slots.length})
          </TabsTrigger>
          <TabsTrigger value="leads" data-testid="tab-leads">
            <Users className="mr-2 h-4 w-4" />
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="deals" data-testid="tab-deals">
            <Handshake className="mr-2 h-4 w-4" />
            Mijn Deals ({myDeals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          <QueryState
            isLoading={slotsLoading}
            isError={slotsError}
            isEmpty={slots.length === 0}
            emptyMessage="Geen slots gevonden voor deze regio"
            onRetry={() => refetchSlots()}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const isMySlot = mySlots.some(s => s.categoryId === slot.categoryId && s.regionName === slot.regionName);
                const isAvailable = slot.status === "open";
                
                return (
                  <Card 
                    key={`${slot.regionName}-${slot.categoryId}`}
                    className={isMySlot ? "border-primary" : ""}
                    data-testid={`card-slot-${slot.categoryId}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-lg">{slot.categoryName}</CardTitle>
                        <Badge variant={isAvailable ? "default" : isMySlot ? "secondary" : "outline"}>
                          {isMySlot ? "Jouw slot" : isAvailable ? "Beschikbaar" : "Bezet"}
                        </Badge>
                      </div>
                      <CardDescription>{slot.regionName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isMySlot && slot.slotId ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReleaseSlot(slot.slotId!)}
                          disabled={releaseSlotMutation.isPending}
                          data-testid={`button-release-${slot.categoryId}`}
                        >
                          <Unlock className="mr-2 h-4 w-4" />
                          Vrijgeven
                        </Button>
                      ) : isAvailable ? (
                        <Button 
                          size="sm"
                          onClick={() => handleClaimSlot(slot.categoryId)}
                          disabled={claimSlotMutation.isPending}
                          data-testid={`button-claim-${slot.categoryId}`}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Claimen
                        </Button>
                      ) : (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Lock className="mr-2 h-4 w-4" />
                          Geclaimd door andere ondernemer
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <QueryState
            isLoading={leadsLoading}
            isError={leadsError}
            isEmpty={leads.length === 0}
            emptyMessage="Nog geen leads in deze regio. Deel je eerste lead!"
            onRetry={() => refetchLeads()}
          >
            <div className="space-y-4">
              {leads.map((lead) => {
                const category = categories.find(c => c.id === lead.categoryId);
                const canClaim = lead.status === "new" && 
                  mySlots.some(s => s.regionName === lead.regionName && s.categoryId === lead.categoryId);
                
                return (
                  <Card key={lead.id} data-testid={`card-lead-${lead.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-lg">{lead.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {lead.valueEstimateEur && (
                            <Badge variant="outline">
                              <Euro className="mr-1 h-3 w-3" />
                              {lead.valueEstimateEur}
                            </Badge>
                          )}
                          <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                            {lead.status === "new" ? "Nieuw" : lead.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <MapPin className="h-3 w-3" />
                        {lead.regionName}
                        {category && (
                          <>
                            <span>•</span>
                            {category.name}
                          </>
                        )}
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: nl })}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lead.description && (
                        <p className="text-sm text-muted-foreground">{lead.description}</p>
                      )}
                      {lead.status === "new" && (
                        canClaim ? (
                          <Button 
                            size="sm"
                            onClick={() => claimLeadMutation.mutate(lead.id)}
                            disabled={claimLeadMutation.isPending}
                            data-testid={`button-claim-lead-${lead.id}`}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Lead Claimen
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Claim eerst een slot in de categorie "{category?.name}" om deze lead te kunnen claimen.
                          </p>
                        )
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {myDeals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Handshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nog geen deals</h3>
                <p className="text-sm text-muted-foreground">
                  Claim leads om deals te sluiten en je omzet te verhogen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myDeals.map((deal) => (
                <Card key={deal.id} data-testid={`card-deal-${deal.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg">Deal #{deal.id.slice(0, 8)}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {deal.amountEur && (
                          <Badge variant="outline">
                            <Euro className="mr-1 h-3 w-3" />
                            {deal.amountEur}
                          </Badge>
                        )}
                        <Badge variant={deal.status === "won" ? "default" : "secondary"}>
                          {deal.status === "in_progress" ? "In behandeling" : deal.status === "won" ? "Gewonnen" : "Verloren"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <MapPin className="h-3 w-3" />
                      {deal.regionName}
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true, locale: nl })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {deal.referrerUserId ? "Ontvangen via een collega" : "Direct geclaimed"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
