import type { FlowSchema } from "../types";
import { briefOntvangenFlow } from "./brief-ontvangen";
import { regelOnduidelijkFlow } from "./regel-onduidelijk";
import { controleVergunningBoeteFlow } from "./controle-vergunning-boete";

export const FLOWS: Record<string, FlowSchema> = {
  [briefOntvangenFlow.id]: briefOntvangenFlow,
  [regelOnduidelijkFlow.id]: regelOnduidelijkFlow,
  [controleVergunningBoeteFlow.id]: controleVergunningBoeteFlow,
};

export const FLOW_LIST: FlowSchema[] = [
  briefOntvangenFlow,
  regelOnduidelijkFlow,
  controleVergunningBoeteFlow,
];

export function getFlow(id: string): FlowSchema | undefined {
  return FLOWS[id];
}
