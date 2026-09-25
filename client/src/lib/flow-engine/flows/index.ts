import type { FlowSchema } from "../types";
import { briefOntvangenFlow } from "./brief-ontvangen";
import { regelOnduidelijkFlow } from "./regel-onduidelijk";
import { controleVergunningBoeteFlow } from "./controle-vergunning-boete";

export const FLOWS: Record<string, FlowSchema> = {
  [briefOntvangenFlow.id]: briefOntvangenFlow,
  [regelOnduidelijkFlow.id]: regelOnduidelijkFlow,
  [controleVergunningBoeteFlow.id]: controleVergunningBoeteFlow,
};

// "brief-ontvangen" staat niet meer in de lijst: /regels/help/brief-ontvangen verwijst door naar de briefcontrole.
export const FLOW_LIST: FlowSchema[] = [
  regelOnduidelijkFlow,
  controleVergunningBoeteFlow,
];

export function getFlow(id: string): FlowSchema | undefined {
  return FLOWS[id];
}
