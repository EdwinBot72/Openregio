import { Link } from "wouter";
import { Mail, HelpCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FLOW_LIST } from "@/lib/flow-engine/flows";

const ICONS = {
  mail: Mail,
  help: HelpCircle,
  shield: ShieldAlert,
};

export default function RegelsHelpPage() {
  usePageTitle("Hulp bij regels — OpenRegio");

  return (
    <div data-testid="page-regels-help">
      <h1>Hulp bij regels</h1>
      <p className="openregio-subtitle">
        Drie korte hulplijnen voor wat ondernemers het vaakst tegenkomen. Je
        beantwoordt een paar vragen, krijgt direct een risico-inschatting,
        checks en een concept-tekst die je kunt aanpassen en versturen.
      </p>

      <div className="flow-hub-grid">
        {FLOW_LIST.map((flow) => {
          const Icon = ICONS[flow.icon] ?? HelpCircle;
          return (
            <Link
              key={flow.id}
              href={`/regels/help/${flow.id}`}
              className="flow-hub-card"
              data-testid={`card-flow-${flow.id}`}
            >
              <div className="flow-hub-icon">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flow-hub-title">{flow.title}</div>
              <p className="flow-hub-desc">{flow.intro}</p>
              <div className="flow-hub-cta">
                Start <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
