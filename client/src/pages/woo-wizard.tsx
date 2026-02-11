import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Mail, Download, Check, Copy, ChevronRight, ChevronLeft, Shield, AlertTriangle, Target, Scale, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

type InstrumentType = "signaal" | "bevoegdheidsscan";

const STEPS = [
  { id: 1, title: "Gegevens", icon: FileText },
  { id: 2, title: "Brief", icon: Mail },
  { id: 3, title: "Export", icon: Download },
];

function generateSignaalLetter(data: {
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

function generateBevoegdheidsScanLetter(data: {
  naam: string;
  adres: string;
  postcodeWoonplaats: string;
  bestuursorgaan: string;
  adresBestuursorgaan: string;
  onderwerp: string;
  periode: string;
}): string {
  return `OPENREGIO \u2013 AFDWINGBAAR CONTROLEMIDDEL (WOO)

Afzender:
${data.naam}
${data.adres}
${data.postcodeWoonplaats}

Aan:
${data.bestuursorgaan}
${data.adresBestuursorgaan}

Betreft: Verzoek ex art. 3.1 Wet open overheid \u2013 bevoegdheids- en mandaatcontrole

Geacht bestuur,

Op grond van artikel 3.1 Wet open overheid verzoek ik om openbaarmaking van de onderstaande documenten, teneinde de juridische herleidbaarheid, bevoegdheid en toerekening van ${data.onderwerp} te kunnen vaststellen.

I. Bevoegdheidsgrondslag

Het formele besluit waaruit blijkt welk bestuursorgaan bevoegd is tot het nemen van het betreffende besluit.

De wettelijke bepaling(en) waarop deze bevoegdheid rust.

Publicatie van dit besluit (indien van toepassing).

II. Mandaat en ondermandaat (art. 10:1 e.v. Awb)

Het geldende mandaatbesluit.

Ondermandaatbesluiten (art. 10:5 Awb).

Functies en bevoegdheidsomschrijvingen van gemandateerde functionarissen.

Inwerkingtredingsdatum van deze mandaten.

III. Ondertekenings- en toerekeningsstructuur

De regeling waaruit blijkt wie bevoegd is tot ondertekening.

Documentatie waaruit blijkt hoe besluiten juridisch worden toegerekend aan het bevoegde bestuursorgaan.

Eventuele overeenkomsten met externe uitvoeringspartijen.

IV. Juridische advisering

Interne juridische adviezen inzake de bevoegdheids- en mandaatconstructie.

Periode: ${data.periode}

Ik verzoek u dit verzoek te behandelen conform de wettelijke termijn van artikel 4.4 Woo.

Indien (gedeeltelijke) weigering plaatsvindt, verzoek ik om een gemotiveerd besluit onder vermelding van de toepasselijke uitzonderingsgrond.

Hoogachtend,


[Handtekening]
${data.naam}`;
}

export default function WooWizardPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<InstrumentType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const [naam, setNaam] = useState("");
  const [adres, setAdres] = useState("");
  const [postcodeWoonplaats, setPostcodeWoonplaats] = useState("");
  const [bestuursorgaan, setBestuursorgaan] = useState("");
  const [adresBestuursorgaan, setAdresBestuursorgaan] = useState("");
  const [onderwerp, setOnderwerp] = useState("");
  const [periode, setPeriode] = useState("");

  const [generatedLetter, setGeneratedLetter] = useState("");

  const resetForm = () => {
    setCurrentStep(1);
    setGeneratedLetter("");
    setNaam("");
    setAdres("");
    setPostcodeWoonplaats("");
    setBestuursorgaan("");
    setAdresBestuursorgaan("");
    setOnderwerp("");
    setPeriode("");
  };

  const handleGenerate = () => {
    if (!naam.trim() || !bestuursorgaan.trim() || !onderwerp.trim()) {
      toast({
        title: "Verplichte velden",
        description: "Vul minimaal je naam, het bestuursorgaan en het onderwerp in.",
        variant: "destructive",
      });
      return;
    }
    if (selectedType === "bevoegdheidsscan" && !periode.trim()) {
      toast({
        title: "Verplicht veld",
        description: "Vul de periode in voor het Woo-verzoek.",
        variant: "destructive",
      });
      return;
    }

    const letter = selectedType === "bevoegdheidsscan"
      ? generateBevoegdheidsScanLetter({ naam, adres, postcodeWoonplaats, bestuursorgaan, adresBestuursorgaan, onderwerp, periode })
      : generateSignaalLetter({ naam, adres, postcodeWoonplaats, bestuursorgaan, adresBestuursorgaan, onderwerp });

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
    const prefix = selectedType === "bevoegdheidsscan" ? "BevoegdheidsScan" : "Signaalinstrument";
    a.download = `${prefix}-${onderwerp.replace(/\s+/g, "-").slice(0, 30)}.txt`;
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
            <CardDescription>Log in om de juridische instrumenten te gebruiken.</CardDescription>
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

  if (!selectedType) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Juridische Instrumenten</h1>
          <p className="text-muted-foreground">Kies het instrument dat past bij jouw situatie</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedType("signaal")} data-testid="card-signaalinstrument">
            <CardHeader className="gap-2">
              <div className="p-2.5 rounded-full bg-primary/10 w-fit">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Signaalinstrument</CardTitle>
              <CardDescription>
                Juridische kennisgeving die het bestuursorgaan op scherp zet over bevoegdheid en mandaat. Geen verplichting tot reactie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="secondary">Dossieropbouw</Badge>
                <Badge variant="secondary">Geen termijn</Badge>
                <Badge variant="secondary">Preventief</Badge>
              </div>
              <Button className="w-full" data-testid="button-select-signaal">
                Signaalinstrument kiezen
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedType("bevoegdheidsscan")} data-testid="card-bevoegdheidsscan">
            <CardHeader className="gap-2">
              <div className="p-2.5 rounded-full bg-destructive/10 w-fit">
                <Gavel className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">BevoegdheidsScan</CardTitle>
              <CardDescription>
                Formeel Woo-verzoek dat het bestuursorgaan verplicht te reageren. Afdwingbaar met termijn, ingebrekestelling en dwangsom.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="secondary">Woo-verzoek</Badge>
                <Badge variant="secondary">Beslisplicht</Badge>
                <Badge variant="secondary">Afdwingbaar</Badge>
              </div>
              <Button className="w-full" data-testid="button-select-bevoegdheidsscan">
                BevoegdheidsScan kiezen
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = (currentStep / 3) * 100;
  const instrumentLabel = selectedType === "bevoegdheidsscan" ? "BevoegdheidsScan" : "Signaalinstrument";
  const instrumentSubtitle = selectedType === "bevoegdheidsscan"
    ? "Afdwingbaar Woo-verzoek voor bevoegdheids- en mandaatcontrole"
    : "Juridische positionering & herleidbaarheid richting bestuursorganen";

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedType(null); resetForm(); }}
            data-testid="button-back-choose"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kies ander instrument
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">{instrumentLabel}</h1>
        <p className="text-muted-foreground">{instrumentSubtitle}</p>
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
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Onderwerp van de toets *</label>
                  <Input
                    placeholder="bijv. de handhaving van bestemmingsplan X"
                    value={onderwerp}
                    onChange={(e) => setOnderwerp(e.target.value)}
                    data-testid="input-onderwerp"
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedType === "bevoegdheidsscan"
                      ? "Dit wordt ingevuld in het Woo-verzoek als het onderwerp waarvoor documenten worden opgevraagd"
                      : "Dit wordt ingevuld in de brief als het onderwerp waarop de rechtmatigheidstoets betrekking heeft"}
                  </p>
                </div>

                {selectedType === "bevoegdheidsscan" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Periode *</label>
                    <Input
                      placeholder="bijv. 2020 tot heden"
                      value={periode}
                      onChange={(e) => setPeriode(e.target.value)}
                      data-testid="input-periode"
                    />
                    <p className="text-xs text-muted-foreground">
                      De periode waarover juridische adviezen worden opgevraagd (sectie IV van het verzoek)
                    </p>
                  </div>
                )}
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
                Download of kopieer je {instrumentLabel} brief
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
                  onClick={() => resetForm()}
                  data-testid="button-new"
                >
                  Nieuwe brief
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedType === "signaal" && (
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
                      <span>Cre\u00ebert dossieropbouw</span>
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
          )}

          {selectedType === "bevoegdheidsscan" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="h-4 w-4 text-primary" />
                    Waarom dit afdwingbaar is
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Woo = beslisplicht</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>4 weken termijn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Verlenging moet gemotiveerd</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Geen besluit = ingebrekestelling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Daarna beroep mogelijk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Dwangsom mogelijk</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-primary" />
                    Universeel inzetbaar bij
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">Milieuzones</Badge>
                    <Badge variant="secondary">Belastingaanslagen</Badge>
                    <Badge variant="secondary">Erfpacht</Badge>
                    <Badge variant="secondary">Handhaving</Badge>
                    <Badge variant="secondary">Dwangbevelen</Badge>
                    <Badge variant="secondary">Vergunningen</Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground">
                      Dit is geen signaal. Dit is juridisch drukmiddel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
