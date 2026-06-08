import { businessTools, type BusinessTool } from "../data/regiobot-tools";
import type { RegioBotIntent } from "./regiobot-intent";

const toolNamesByIntent: Record<RegioBotIntent, string[]> = {
  klanten_krijgen: ["Google Bedrijfsprofiel", "Canva", "ChatGPT", "Brevo"],
  administratie_verminderen: ["Moneybird", "Google Forms", "ChatGPT", "Make"],
  ai_tool_kiezen: ["ChatGPT", "Canva", "Make", "Trello", "Google Forms"],
  automatisering: ["Make", "Google Forms", "Moneybird", "Brevo"],
  teksten_en_communicatie: ["ChatGPT", "Canva"],
  website_en_aanbod: ["ChatGPT", "Google Bedrijfsprofiel", "Canva"],
  social_media_en_content: ["Canva", "CapCut", "ChatGPT", "Google Bedrijfsprofiel"],
  offertes_en_facturen: ["Moneybird", "ChatGPT", "Google Forms"],
  planning_en_productiviteit: ["Trello", "Google Forms", "ChatGPT"],
  gemeente_en_regels: ["ChatGPT", "Google Forms"],
  verkoop_en_lancering: ["Canva", "ChatGPT", "Mollie", "Brevo"],
  bedrijf_organiseren: ["Trello", "Google Forms", "Make", "ChatGPT"],
  onbekend: ["ChatGPT", "Canva", "Google Forms"],
};

export function getToolsForIntent(intent: RegioBotIntent): BusinessTool[] {
  const names = toolNamesByIntent[intent] ?? toolNamesByIntent["onbekend"];
  return businessTools.filter((t) => names.includes(t.name));
}

interface BuildRegioBotPromptInput {
  message: string;
  businessType?: string;
  city?: string;
  intent: RegioBotIntent;
  tools: BusinessTool[];
}

export function buildRegioBotRoutePrompt(input: BuildRegioBotPromptInput): string {
  const { message, businessType, city, intent, tools } = input;

  const toolList = tools
    .map((t) => `- ${t.name} (${t.pricing}): ${t.whenToUse}${t.openRegioService ? ` OpenRegio-hulp: ${t.openRegioService}` : ""}`)
    .join("\n");

  return `Je bent RegioBot, een praktische AI-routeplanner voor lokale ondernemers in Nederland.

Je taak: help de ondernemer ontdekken wat ze echt zoeken en welke oplossing daarbij past.

Context:
- Bedrijfstype: ${businessType || "niet opgegeven"}
- Plaats/regio: ${city || "niet opgegeven"}
- Herkende categorie: ${intent.replace(/_/g, " ")}

Vraag van de ondernemer:
"${message}"

Aanbevolen tools voor deze categorie:
${toolList}

Geef een antwoord in PRECIES deze structuur (gebruik de markdown-koppen):

## Wat je eigenlijk zoekt
Leg in 1-2 zinnen uit wat de ondernemer probeert op te lossen.

## Slimme route
Geef 3 tot 5 concrete, direct uitvoerbare stappen. Maak het specifiek voor hun situatie.

## Handige tools
Noem maximaal 4 tools uit de aanbevolen lijst. Per tool: naam + in 1 zin waarvoor handig.

## Direct bruikbaar
Geef een voorbeeldtekst, checklist, social post, mail, of template die de ondernemer direct kan gebruiken.

## Vervolgstap
Geef 1 concrete volgende actie. Sluit af met: "Wil je dat OpenRegio dit voor je uitwerkt?" — en noem kort welke OpenRegio-hulp van toepassing is.

Regels:
- Antwoord in het Nederlands.
- Wees praktisch, nuchter en direct. Geen lange theorie.
- Geen definitief juridisch advies. Bij gemeente-/vergunningsvragen: geef een checkroute en voorbeeldvragen die de ondernemer kan stellen.
- Gebruik geen emojis.`;
}
