import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scale,
  FileText,
  BarChart3,
  Megaphone,
  UploadCloud,
  Crown,
  Zap,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

type Mode = "juridisch" | "documenten" | "cijfers" | "marketing";

export default function RegioBotPage() {
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === "pro";

  const [mode, setMode] = useState<Mode>("juridisch");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("message", message);
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/regiobot", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnswer(data.answer ?? "Geen antwoord ontvangen van de AI.");
    } catch (err) {
      console.error(err);
      setAnswer("Er ging iets mis met RegioBot. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoading && !isPro) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card data-testid="card-upgrade-prompt">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Crown className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-accent">
              RegioBot is alleen beschikbaar voor Pro-leden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Upgrade naar OpenRegio Pro om toegang te krijgen tot onze
              AI-assistent en veel meer functies.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">
                        AI-Assistent RegioBot
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Laat AI je helpen met content, marketing en lokale SEO
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Onbeperkte content</h3>
                      <p className="text-sm text-muted-foreground">
                        Schrijf zoveel posts, aanbiedingen en teksten als je
                        wilt
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Slimme templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Gebruik professionele templates voor je business
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Prioriteit support</h3>
                      <p className="text-sm text-muted-foreground">
                        Krijg snellere hulp en persoonlijk advies
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Link href="/lidmaatschap?plan=pro" asChild>
                <Button size="lg" data-testid="button-upgrade-to-pro">
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade naar Pro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          RegioBot – jouw juridische & business AI
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Stel juridische, zakelijke en praktische vragen over jouw bedrijf.
          Upload documenten, cijfers en afbeeldingen, en laat RegioBot meedenken
          – in normale taal.
        </p>
      </header>

      <section className="flex flex-wrap gap-2 text-xs md:text-sm">
        <ModeButton
          icon={<Scale className="w-4 h-4" />}
          label="Juridisch loket"
          active={mode === "juridisch"}
          onClick={() => setMode("juridisch")}
          testId="button-mode-juridisch"
        />
        <ModeButton
          icon={<FileText className="w-4 h-4" />}
          label="Brieven & documenten"
          active={mode === "documenten"}
          onClick={() => setMode("documenten")}
          testId="button-mode-documenten"
        />
        <ModeButton
          icon={<BarChart3 className="w-4 h-4" />}
          label="Cijfers & Excel"
          active={mode === "cijfers"}
          onClick={() => setMode("cijfers")}
          testId="button-mode-cijfers"
        />
        <ModeButton
          icon={<Megaphone className="w-4 h-4" />}
          label="Marketing & content"
          active={mode === "marketing"}
          onClick={() => setMode("marketing")}
          testId="button-mode-marketing"
        />
      </section>

      <div className="grid md:grid-cols-[2fr,1.4fr] gap-6">
        <Card className="h-full">
          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bestanden toevoegen (optioneel)
                </label>
                <label className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/40 text-center">
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Sleep bestanden hierheen of klik om te kiezen.
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Ondersteund: PDF, DOCX, JPG/PNG, XLSX, CSV
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-file-upload"
                  />
                </label>
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Geselecteerd: {files.map((f) => f.name).join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Jouw vraag aan RegioBot
                </label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[120px] bg-background"
                  placeholder={placeholderForMode(mode)}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  data-testid="textarea-regiobot-message"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  data-testid="button-submit-regiobot"
                >
                  {loading
                    ? "RegioBot is aan het nadenken..."
                    : "Stuur naar RegioBot"}
                </Button>
                <p className="text-[10px] text-muted-foreground max-w-xs text-right">
                  RegioBot is geen advocaat of accountant. Gebruik het als
                  slimme sparringpartner; bij zware zaken altijd een
                  professional inschakelen.
                </p>
              </div>
            </form>

            {answer && (
              <div className="border-t pt-4 mt-4">
                <h2 className="text-sm font-semibold mb-2">
                  Antwoord van RegioBot
                </h2>
                <div
                  className="text-sm whitespace-pre-wrap"
                  data-testid="text-regiobot-answer"
                >
                  {answer}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-5 space-y-3 text-sm">
            <h2 className="font-semibold mb-1">Voorbeelden voor deze modus</h2>
            {mode === "juridisch" && (
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  "Check dit contract op onredelijke voorwaarden voor mij als
                  zzp'er."
                </li>
                <li>
                  "Schrijf een stevige, zakelijke bezwaarbrief op basis van dit
                  PDF-besluit."
                </li>
                <li>
                  "Leg in normale taal uit wat dit vonnis of besluit voor mij
                  betekent."
                </li>
              </ul>
            )}
            {mode === "documenten" && (
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  "Herschrijf deze brief aan de gemeente, zakelijk en duidelijk."
                </li>
                <li>
                  "Maak van deze ruwe notities een nette mail voor mijn klant."
                </li>
                <li>"Vat dit Word-document samen in 10 regels."</li>
              </ul>
            )}
            {mode === "cijfers" && (
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  "Analyseer deze Excel met omzet en kosten en geef 3 concrete
                  verbeterpunten."
                </li>
                <li>
                  "Maak een simpele cashflow-inschatting voor de komende 3
                  maanden."
                </li>
                <li>
                  "Leg in normale taal uit wat je ziet in dit CSV-bestand."
                </li>
              </ul>
            )}
            {mode === "marketing" && (
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  "Schrijf 3 korte posts voor mijn actie in [regio], gericht op
                  [doelgroep]."
                </li>
                <li>
                  "Maak een simpele landingspagina-tekst voor mijn dienst [X]."
                </li>
                <li>
                  "Geef 5 ideeën om mijn bestaande klanten in de buurt weer te
                  activeren."
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ModeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}

function ModeButton({ icon, label, active, onClick, testId }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs md:text-sm",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground hover:bg-muted",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function placeholderForMode(mode: Mode): string {
  switch (mode) {
    case "juridisch":
      return "Beschrijf je juridische vraag of plak hier de tekst uit het document. Voorbeeld: 'Schrijf een bezwaarbrief op basis van de bijgevoegde PDF en deze situatie…'";
    case "documenten":
      return "Leg uit wat je met je brief of document wilt bereiken. Voorbeeld: 'Maak deze brief duidelijker en zakelijker voor een gemeente-ambtenaar…'";
    case "cijfers":
      return "Vertel kort wat er in je Excel/CSV zit en wat je wilt weten. Voorbeeld: 'Dit is mijn omzet/kosten per maand, geef 3 inzichten…'";
    case "marketing":
      return "Beschrijf kort je bedrijf, doelgroep en wat je wilt promoten. Voorbeeld: 'Ik wil een actie doen voor nieuwe klanten in [regio]…'";
  }
}
