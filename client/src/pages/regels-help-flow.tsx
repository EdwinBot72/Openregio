import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getFlow } from "@/lib/flow-engine/flows";
import { FlowRunner } from "@/components/flow-engine/FlowRunner";

export default function RegelsHelpFlowPage() {
  const [, params] = useRoute<{ flowId: string }>("/regels/help/:flowId");
  const flowId = params?.flowId ?? "";
  const flow = getFlow(flowId);

  usePageTitle(flow ? `${flow.title} — Hulp bij regels` : "Hulp bij regels");

  if (!flow) {
    return (
      <div data-testid="page-flow-notfound">
        <h1>Flow niet gevonden</h1>
        <p className="openregio-subtitle">
          De gevraagde hulp-flow bestaat niet of is verplaatst.
        </p>
        <Link href="/regels/help" className="flow-back">
          <ArrowLeft className="h-3.5 w-3.5" />
          Terug naar Hulp bij regels
        </Link>
      </div>
    );
  }

  return (
    <div data-testid={`page-flow-${flow.id}`}>
      <Link href="/regels/help" className="flow-back" data-testid="link-back-hub">
        <ArrowLeft className="h-3.5 w-3.5" />
        Terug naar Hulp bij regels
      </Link>
      <h1>{flow.title}</h1>
      <p className="openregio-subtitle">
        Vul de vragen in — rechts (of onderaan op mobiel) verschijnt direct je
        risico-inschatting en concept-tekst.
      </p>

      <FlowRunner schema={flow} />
    </div>
  );
}
