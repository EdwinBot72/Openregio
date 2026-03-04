import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Plus, Trash2, ExternalLink, Filter, Info, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const REGIONS = [
  "Noord-Holland",
  "Zuid-Holland",
  "Utrecht",
  "Gelderland",
  "Noord-Brabant",
  "Limburg",
  "Overijssel",
  "Flevoland",
  "Friesland",
  "Groningen",
  "Drenthe",
  "Zeeland",
];

interface MonitorItem {
  id: string;
  region: string;
  title: string;
  summary: string;
  sourceUrl: string | null;
  tags: string | null;
  createdAt: string;
  createdByUserId: string | null;
}

export default function BeleidsmonitorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>("alle");
  const [showForm, setShowForm] = useState(false);
  const [formRegion, setFormRegion] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formTags, setFormTags] = useState("");

  const isAdmin = user?.isAdmin || false;

  const regionParam = selectedRegion !== "alle" ? selectedRegion : undefined;
  const queryKey = regionParam
    ? ["/api/monitor-items", { search: { region: regionParam } }]
    : ["/api/monitor-items"];
  const { data: items, isLoading: itemsLoading } = useQuery<MonitorItem[]>({
    queryKey,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { region: string; title: string; summary: string; sourceUrl: string; tags: string }) => {
      return apiRequest("POST", "/api/monitor-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitor-items"] });
      toast({ title: "Item toegevoegd", description: "Beleidsupdate is succesvol toegevoegd." });
      setShowForm(false);
      setFormRegion("");
      setFormTitle("");
      setFormSummary("");
      setFormSourceUrl("");
      setFormTags("");
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon item niet toevoegen.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/monitor-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitor-items"] });
      toast({ title: "Verwijderd", description: "Item is verwijderd." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon item niet verwijderen.", variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Log in om de Beleidsmonitor te bekijken.</p>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Uitleg */}
      <Card className="border-l-0 border-r-0 border-t-0 rounded-none border-b bg-muted/30 -mx-4 px-4 py-4 shadow-none">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Wat is de Regelmonitor?</p>
              <p className="text-sm text-muted-foreground">
                Een actueel overzicht van beleids- en regelgevingswijzigingen die relevant zijn voor ondernemers in jouw regio.
                OpenRegio-beheerders plaatsen updates zodra er iets wijzigt in wet- en regelgeving, gemeentelijk beleid of subsidieregels.
              </p>
              <p className="text-sm text-muted-foreground">
                Filter op regio om alleen updates te zien die op jou van toepassing zijn. Klik op de bronlink om het officiële document te lezen.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-8">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Nieuwe items verschijnen zodra wetgeving of gemeentelijk beleid wijzigt.</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <Activity className="h-8 w-8 text-[#1f5fae]" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-beleidsmonitor-title">Beleidsmonitor</h1>
          <p className="text-muted-foreground text-sm">Regionaal beleid en ontwikkelingen op een rij</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            data-testid="button-add-monitor-item"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuw item
          </Button>
        )}
      </div>

      {isAdmin && showForm && (
        <Card data-testid="card-monitor-form">
          <CardHeader>
            <CardTitle className="text-lg">Nieuwe beleidsupdate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Regio</label>
              <Select value={formRegion} onValueChange={setFormRegion}>
                <SelectTrigger data-testid="select-form-region">
                  <SelectValue placeholder="Selecteer regio" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Titel</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titel van de beleidsupdate"
                data-testid="input-form-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Samenvatting</label>
              <Textarea
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="Korte samenvatting van het beleid of de ontwikkeling"
                rows={4}
                data-testid="input-form-summary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Bronlink (optioneel)</label>
              <Input
                value={formSourceUrl}
                onChange={(e) => setFormSourceUrl(e.target.value)}
                placeholder="https://..."
                data-testid="input-form-source-url"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Tags (optioneel, komma-gescheiden)</label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="vergunning, omgevingsplan, subsidie"
                data-testid="input-form-tags"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  if (!formRegion || !formTitle || !formSummary) {
                    toast({ title: "Vul verplichte velden in", variant: "destructive" });
                    return;
                  }
                  createMutation.mutate({ region: formRegion, title: formTitle, summary: formSummary, sourceUrl: formSourceUrl, tags: formTags });
                }}
                disabled={createMutation.isPending}
                data-testid="button-submit-monitor-item"
              >
                {createMutation.isPending ? "Bezig..." : "Toevoegen"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-monitor-item">
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[220px]" data-testid="select-filter-region">
            <SelectValue placeholder="Filter op regio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle regio's</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {itemsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !items || items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {selectedRegion !== "alle"
              ? `Geen beleidsupdates gevonden voor ${selectedRegion}.`
              : "Nog geen beleidsupdates beschikbaar."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} data-testid={`card-monitor-item-${item.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" data-testid={`badge-region-${item.id}`}>{item.region}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1" data-testid={`text-title-${item.id}`}>{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-summary-${item.id}`}>{item.summary}</p>
                    {item.tags && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {item.tags.split(",").map((tag, i) => {
                          const trimmed = tag.trim();
                          return trimmed ? (
                            <Badge key={i} variant="outline" className="text-xs">{trimmed}</Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#1f5fae] mt-2 hover:underline"
                        data-testid={`link-source-${item.id}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Bron bekijken
                      </a>
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
