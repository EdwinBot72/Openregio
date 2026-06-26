import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Gavel, FileText, ExternalLink, ChevronRight,
  Loader2, Copy, RotateCcw, Sparkles, AlertTriangle,
  BookOpen, Calendar, Building2, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type RegelgevingItem = {
  id: string;
  title: string;
  date: string | null;
  url: string | null;
  type: string | null;
  subjects: string[];
  creator: string | null;
};

type WooConcept = {
  aanhef: string;
  brief: string;
  aanbevolenDocumenten: string[];
  juridischeGrondslag: string;
};

const CATEGORIEEN = [
  { value: "alle", label: "Alle typen" },
  { value: "verordening", label: "Verordeningen" },
  { value: "beleidsregel", label: "Beleidsregels" },
  { value: "besluit", label: "Besluiten" },
  { value: "regeling", label: "Regelingen" },
];

const SNELLE_ZOEKOPDRACHTEN = [
  "reclamebeleid gemeente",
  "terrasvergunning horeca",
  "parkeerbeleid binnenstad",
  "evenementenvergunning",
  "subsidie ondernemers",
  "handhaving APV",
];

export default function RegelgevingVerkennerPage() {
  usePageTitle("Wetgeving & Regelgeving");
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.plan === "pro" || user?.plan === "coaching" || user?.role === "admin" || user?.role === "master";

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [categorie, setCategorie] = useState("alle");
  const [selectedItem, setSelectedItem] = useState<RegelgevingItem | null>(null);
  const [wooConcept, setWooConcept] = useState<WooConcept | null>(null);
  const [showConcept, setShowConcept] = useState(false);

  const { data, isLoading, isError } = useQuery<{
    query: string; categorie: string; total: number; count: number; items: RegelgevingItem[];
  }>({
    queryKey: ["/api/regelgeving-verkenner", activeQuery, categorie],
    enabled: !!activeQuery,
    queryFn: () =>
      fetch(`/api/regelgeving-verkenner?query=${encodeURIComponent(activeQuery)}&categorie=${categorie}&limit=20`, {
        credentials: "include",
      }).then(r => {
        if (!r.ok) throw new Error("Ophalen mislukt");
        return r.json();
      }),
  });

  const wooConcMutation = useMutation({
    mutationFn: (item: RegelgevingItem) =>
      apiRequest("POST", "/api/regelgeving-verkenner/woo-concept", {
        title: item.title,
        onderwerp: item.subjects.join(", ") || item.title,
        creator: item.creator,
        url: item.url,
      }),
    onSuccess: (data: any) => {
      setWooConcept(data as WooConcept);
      setShowConcept(true);
    },
    onError: () => {
      toast({ title: "Mislukt", description: "Kon geen concept genereren. Probeer het opnieuw.", variant: "destructive" });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setActiveQuery(query.trim());
    setSelectedItem(null);
    setWooConcept(null);
    setShowConcept(false);
  };

  const copyBrief = () => {
    if (!wooConcept) return;
    navigator.clipboard.writeText(wooConcept.brief);
    toast({ title: "Brief gekopieerd", description: "Plak de brief in je tekstverwerker." });
  };

  const formatDate = (d: string | null) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Search style={{ width: 24, height: 24, color: "#6d28d9" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Regelgeving Verkenner</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Doorzoek officiële verordeningen en beleidsregels door heel Nederland — genereer direct een Woo-verzoek.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="bijv. reclamebeleid Amsterdam, terrasvergunning Utrecht..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pl-9"
                data-testid="input-regelgeving-query"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white min-w-[100px]"
              data-testid="button-zoek-regelgeving"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-1.5" />Zoeken</>}
            </Button>
          </div>

          {/* Categorie filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Type:</span>
            {CATEGORIEEN.map(c => (
              <button
                key={c.value}
                onClick={() => setCategorie(c.value)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  categorie === c.value
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                data-testid={`filter-${c.value}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Snelle zoekopdrachten */}
          {!activeQuery && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Populaire zoekopdrachten:</p>
              <div className="flex flex-wrap gap-2">
                {SNELLE_ZOEKOPDRACHTEN.map(z => (
                  <button
                    key={z}
                    onClick={() => { setQuery(z); setActiveQuery(z); }}
                    className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                    data-testid={`quick-search-${z.replace(/\s/g, "-")}`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-6">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">
            Overheid.nl is tijdelijk niet bereikbaar. Probeer het later opnieuw.
          </p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4" data-testid="regelgeving-results">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{data.total.toLocaleString("nl-NL")}</span>{" "}
              resultaten voor "<span className="italic">{data.query}</span>"
              {data.categorie !== "alle" && ` — ${data.categorie}en`}
            </p>
            {data.count < data.total && (
              <span className="text-xs text-slate-400">Toont eerste {data.count}</span>
            )}
          </div>

          {data.items.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Geen resultaten gevonden. Probeer een andere zoekopdracht.</p>
            </div>
          )}

          {data.items.map((item, i) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? "ring-2 ring-orange-300" : ""}`}
              onClick={() => { setSelectedItem(selectedItem?.id === item.id ? null : item); setWooConcept(null); setShowConcept(false); }}
              data-testid={`regelgeving-item-${i}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {item.type && (
                        <Badge className="bg-orange-50 text-orange-700 text-xs">{item.type}</Badge>
                      )}
                      {item.date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{item.title}</h3>
                    {item.creator && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {item.creator}
                      </p>
                    )}
                    {item.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.subjects.map((s, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-300 flex-shrink-0 mt-1 transition-transform ${selectedItem?.id === item.id ? "rotate-90" : ""}`} />
                </div>

                {/* Expanded panel */}
                {selectedItem?.id === item.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          data-testid="link-officieel-document"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Officieel document bekijken
                        </a>
                      )}
                      {isPro ? (
                        <Button
                          size="sm"
                          onClick={() => wooConcMutation.mutate(item)}
                          disabled={wooConcMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-7"
                          data-testid="button-genereer-woo"
                        >
                          {wooConcMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1.5" />
                          )}
                          Woo-verzoek genereren
                        </Button>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-500 text-xs flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          Woo-verzoek genereren — Pro
                        </Badge>
                      )}
                    </div>

                    {/* WOO Concept */}
                    {showConcept && wooConcept && (
                      <div className="mt-3 p-4 bg-orange-50 rounded-xl border border-orange-100" data-testid="woo-concept">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">Woo-verzoek concept</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyBrief} className="text-xs h-7" data-testid="button-copy-brief">
                              <Copy className="w-3 h-3 mr-1.5" />Kopiëren
                            </Button>
                            <button onClick={() => setShowConcept(false)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-orange-700 font-medium mb-2">{wooConcept.aanhef}</div>
                        <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 border border-orange-100 max-h-64 overflow-y-auto">
                          {wooConcept.brief}
                        </pre>
                        {wooConcept.aanbevolenDocumenten?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-orange-700 mb-1.5">Vraag ook om:</p>
                            <ul className="space-y-1">
                              {wooConcept.aanbevolenDocumenten.map((d, j) => (
                                <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                                  <ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {wooConcept.juridischeGrondslag && (
                          <p className="mt-2 text-xs text-slate-500">
                            <span className="font-medium">Wettelijke basis:</span> {wooConcept.juridischeGrondslag}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!activeQuery && !data && (
        <div className="py-16 text-center text-slate-400">
          <Gavel className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium text-slate-500 mb-1">Zoek naar regelgeving door heel Nederland</p>
          <p className="text-xs text-slate-400">
            Gebruik verordeningen en beleidsregels als basis voor een Woo-verzoek
          </p>
        </div>
      )}
    </div>
  </div>
  );
}
