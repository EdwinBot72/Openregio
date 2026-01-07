import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Citation {
  sourceNo: number;
  source_type: string;
  request_id: number;
  document_id: number | null;
  region: string | null;
  authority: string | null;
  title: string | null;
  filename: string | null;
  file_url: string | null;
}

interface RegioBotResponse {
  answer: string;
  citations: Citation[];
}

interface Region {
  id: number;
  name: string;
  slug: string;
}

interface Authority {
  id: number;
  name: string;
  slug: string;
}

const AVAILABLE_TAGS = [
  { slug: "mandaat", label: "Mandaat" },
  { slug: "delegatie", label: "Delegatie" },
  { slug: "heffing", label: "Heffing" },
  { slug: "handhaving", label: "Handhaving" },
  { slug: "aanbesteding", label: "Aanbesteding" },
  { slug: "vergunning", label: "Vergunning" },
  { slug: "bezwaar", label: "Bezwaar" },
  { slug: "subsidie", label: "Subsidie" },
];

export default function WooBotPage() {
  const [question, setQuestion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [response, setResponse] = useState<RegioBotResponse | null>(null);

  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ["/api/woo/regions"],
  });

  const { data: authorities = [] } = useQuery<Authority[]>({
    queryKey: ["/api/woo/authorities"],
  });

  const askMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        question,
        regionSlug: selectedRegion || undefined,
        authoritySlug: selectedAuthority || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 6,
      };
      return apiRequest<RegioBotResponse>("/api/regiobot", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setResponse(data);
    },
  });

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = () => {
    if (question.trim().length < 3) return;
    askMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WOO RegioBot</h1>
        <p className="text-muted-foreground">
          Stel juridische vragen over WOO-verzoeken, besluiten en documenten. 
          RegioBot geeft feitelijke analyse op basis van bronnen.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Stel je vraag</CardTitle>
          <CardDescription>
            Selecteer optioneel een regio, bestuursorgaan en/of tags voor gerichtere resultaten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Regio</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger data-testid="select-region">
                  <SelectValue placeholder="Alle regio's" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle regio's</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.slug}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bestuursorgaan</label>
              <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                <SelectTrigger data-testid="select-authority">
                  <SelectValue placeholder="Alle bestuursorganen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle bestuursorganen</SelectItem>
                  {authorities.map((a) => (
                    <SelectItem key={a.id} value={a.slug}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags (optioneel)</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag.slug}
                  variant={selectedTags.includes(tag.slug) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.slug)}
                  data-testid={`tag-${tag.slug}`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Vraag</label>
            <Textarea
              placeholder="Bijv: Wie is bevoegd om mandaten te ondertekenen bij de gemeente?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              data-testid="input-question"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={question.trim().length < 3 || askMutation.isPending}
            className="w-full"
            data-testid="button-submit"
          >
            {askMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bezig met zoeken...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Vraag aan RegioBot
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {askMutation.isError && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Er ging iets mis</p>
                <p className="text-sm">
                  {(askMutation.error as any)?.message || "Probeer het opnieuw"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {response && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Antwoord</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {response.answer}
              </div>
            </CardContent>
          </Card>

          {response.citations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bronnen ({response.citations.length})</CardTitle>
                <CardDescription>
                  Gebruikte WOO-documenten en verzoeken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {response.citations.map((c) => (
                    <div
                      key={`${c.source_type}-${c.request_id}-${c.document_id}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">Bron {c.sourceNo}</span>
                          <Badge variant="secondary" className="text-xs">
                            {c.source_type}
                          </Badge>
                          {c.region && (
                            <Badge variant="outline" className="text-xs">
                              {c.region}
                            </Badge>
                          )}
                        </div>
                        {c.title && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {c.title}
                          </p>
                        )}
                        {c.filename && (
                          <p className="text-xs text-muted-foreground">
                            {c.filename}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Request ID: {c.request_id}
                          {c.document_id && ` | Document ID: ${c.document_id}`}
                        </div>
                      </div>
                      {c.file_url && (
                        <a
                          href={c.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Belangrijk
        </h3>
        <p className="text-sm text-muted-foreground">
          RegioBot geeft analyse op basis van WOO-bronnen, geen juridisch advies. 
          Output bevat: feitelijk antwoord, wat ontbreekt, vervolgvragen voor WOO, 
          en bronverwijzingen. Geen boete-fixes of procedures.
        </p>
      </div>
    </div>
  );
}
