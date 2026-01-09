import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, CheckSquare, Download, Copy, Mail, Bell, ChevronRight, ChevronLeft, Calendar, ClipboardCopy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface ExtractedData {
  zaaknummer?: string;
  datum?: string;
  boete?: string | null;
  locatie?: string | null;
  bestuursorgaan?: string;
  onderwerp?: string;
  themas?: string[];
  kernfeiten?: string[];
  beleidsconflictHypothese?: string | null;
}

interface DocumentCategory {
  category: string;
  documents: string[];
  priority?: string;
  rationale?: string;
}

interface GenerateResult {
  wooVerzoek?: {
    briefhoofd: string;
    onderwerpregel: string;
    inhoud: string;
    afsluiting: string;
  };
  inventarislijst?: Array<{
    categorie: string;
    documenten: string[];
    toelichting?: string | null;
  }>;
  ingebrekestelling?: { inhoud: string };
  bezwaarschrift?: { inhoud: string };
  checklist?: string[];
  letter?: string;
  metadata?: {
    gegenereerd: string;
    termijn: string;
    deadlineDatum: string;
  };
}

const PURPOSES = [
  { value: "bezwaar", label: "Bezwaar tegen besluit" },
  { value: "onderzoek", label: "Onderzoek / Feitenonderzoek" },
  { value: "journalistiek", label: "Journalistiek / Publicatie" },
  { value: "persoonlijk", label: "Persoonlijk belang" },
  { value: "controle", label: "Democratische controle" },
];

const DEFAULT_QUESTION_CATEGORIES = [
  { 
    id: "besluitvorming", 
    label: "Besluitvorming", 
    description: "Besluiten, concept-besluiten, adviezen",
    documents: ["Definitief besluit", "Concept-besluiten", "Interne adviezen", "Collegebesluiten"]
  },
  { 
    id: "beleid", 
    label: "Beleid", 
    description: "Beleidsnotities, richtlijnen, protocollen",
    documents: ["Beleidsnotities", "Richtlijnen", "Protocollen", "Werkinstructies"]
  },
  { 
    id: "grondslag", 
    label: "Wettelijke grondslag", 
    description: "Mandaatbesluiten, wettelijke basis",
    documents: ["Mandaatregister", "Wettelijke grondslag", "Bevoegdheidsbesluit"]
  },
  { 
    id: "contracten", 
    label: "Contracten & Financieel", 
    description: "Contracten, facturen, subsidies",
    documents: ["Contracten", "Facturen", "Offertes", "Subsidiebeschikkingen"]
  },
  { 
    id: "gelijkheid", 
    label: "Gelijkheidsinformatie", 
    description: "Vergelijkbare zaken, precedenten",
    documents: ["Vergelijkbare besluiten", "Precedenten", "Jurisprudentie-overzichten"]
  },
  { 
    id: "communicatie", 
    label: "Communicatie", 
    description: "E-mails, notities, vergaderverslagen",
    documents: ["E-mailcorrespondentie", "Gespreksnotities", "Vergaderverslagen", "Telefoonnotities"]
  },
];

const STEPS = [
  { id: 1, title: "Gegevens", icon: Upload, description: "Upload document & vul basisgegevens in" },
  { id: 2, title: "Documenten", icon: CheckSquare, description: "Selecteer welke documenten je wilt opvragen" },
  { id: 3, title: "Resultaat", icon: FileText, description: "Bekijk en download je WOO-verzoek" },
];

export default function WooWizardPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [dossierId, setDossierId] = useState<number | null>(null);

  // Step 1: Input state
  const [authority, setAuthority] = useState("");
  const [subject, setSubject] = useState("");
  const [uploadedDocument, setUploadedDocument] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");

  // Step 2: Selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["besluitvorming", "communicatie"]);

  // Step 3: Results
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: authorities = [] } = useQuery<{ id: number; name: string; slug: string }[]>({
    queryKey: ["/api/woo/authorities"],
  });

  // Create intake and extract if document present
  const intakeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/woo/wizard/intake", {
        authority,
        subject,
        uploadedDocument: uploadedDocument || null,
        location: location || null,
        purpose: purpose || null,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      setDossierId(data.id);
      
      // If document uploaded, extract data first
      if (uploadedDocument.trim()) {
        try {
          const extractRes = await apiRequest("POST", "/api/woo/wizard/extract", {
            dossierId: data.id,
            documentText: uploadedDocument,
          });
          const extractData = await extractRes.json();
          setExtractedData(extractData.extractedData);
        } catch {
          // Continue without extraction if it fails
        }
      }
      
      setCurrentStep(2);
    },
    onError: (err: any) => {
      toast({ title: "Fout", description: err?.message || "Kon niet opslaan", variant: "destructive" });
    },
  });

  // Generate letter
  const generateMutation = useMutation({
    mutationFn: async () => {
      const selectedQuestions = DEFAULT_QUESTION_CATEGORIES
        .filter(cat => selectedCategories.includes(cat.id))
        .map(cat => ({
          category: cat.label,
          documents: cat.documents,
        }));

      const res = await apiRequest("POST", "/api/woo/wizard/generate", {
        dossierId,
        authority,
        subject,
        extractedData,
        selectedQuestions,
        location,
      });
      return res.json() as Promise<GenerateResult>;
    },
    onSuccess: (data) => {
      setGenerateResult(data);
      setCurrentStep(3);
    },
    onError: (err: any) => {
      toast({ title: "Brief genereren mislukt", description: err?.message, variant: "destructive" });
    },
  });

  const handleStep1Submit = () => {
    if (!authority.trim() || !subject.trim()) {
      toast({ title: "Verplichte velden", description: "Vul bestuursorgaan en onderwerp in.", variant: "destructive" });
      return;
    }
    intakeMutation.mutate();
  };

  const handleStep2Submit = () => {
    if (selectedCategories.length === 0) {
      toast({ title: "Selectie vereist", description: "Selecteer minimaal één documentcategorie.", variant: "destructive" });
      return;
    }
    generateMutation.mutate();
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({ title: "Gekopieerd!", description: `${type} gekopieerd naar klembord` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: "Kopiëren mislukt", variant: "destructive" });
    }
  };

  const downloadTxt = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createEmailLink = () => {
    const letter = generateResult?.letter || "";
    const emailSubject = encodeURIComponent(`WOO-verzoek: ${subject}`);
    const emailBody = encodeURIComponent(letter);
    return `mailto:?subject=${emailSubject}&body=${emailBody}`;
  };

  const createCalendarReminder = () => {
    const deadline = generateResult?.metadata?.deadlineDatum || "";
    const title = encodeURIComponent(`WOO-termijn: ${subject}`);
    const details = encodeURIComponent(`Reactietermijn WOO-verzoek aan ${authority} verloopt.`);
    
    // Create Google Calendar link
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 28);
    const dateStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Inloggen vereist</CardTitle>
            <CardDescription>Log in om de WOO Wizard te gebruiken</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Inloggen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">WOO Wizard</h1>
        <p className="text-muted-foreground">Genereer een professioneel WOO-verzoek in 3 stappen</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.id 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Input */}
      {currentStep === 1 && (
        <Card data-testid="step-1-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Stap 1: Gegevens invoeren
            </CardTitle>
            <CardDescription>
              Upload of plak een beschikking en vul de basisgegevens in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authority selection */}
            <div className="space-y-2">
              <Label htmlFor="authority">Bestuursorgaan *</Label>
              <Select value={authority} onValueChange={setAuthority}>
                <SelectTrigger id="authority" data-testid="select-authority">
                  <SelectValue placeholder="Selecteer gemeente of overheid" />
                </SelectTrigger>
                <SelectContent>
                  {authorities.slice(0, 100).map((auth) => (
                    <SelectItem key={auth.id} value={auth.name}>
                      {auth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Onderwerp *</Label>
              <Input
                id="subject"
                data-testid="input-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Bijv. Omgevingsvergunning Kerkstraat 12"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Locatie / Adres</Label>
              <Input
                id="location"
                data-testid="input-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bijv. Kerkstraat 12, Amsterdam"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Doel van het verzoek</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose" data-testid="select-purpose">
                  <SelectValue placeholder="Waarom wil je deze informatie?" />
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

            {/* Document upload/paste */}
            <div className="space-y-2">
              <Label htmlFor="document">Beschikking (optioneel)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Plak de tekst van een beschikking om automatisch relevante gegevens te extraheren
              </p>
              <Textarea
                id="document"
                data-testid="textarea-document"
                value={uploadedDocument}
                onChange={(e) => setUploadedDocument(e.target.value)}
                placeholder="Plak hier de tekst van de beschikking..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleStep1Submit} 
                disabled={intakeMutation.isPending}
                data-testid="button-next-step-1"
                size="lg"
              >
                {intakeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verwerken...
                  </>
                ) : (
                  <>
                    Volgende
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select documents */}
      {currentStep === 2 && (
        <Card data-testid="step-2-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Stap 2: Documentcategorieën selecteren
            </CardTitle>
            <CardDescription>
              Selecteer welke documenten je wilt opvragen. Je kunt meerdere categorieën kiezen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Extracted data preview */}
            {extractedData && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Geëxtraheerde gegevens
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {extractedData.zaaknummer && (
                    <div><span className="text-muted-foreground">Zaaknr:</span> {extractedData.zaaknummer}</div>
                  )}
                  {extractedData.datum && (
                    <div><span className="text-muted-foreground">Datum:</span> {extractedData.datum}</div>
                  )}
                  {extractedData.themas && extractedData.themas.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Thema's:</span>{" "}
                      {extractedData.themas.map((t, i) => (
                        <Badge key={i} variant="secondary" className="mr-1 text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category checkboxes */}
            <div className="grid gap-3">
              {DEFAULT_QUESTION_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedCategories.includes(category.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleCategory(category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor={category.id} className="font-medium cursor-pointer">
                      {category.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {category.documents.slice(0, 3).map((doc, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{doc}</Badge>
                      ))}
                      {category.documents.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{category.documents.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)} data-testid="button-back-step-2">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Terug
              </Button>
              <Button 
                onClick={handleStep2Submit} 
                disabled={generateMutation.isPending || selectedCategories.length === 0}
                data-testid="button-next-step-2"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Brief genereren...
                  </>
                ) : (
                  <>
                    Genereer brief
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && generateResult && (
        <div className="space-y-6" data-testid="step-3-results">
          {/* Main letter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                WOO-verzoek
              </CardTitle>
              <CardDescription>
                Je WOO-verzoek is klaar. Kopieer of download het hieronder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generateResult.letter}
                </pre>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => copyToClipboard(generateResult.letter || "", "Brief")}
                  variant={copied === "Brief" ? "default" : "outline"}
                  data-testid="button-copy-letter"
                >
                  {copied === "Brief" ? <ClipboardCopy className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied === "Brief" ? "Gekopieerd!" : "Kopieer brief"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => downloadTxt(generateResult.letter || "", `WOO-verzoek-${subject.slice(0, 30)}.txt`)}
                  data-testid="button-download-txt"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download TXT
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  data-testid="button-email"
                >
                  <a href={createEmailLink()}>
                    <Mail className="mr-2 h-4 w-4" />
                    Open in e-mail
                  </a>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  data-testid="button-reminder"
                >
                  <a href={createCalendarReminder()} target="_blank" rel="noopener noreferrer">
                    <Bell className="mr-2 h-4 w-4" />
                    Maak reminder
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventarislijst */}
          {generateResult.inventarislijst && generateResult.inventarislijst.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventarislijst</CardTitle>
                <CardDescription>Overzicht van alle opgevraagde documenten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateResult.inventarislijst.map((item, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <h4 className="font-medium">{item.categorie}</h4>
                      <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                        {item.documenten.map((doc, j) => (
                          <li key={j}>{doc}</li>
                        ))}
                      </ul>
                      {item.toelichting && (
                        <p className="mt-2 text-xs text-muted-foreground italic">{item.toelichting}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up templates */}
          <div className="grid md:grid-cols-2 gap-4">
            {generateResult.ingebrekestelling && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ingebrekestelling</CardTitle>
                  <CardDescription className="text-xs">Voor als de termijn wordt overschreden</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(generateResult.ingebrekestelling?.inhoud || "", "Ingebrekestelling")}
                    data-testid="button-copy-ingebrekestelling"
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    {copied === "Ingebrekestelling" ? "Gekopieerd!" : "Kopieer template"}
                  </Button>
                </CardContent>
              </Card>
            )}
            {generateResult.bezwaarschrift && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Bezwaarschrift</CardTitle>
                  <CardDescription className="text-xs">Voor als het verzoek wordt afgewezen</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(generateResult.bezwaarschrift?.inhoud || "", "Bezwaarschrift")}
                    data-testid="button-copy-bezwaar"
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    {copied === "Bezwaarschrift" ? "Gekopieerd!" : "Kopieer template"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Checklist */}
          {generateResult.checklist && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generateResult.checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Checkbox id={`check-${i}`} />
                      <Label htmlFor={`check-${i}`} className="font-normal cursor-pointer">{item}</Label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Deadline info */}
          {generateResult.metadata && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm font-medium">
                Reactietermijn: <strong>{generateResult.metadata.termijn}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verwachte deadline: {generateResult.metadata.deadlineDatum}
              </p>
            </div>
          )}

          {/* Start new */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentStep(1);
                setDossierId(null);
                setAuthority("");
                setSubject("");
                setUploadedDocument("");
                setLocation("");
                setPurpose("");
                setSelectedCategories(["besluitvorming", "communicatie"]);
                setExtractedData(null);
                setGenerateResult(null);
              }}
              data-testid="button-new-request"
            >
              Nieuw verzoek starten
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
