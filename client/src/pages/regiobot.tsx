import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scale,
  FileText,
  Crown,
  Zap,
  Tag,
  TrendingUp,
  Search,
  CheckCircle,
  HelpCircle,
  FileQuestion,
  Clock,
  Library,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

type ActionType = "analyze" | "mandate" | "missing" | "followup" | "timeline" | null;

export default function RegioBotPage() {
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === "pro";

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  function handleActionClick(action: ActionType, prefix: string) {
    setActiveAction(action);
    if (!message.trim()) {
      setMessage(prefix);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch("/api/regiobot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("RegioBot API gaf een fout");
      }

      const data = await res.json();
      setAnswer(data.answer ?? "Geen antwoord ontvangen van RegioBot.");
    } catch (err) {
      console.error(err);
      setAnswer(
        "Er ging iets mis met RegioBot. Check je verbinding of probeer het later opnieuw."
      );
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
              WOO & Juridische AI-assistent.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">
                        WOO & Juridische AI
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analyseer wet- en regelgeving die ondernemers raakt
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
                      <h3 className="font-semibold mb-2">Collectieve bibliotheek</h3>
                      <p className="text-sm text-muted-foreground">
                        Toegang tot gedeelde WOO-verzoeken en besluiten
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
                      <h3 className="font-semibold mb-2">Mandaat & bevoegdheden</h3>
                      <p className="text-sm text-muted-foreground">
                        Inzicht in wie wat mag beslissen
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
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="heading-regiobot">
          RegioBot – Regionale WOO & Juridische AI
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          RegioBot helpt bij het analyseren van wet- en regelgeving die ondernemers raakt.
          Samen bouwen we aan een gezamenlijke WOO-bibliotheek voor toezicht op beleid,
          mandaten en uitvoeringsstructuren.
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
          <strong>Niet opgenomen:</strong> verkeersboetes, snelheid, parkeren,
          persoonlijke dossiers of individuele handhaving.
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        <ActionButton
          icon={<Search className="w-4 h-4" />}
          label="Analyseer besluit"
          active={activeAction === "analyze"}
          onClick={() => handleActionClick("analyze", "Analyseer dit besluit: ")}
          testId="button-action-analyze"
        />
        <ActionButton
          icon={<CheckCircle className="w-4 h-4" />}
          label="Controleer mandaat"
          active={activeAction === "mandate"}
          onClick={() => handleActionClick("mandate", "Controleer het mandaat voor: ")}
          testId="button-action-mandate"
        />
        <ActionButton
          icon={<HelpCircle className="w-4 h-4" />}
          label="Wat ontbreekt?"
          active={activeAction === "missing"}
          onClick={() => handleActionClick("missing", "Wat ontbreekt in dit dossier: ")}
          testId="button-action-missing"
        />
        <ActionButton
          icon={<FileQuestion className="w-4 h-4" />}
          label="Genereer vervolg-WOO"
          active={activeAction === "followup"}
          onClick={() => handleActionClick("followup", "Genereer vervolg-WOO vragen voor: ")}
          testId="button-action-followup"
        />
        <ActionButton
          icon={<Clock className="w-4 h-4" />}
          label="Bouw tijdlijn"
          active={activeAction === "timeline"}
          onClick={() => handleActionClick("timeline", "Bouw een tijdlijn op basis van: ")}
          testId="button-action-timeline"
        />
      </section>

      <div className="grid md:grid-cols-[2fr,1.2fr] gap-6">
        <Card className="h-full">
          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Jouw vraag aan RegioBot
                </label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm min-h-[160px] bg-background"
                  placeholder="Stel een vraag over wet- en regelgeving in jouw regio, of plak hier een WOO-verzoek, besluit of antwoord om te analyseren."
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
                    ? "RegioBot analyseert..."
                    : "Analyseer met RegioBot"}
                </Button>
                <p className="text-[10px] text-muted-foreground max-w-xs text-right">
                  RegioBot geeft geen juridisch advies. Gebruik het voor analyse
                  en onderzoek; bij complexe zaken altijd een specialist raadplegen.
                </p>
              </div>
            </form>

            {answer && (
              <div className="border-t pt-4 mt-4">
                <h2 className="text-sm font-semibold mb-2">
                  Analyse van RegioBot
                </h2>
                <div
                  className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-md"
                  data-testid="text-regiobot-answer"
                >
                  {answer}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-5 space-y-4 text-sm">
            <h2 className="font-semibold">Voorbeeldvragen</h2>

            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                "Welke mandaten heeft de gemeente Haarlem voor handhaving van ondernemers?"
              </li>
              <li>
                "Analyseer dit WOO-besluit en geef aan wat ontbreekt."
              </li>
              <li>
                "Wie heeft bevoegdheid om vergunningen te verlenen in mijn regio?"
              </li>
              <li>
                "Genereer vervolg-WOO vragen op basis van dit antwoord."
              </li>
              <li>
                "Bouw een tijdlijn van alle besluiten in dit dossier."
              </li>
            </ul>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Scope van RegioBot</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>WOO-verzoeken en antwoorden</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Beleidsregels en verordeningen</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Mandaat- en delegatiebesluiten</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Vergunningen en subsidies</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-regio-purple/20 bg-regio-purple/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-regio-purple/10">
              <Library className="h-6 w-6 text-regio-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Gezamenlijke WOO-bibliotheek</h3>
              <p className="text-sm text-muted-foreground">
                Alle WOO-verzoeken en documenten die hier worden toegevoegd,
                dragen bij aan een collectief regionaal geheugen.
                Zo hoeven ondernemers niet individueel hetzelfde uit te zoeken.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}

function ActionButton({ icon, label, active, onClick, testId }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground hover:bg-muted border-border",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
