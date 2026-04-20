import { useState } from "react";
import { Check, Copy, ListChecks, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RiskBadge } from "./RiskBadge";
import type { MatchedScenario } from "@/lib/flow-engine/engine";

interface Props {
  title: string;
  text: string;
  scenario: MatchedScenario;
}

export function OutputPanel({ title, text, scenario }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Gekopieerd", description: "De tekst staat op je klembord." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({
        title: "Kopiëren mislukt",
        description: "Selecteer de tekst handmatig en kopieer met Ctrl/Cmd+C.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flow-output">
      <div className="flow-output-head">
        <h2 className="flow-output-title">{title}</h2>
        <RiskBadge level={scenario.level} label={scenario.riskLabel} />
      </div>

      <div className="flow-output-textwrap">
        <button
          type="button"
          onClick={handleCopy}
          className="flow-copy-button"
          data-testid="button-copy-output"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Gekopieerd" : "Kopieer"}
        </button>
        <pre className="flow-output-text" data-testid="text-output">
          {text}
        </pre>
      </div>

      {scenario.checks.length > 0 && (
        <div className="flow-output-section">
          <div className="flow-output-section-head">
            <ListChecks className="h-4 w-4" />
            <span>Checks</span>
          </div>
          <ul className="flow-output-list" data-testid="list-checks">
            {scenario.checks.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flow-output-section">
        <div className="flow-output-section-head">
          <ArrowRight className="h-4 w-4" />
          <span>Volgende stap</span>
        </div>
        <p className="flow-output-next" data-testid="text-next-step">
          {scenario.nextStep}
        </p>
      </div>
    </div>
  );
}
