import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, FileText, ExternalLink, AlertCircle, Copy, Download, Check, Save, Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

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

interface GeneratedLetter {
  letter: string;
  checklist: string[];
  fullContent: string;
  metadata: {
    authority: string;
    subject: string;
    generatedAt: string;
  };
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
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [response, setResponse] = useState<RegioBotResponse | null>(null);

  // Generator state
  const [genAuthority, setGenAuthority] = useState("");
  const [genSubject, setGenSubject] = useState("");
  const [genContext, setGenContext] = useState("");
  const [genDocuments, setGenDocuments] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [copied, setCopied] = useState(false);

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
        regionSlug: selectedRegion === "all" ? undefined : selectedRegion || undefined,
        authoritySlug: selectedAuthority === "all" ? undefined : selectedAuthority || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 6,
      };
      const res = await apiRequest("POST", "/api/regiobot", payload);
      return res.json() as Promise<RegioBotResponse>;
    },
    onSuccess: (data) => {
      setResponse(data);
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/woo/generate", {
        authority: genAuthority,
        subject: genSubject,
        context: genContext || undefined,
        requestedDocuments: genDocuments || undefined,
      });
      return res.json() as Promise<GeneratedLetter>;
    },
    onSuccess: (data) => {
      setGeneratedLetter(data);
      toast({
        title: "Brief gegenereerd",
        description: "Je WOO-verzoek is klaar om te versturen.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij genereren",
        description: error?.message || "Probeer het opnieuw",
        variant: "destructive",
      });
    },
  });

  const saveDossierMutation = useMutation({
    mutationFn: async () => {
      if (!generatedLetter) throw new Error("Geen brief om op te slaan");
      const res = await apiRequest("POST", "/api/woo/dossiers", {
        authority: genAuthority,
        subject: genSubject,
        context: genContext || null,
        requestedDocuments: genDocuments || null,
        generatedLetter: generatedLetter.fullContent,
        checklist: JSON.stringify(generatedLetter.checklist),
        status: "draft",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/woo/dossiers"] });
      toast({
        title: "Opgeslagen",
        description: "Brief opgeslagen in je dossiers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij opslaan",
        description: error?.message || "Probeer het opnieuw",
        variant: "destructive",
      });
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

  const handleGenerate = () => {
    if (!genAuthority.trim() || !genSubject.trim()) {
      toast({
        title: "Velden verplicht",
        description: "Vul minimaal het bestuursorgaan en onderwerp in.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const copyToClipboard = async () => {
    if (!generatedLetter) return;
    try {
      await navigator.clipboard.writeText(generatedLetter.fullContent);
      setCopied(true);
      toast({
        title: "Gekopieerd",
        description: "Brief gekopieerd naar klembord.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Kopiëren mislukt",
        description: "Probeer handmatig te selecteren en kopiëren.",
        variant: "destructive",
      });
    }
  };

  const downloadTxt = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter.fullContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WOO-verzoek-${genSubject.replace(/\s+/g, "-").slice(0, 30)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Gedownload",
      description: "Tekstbestand opgeslagen.",
    });
  };

  const isPro = user?.plan === "pro" || user?.plan === "coaching" || user?.role === "admin" || user?.role === "master";

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4" data-testid="page-woo-bot-login">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Inloggen vereist</h1>
        <p className="text-muted-foreground">Log in of maak een account aan om de regelgeving-assistent te gebruiken.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild><Link href="/login">Inloggen</Link></Button>
          <Button variant="outline" asChild><Link href="/register">Registreren</Link></Button>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4" data-testid="page-woo-bot-gate">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Pro-functie</h1>
        <p className="text-muted-foreground">
          De regelgeving-assistent en WOO-brievengenerator zijn beschikbaar voor Pro-leden en hoger.
        </p>
        <Button asChild><Link href="/lidmaatschap?plan=pro">Upgrade naar Pro — €59/mnd</Link></Button>
        <p className="text-xs text-muted-foreground">excl. btw · maandelijks opzegbaar</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-woo-bot">Regelgeving-assistent</h1>
        <p className="text-muted-foreground">
          Zoek in overheidsdocumenten of genereer een verzoekbrief.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" data-testid="tab-generate">
            Brief Genereren
          </TabsTrigger>
          <TabsTrigger value="search" data-testid="tab-search">
            Documenten Zoeken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WOO-verzoek Genereren</CardTitle>
              <CardDescription>
                Vul de gegevens in en ontvang een kant-en-klare brief voor je WOO-verzoek
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bestuursorgaan *</label>
                <Input
                  placeholder="Bijv: Gemeente Amsterdam, Provincie Utrecht, Belastingdienst"
                  value={genAuthority}
                  onChange={(e) => setGenAuthority(e.target.value)}
                  data-testid="input-gen-authority"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Onderwerp van je verzoek *</label>
                <Input
                  placeholder="Bijv: Besluitvorming rond bouwvergunning Hoofdstraat 10"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  data-testid="input-gen-subject"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Context (optioneel)</label>
                <Textarea
                  placeholder="Geef achtergrondinformatie: waarom doe je dit verzoek? Welke gebeurtenissen zijn relevant?"
                  value={genContext}
                  onChange={(e) => setGenContext(e.target.value)}
                  rows={3}
                  data-testid="input-gen-context"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specifieke documenten (optioneel)</label>
                <Textarea
                  placeholder="Welke documenten zoek je specifiek? Bijv: notulen vergadering dd. 15-3-2024, correspondentie met aannemer XYZ"
                  value={genDocuments}
                  onChange={(e) => setGenDocuments(e.target.value)}
                  rows={2}
                  data-testid="input-gen-documents"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!genAuthority.trim() || !genSubject.trim() || generateMutation.isPending}
                className="w-full"
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Brief wordt gegenereerd...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Genereer WOO-brief
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generateMutation.isError && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Er ging iets mis</p>
                    <p className="text-sm">
                      {(generateMutation.error as any)?.message || "Probeer het opnieuw"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedLetter && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
                  <div>
                    <CardTitle>Je WOO-brief</CardTitle>
                    <CardDescription>
                      Klaar om te versturen naar {generatedLetter.metadata.authority}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      data-testid="button-copy"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">{copied ? "Gekopieerd" : "Kopiëren"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadTxt}
                      data-testid="button-download"
                    >
                      <Download className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Download .txt</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => saveDossierMutation.mutate()}
                      disabled={saveDossierMutation.isPending}
                      data-testid="button-save-dossier"
                    >
                      {saveDossierMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Opslaan</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {generatedLetter.letter}
                  </div>
                </CardContent>
              </Card>

              {generatedLetter.checklist.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Checklist voor verzending</CardTitle>
                    <CardDescription>
                      Controleer deze punten voordat je de brief verstuurt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedLetter.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded border flex items-center justify-center mt-0.5 shrink-0">
                            <Check className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
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
                      <SelectItem value="all">Alle regio's</SelectItem>
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
                      <SelectItem value="all">Alle bestuursorganen</SelectItem>
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
            <Card className="border-destructive">
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
              <Card>
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
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Belangrijk
        </h3>
        <p className="text-sm text-muted-foreground">
          RegioBot geeft analyse op basis van WOO-bronnen, geen juridisch advies. 
          Gegenereerde brieven zijn startpunten die je zelf moet controleren en aanpassen.
        </p>
      </div>
    </div>
  );
}
