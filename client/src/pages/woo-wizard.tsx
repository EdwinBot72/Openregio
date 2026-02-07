import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, FileText, List, Mail, Download, Check, Copy, ChevronRight, ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface ExtractedData {
  datum: string;
  zaaknummer: string;
  onderwerp: string;
  afdeling: string;
  kernfeiten: string[];
  beleidsbotsing: string;
}

interface DocumentCategory {
  category: string;
  documents: string[];
}

interface WooDossier {
  id: number;
  authority: string;
  subject: string;
  status: string;
  extractedData?: ExtractedData;
  documentList?: DocumentCategory[];
  generatedLetter?: string;
}

const PURPOSES = [
  { value: "bezwaar", label: "Bezwaar tegen besluit" },
  { value: "onderzoek", label: "Onderzoek / Feitenonderzoek" },
  { value: "journalistiek", label: "Journalistiek / Publicatie" },
  { value: "persoonlijk", label: "Persoonlijk belang" },
];

const STEPS = [
  { id: 1, title: "Intake", icon: Upload },
  { id: 2, title: "Analyse", icon: FileText },
  { id: 3, title: "Vraagset", icon: List },
  { id: 4, title: "Brief", icon: Mail },
  { id: 5, title: "Export", icon: Download },
];

export default function WooWizardPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [dossierId, setDossierId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Step 1: Intake state
  const [authority, setAuthority] = useState("");
  const [subject, setSubject] = useState("");
  const [uploadedDocument, setUploadedDocument] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [userQuestion, setUserQuestion] = useState("");

  // Step 2-5: Results state
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [documentList, setDocumentList] = useState<DocumentCategory[]>([]);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const { data: authorities = [] } = useQuery<{ id: number; name: string; slug: string }[]>({
    queryKey: ["/api/woo/authorities"],
  });

  // Step 1: Create intake dossier
  const intakeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/woo/wizard/intake", {
        authority,
        subject,
        uploadedDocument: uploadedDocument || null,
        location: location || null,
        purpose: purpose || null,
        userQuestion: userQuestion || null,
      });
      return res.json() as Promise<WooDossier>;
    },
    onSuccess: (data) => {
      setDossierId(data.id);
      if (uploadedDocument) {
        setCurrentStep(2);
        // Pass the new dossier ID directly to avoid stale state
        extractMutation.mutate({ newDossierId: data.id });
      } else {
        setCurrentStep(3);
        questionsMutation.mutate({ newDossierId: data.id, newExtractedData: null });
      }
    },
    onError: (err: any) => {
      toast({ title: "Fout", description: err?.message || "Intake mislukt", variant: "destructive" });
    },
  });

  // Step 2: Extract data
  const extractMutation = useMutation({
    mutationFn: async ({ newDossierId }: { newDossierId?: number } = {}) => {
      const id = newDossierId || dossierId;
      if (!id) throw new Error("Geen dossier ID");
      const res = await apiRequest("POST", "/api/woo/wizard/extract", {
        dossierId: id,
        documentText: uploadedDocument,
      });
      return res.json() as Promise<{ success: boolean; extractedData: ExtractedData }>;
    },
    onSuccess: (data) => {
      setExtractedData(data.extractedData);
      setCurrentStep(3);
    },
    onError: (err: any) => {
      toast({ title: "Analyse mislukt", description: err?.message, variant: "destructive" });
    },
  });

  // Step 3: Generate questions
  const questionsMutation = useMutation({
    mutationFn: async ({ newDossierId, newExtractedData }: { newDossierId?: number; newExtractedData?: ExtractedData | null } = {}) => {
      const id = newDossierId || dossierId;
      if (!id) throw new Error("Geen dossier ID");
      const res = await apiRequest("POST", "/api/woo/wizard/questions", {
        dossierId: id,
        extractedData: newExtractedData !== undefined ? newExtractedData : extractedData,
        purpose,
        userQuestion,
      });
      return res.json() as Promise<{ success: boolean; documentList: DocumentCategory[] }>;
    },
    onSuccess: (data) => {
      setDocumentList(data.documentList);
      setCurrentStep(4);
    },
    onError: (err: any) => {
      toast({ title: "Vraagset mislukt", description: err?.message, variant: "destructive" });
    },
  });

  // Step 4: Generate letter
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/woo/wizard/generate", {
        dossierId,
        authority,
        subject,
        extractedData,
        documentList,
        location,
      });
      return res.json() as Promise<{ success: boolean; letter: string }>;
    },
    onSuccess: (data) => {
      setGeneratedLetter(data.letter);
      setCurrentStep(5);
    },
    onError: (err: any) => {
      toast({ title: "Brief genereren mislukt", description: err?.message, variant: "destructive" });
    },
  });

  const handleIntakeSubmit = () => {
    if (!user) {
      toast({ title: "Log in om te analyseren", description: "Zonder account kan ik geen dossier opslaan.", variant: "destructive" });
      return;
    }
    if (!authority.trim() || !subject.trim()) {
      toast({ title: "Velden verplicht", description: "Vul minimaal bestuursorgaan en onderwerp in.", variant: "destructive" });
      return;
    }
    if (uploadedDocument && uploadedDocument.trim().length < 200) {
      toast({ title: "Te weinig tekst", description: "Plak minimaal ~200 tekens documenttekst, of laat het veld leeg.", variant: "destructive" });
      return;
    }
    intakeMutation.mutate();
  };

  const handleNextFromExtract = () => {
    questionsMutation.mutate({ newExtractedData: extractedData });
  };

  const handleNextFromQuestions = () => {
    generateMutation.mutate();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      toast({ title: "Gekopieerd", description: "Brief gekopieerd naar klembord." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Kopiëren mislukt", variant: "destructive" });
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WOO-verzoek-${subject.replace(/\s+/g, "-").slice(0, 30)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const data = {
      authority,
      subject,
      location,
      purpose,
      userQuestion,
      extractedData,
      documentList,
      generatedLetter,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WOO-dossier-${subject.replace(/\s+/g, "-").slice(0, 30)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Inloggen vereist</CardTitle>
            <CardDescription>Log in om de WOO Wizard te gebruiken.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button data-testid="button-login">Inloggen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = intakeMutation.isPending || extractMutation.isPending || questionsMutation.isPending || generateMutation.isPending;
  const progress = (currentStep / 5) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WOO Wizard</h1>
        <p className="text-muted-foreground">Stap voor stap een professioneel WOO-verzoek opstellen</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-1 ${
                step.id <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Intake */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Stap 1: Intake
            </CardTitle>
            <CardDescription>
              Vul de basisgegevens in en upload eventueel een beschikking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bestuursorgaan *</label>
                <Select value={authority} onValueChange={setAuthority}>
                  <SelectTrigger data-testid="select-authority">
                    <SelectValue placeholder="Selecteer bestuursorgaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {authorities.map((auth) => (
                      <SelectItem key={auth.id} value={auth.name}>
                        {auth.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="anders">Anders (handmatig invoeren)</SelectItem>
                  </SelectContent>
                </Select>
                {authority === "anders" && (
                  <Input
                    placeholder="Naam bestuursorgaan"
                    value=""
                    onChange={(e) => setAuthority(e.target.value)}
                    data-testid="input-authority-custom"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gemeente/Locatie</label>
                <Input
                  placeholder="bijv. Amsterdam"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Onderwerp *</label>
              <Input
                placeholder="Kort onderwerp van je verzoek"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-testid="input-subject"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Doel van het verzoek</label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger data-testid="select-purpose">
                  <SelectValue placeholder="Selecteer doel" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beschikking/Besluit (optioneel)</label>
              <Textarea
                placeholder="Plak hier de tekst van de beschikking of besluit..."
                value={uploadedDocument}
                onChange={(e) => setUploadedDocument(e.target.value)}
                rows={6}
                data-testid="textarea-document"
              />
              <p className="text-xs text-muted-foreground">
                Upload de tekst van een beschikking voor automatische analyse
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Wat wil je weten?</label>
              <Textarea
                placeholder="Beschrijf specifiek welke informatie je zoekt..."
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                rows={3}
                data-testid="textarea-question"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleIntakeSubmit}
                disabled={isLoading}
                data-testid="button-next-intake"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Volgende
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Extract */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Stap 2: Analyse
            </CardTitle>
            <CardDescription>
              AI analyseert de beschikking en haalt belangrijke informatie eruit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Beschikking wordt geanalyseerd...</p>
              </div>
            ) : extractedData ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Datum</p>
                    <p className="font-medium">{extractedData.datum}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Zaaknummer</p>
                    <p className="font-medium">{extractedData.zaaknummer}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Onderwerp</p>
                    <p className="font-medium">{extractedData.onderwerp}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Afdeling</p>
                    <p className="font-medium">{extractedData.afdeling}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Kernfeiten</p>
                  <ul className="list-disc list-inside space-y-1">
                    {extractedData.kernfeiten.map((feit, i) => (
                      <li key={i}>{feit}</li>
                    ))}
                  </ul>
                </div>

                {extractedData.beleidsbotsing && extractedData.beleidsbotsing !== "Niet gevonden" && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-muted-foreground mb-1">Mogelijke beleidsbotsing</p>
                    <p>{extractedData.beleidsbotsing}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} data-testid="button-back">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Terug
                  </Button>
                  <Button onClick={handleNextFromExtract} disabled={isLoading} data-testid="button-next-extract">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Volgende
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Questions */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Stap 3: Vraagset
            </CardTitle>
            <CardDescription>
              AI genereert een gerichte documentenlijst voor je WOO-verzoek
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionsMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Documentenlijst wordt gegenereerd...</p>
              </div>
            ) : documentList.length > 0 ? (
              <div className="space-y-4">
                {documentList.map((cat, i) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">{cat.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.documents.map((doc, j) => (
                        <Badge key={j} variant="secondary">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(uploadedDocument ? 2 : 1)} data-testid="button-back">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Terug
                  </Button>
                  <Button onClick={handleNextFromQuestions} disabled={isLoading} data-testid="button-next-questions">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Brief genereren
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Vraagset wordt voorbereid...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generate Letter */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Stap 4: Brief
            </CardTitle>
            <CardDescription>
              AI schrijft een volledig WOO-verzoek
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">WOO-verzoek wordt opgesteld...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Export */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Stap 5: Export
            </CardTitle>
            <CardDescription>
              Download je WOO-verzoek in verschillende formaten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Gegenereerd WOO-verzoek</h4>
              <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                {generatedLetter}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={copyToClipboard} variant="outline" data-testid="button-copy">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Gekopieerd!" : "Kopiëren"}
              </Button>
              <Button onClick={downloadTxt} variant="outline" data-testid="button-download-txt">
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
              <Button onClick={downloadJson} variant="outline" data-testid="button-download-json">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Checklist</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Controleer alle gegevens op juistheid
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Voeg eventuele bijlagen toe
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Verstuur per e-mail of aangetekende post
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Zet herinnering voor 4 weken (reactietermijn)
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)} data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
              <Link href="/woo-bot">
                <Button variant="outline" data-testid="button-new-request">
                  Nieuw verzoek
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
