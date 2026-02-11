import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Mail, Download, Check, Copy, ChevronRight, ChevronLeft, Shield, AlertTriangle, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  { id: 1, title: "Gegevens", icon: FileText },
  { id: 2, title: "Brief", icon: Mail },
  { id: 3, title: "Export", icon: Download },
];

function generateLetter(data: {
  naam: string;
  adres: string;
  postcodeWoonplaats: string;
  bestuursorgaan: string;
  adresBestuursorgaan: string;
  onderwerp: string;
}): string {
  return `OPENREGIO \u2013 SIGNAALINSTRUMENT
(Juridische Positionering & Herleidbaarheid)

Afzender:
${data.naam}
${data.adres}
${data.postcodeWoonplaats}

Aan:
${data.bestuursorgaan}
${data.adresBestuursorgaan}

Betreft: Kennisgeving rechtmatigheidstoets en bevoegdheidscontrole

Geacht bestuur,

In verband met de beoordeling van ${data.onderwerp} wordt hierbij vastgelegd dat overheidsoptreden dient te berusten op een geldige wettelijke grondslag en herleidbaar moet zijn tot het bevoegde bestuursorgaan.

Besluitvorming en uitvoering dienen in ieder geval te voldoen aan:

\u2022 De wettelijke bevoegdheidsverdeling;
\u2022 Mandaatverlening conform artikel 10:1 e.v. Awb;
\u2022 Zorgvuldigheid en evenredigheid (art. 3:2 en 3:4 Awb);
\u2022 Juridische toerekening van handelingen aan het bevoegde bestuursorgaan.

Voor zover uitvoering plaatsvindt via mandaat of ondermandaat, dient dit te berusten op een geldende en kenbare mandaatregeling.

Deze brief strekt uitsluitend tot vastlegging dat de rechtmatigheid van bevoegdheid, mandaat en toerekening wordt beoordeeld.

Hoogachtend,


[Handtekening]
${data.naam}`;
}

export default function WooWizardPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const [naam, setNaam] = useState("");
  const [adres, setAdres] = useState("");
  const [postcodeWoonplaats, setPostcodeWoonplaats] = useState("");
  const [bestuursorgaan, setBestuursorgaan] = useState("");
  const [adresBestuursorgaan, setAdresBestuursorgaan] = useState("");
  const [onderwerp, setOnderwerp] = useState("");

  const [generatedLetter, setGeneratedLetter] = useState("");

  const handleGenerate = () => {
    if (!naam.trim() || !bestuursorgaan.trim() || !onderwerp.trim()) {
      toast({
        title: "Verplichte velden",
        description: "Vul minimaal je naam, het bestuursorgaan en het onderwerp in.",
        variant: "destructive",
      });
      return;
    }
    const letter = generateLetter({
      naam,
      adres,
      postcodeWoonplaats,
      bestuursorgaan,
      adresBestuursorgaan,
      onderwerp,
    });
    setGeneratedLetter(letter);
    setCurrentStep(2);
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
    a.download = `Signaalinstrument-${onderwerp.replace(/\s+/g, "-").slice(0, 30)}.txt`;
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
            <CardDescription>Log in om het Signaalinstrument te gebruiken.</CardDescription>
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

  const progress = (currentStep / 3) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Signaalinstrument</h1>
        <p className="text-muted-foreground">Juridische positionering & herleidbaarheid richting bestuursorganen</p>
      </div>

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

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Stap 1: Gegevens invullen
            </CardTitle>
            <CardDescription>
              Vul je eigen gegevens, het bestuursorgaan en het onderwerp in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Afzender</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Naam *</label>
                  <Input
                    placeholder="Je volledige naam"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    data-testid="input-naam"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Postadres</label>
                  <Input
                    placeholder="Straat en huisnummer"
                    value={adres}
                    onChange={(e) => setAdres(e.target.value)}
                    data-testid="input-adres"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Postcode en woonplaats</label>
                  <Input
                    placeholder="1234 AB Plaatsnaam"
                    value={postcodeWoonplaats}
                    onChange={(e) => setPostcodeWoonplaats(e.target.value)}
                    data-testid="input-postcode"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Bestuursorgaan</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Naam bestuursorgaan *</label>
                  <Input
                    placeholder="bijv. College van B&W Gemeente Amsterdam"
                    value={bestuursorgaan}
                    onChange={(e) => setBestuursorgaan(e.target.value)}
                    data-testid="input-bestuursorgaan"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Adres bestuursorgaan</label>
                  <Input
                    placeholder="Adres van het bestuursorgaan"
                    value={adresBestuursorgaan}
                    onChange={(e) => setAdresBestuursorgaan(e.target.value)}
                    data-testid="input-adres-bestuursorgaan"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Onderwerp</h3>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Onderwerp van de toets *</label>
                <Input
                  placeholder="bijv. de handhaving van bestemmingsplan X"
                  value={onderwerp}
                  onChange={(e) => setOnderwerp(e.target.value)}
                  data-testid="input-onderwerp"
                />
                <p className="text-xs text-muted-foreground">
                  Dit wordt ingevuld in de brief als het onderwerp waarop de rechtmatigheidstoets betrekking heeft
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleGenerate} data-testid="button-generate">
                Brief genereren
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Stap 2: Gegenereerde brief
            </CardTitle>
            <CardDescription>
              Controleer de brief en ga door naar export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed" data-testid="text-generated-letter">
                {generatedLetter}
              </pre>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Terug naar gegevens
              </Button>
              <Button onClick={() => setCurrentStep(3)} data-testid="button-next-export">
                Exporteren
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Stap 3: Export
              </CardTitle>
              <CardDescription>
                Download of kopieer je Signaalinstrument brief
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed max-h-80 overflow-y-auto" data-testid="text-export-letter">
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
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)} data-testid="button-back-brief">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Terug naar brief
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    setGeneratedLetter("");
                    setNaam("");
                    setAdres("");
                    setPostcodeWoonplaats("");
                    setBestuursorgaan("");
                    setAdresBestuursorgaan("");
                    setOnderwerp("");
                  }}
                  data-testid="button-new"
                >
                  Nieuw signaalinstrument
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Wat dit instrument doet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Zet het bestuursorgaan op scherp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Laat zien dat je bevoegdheidsstructuur kent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Creëert dossieropbouw</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Is herbruikbaar per onderwerp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Geen civielrechtelijke discussie</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  Wat het niet doet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>Geen verplichting tot reactie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>Geen termijn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>Geen rechtsmiddel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>Geen drukmiddel</span>
                  </li>
                </ul>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Strategische inzet</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">Voorafgaand aan Woo</Badge>
                    <Badge variant="secondary">Voorafgaand aan bezwaar</Badge>
                    <Badge variant="secondary">Als dossieropbouw</Badge>
                    <Badge variant="secondary">Signaal naar meerdere bestuursorganen</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
