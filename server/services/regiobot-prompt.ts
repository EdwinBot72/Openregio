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

export interface RegioBotMessages {
  system: string;
  user: string;
}

export function buildRegioBotRoutePrompt(input: BuildRegioBotPromptInput): RegioBotMessages {
  const { message, businessType, city, intent, tools } = input;

  const toolList = tools
    .map((t) => `- ${t.name} (${t.pricing}, ${t.difficulty}): ${t.whenToUse}${t.openRegioService ? ` | OpenRegio: ${t.openRegioService}` : ""}`)
    .join("\n");

  const contextLines = [
    businessType ? `Bedrijfstype: ${businessType}` : null,
    city ? `Locatie: ${city}` : null,
  ].filter(Boolean).join(" | ");

  const system = `Je bent RegioBot — de scherpste AI-adviseur voor lokale ondernemers in Nederland.

Je spreekt als een ervaren strateeg die ook gewoon nuchter kan zijn. Niet zweverig, niet overdreven, gewoon concreet en bruikbaar. Je kent de Nederlandse ondernemer: zelfstandig, pragmatisch, weinig tijd, veel vragen.

Jouw stijl:
- Directe taal, geen omwegen
- Altijd concrete stappen, geen vage "je kunt overwegen om..."
- Noem specifieke tools, diensten en aanpakken met naam
- Geef voorbeelden die de ondernemer direct kan kopiëren en gebruiken
- Schrijf alsof je naast de ondernemer zit, niet boven hem
- Geen emojis, geen opsommingstekens met sterretjes, geen wollig taalgebruik

Je bent specialist in: lokale vindbaarheid, AI-tools voor kleine bedrijven, gemeente- en regelgeving, marketing voor de regio, en slimme automatisering.

ALTIJD antwoorden in het Nederlands. ALTIJD in de gevraagde structuur met ## koppen.`;

  const user = `${contextLines ? `Context: ${contextLines}\n\n` : ""}Vraag van de ondernemer:
"${message}"

Beschikbare tools voor deze situatie:
${toolList}

Beantwoord dit als RegioBot. Gebruik PRECIES deze structuur:

## Wat je eigenlijk wilt bereiken
Benoem in 2-3 scherpe zinnen de kern van het probleem én de kans. Wees specifiek — noem het bedrijfstype en de situatie.

## De slimste route in 5 stappen
Geef 5 concrete, genummerde stappen die de ondernemer deze week kan uitvoeren. Elke stap is specifiek en uitvoerbaar. Geen vage instructies.

## Welke tools je hiervoor gebruikt
Kies maximaal 4 tools uit de lijst. Per tool: naam, precies waarvoor, en een concrete tip hoe je het gebruikt. Wees specifiek — niet "je kunt Canva gebruiken voor design" maar "Maak in Canva een A4-flyer met je aanbod en stuur die als pdf naar de lokale supermarkt."

## Gebruik dit direct
Geef een kant-en-klaar voorbeeld dat de ondernemer direct kan kopiëren. Dit kan zijn:
- Een Instagram-caption of advertentietekst
- Een mail aan potentiële klanten
- Een concrete vraag voor de gemeente
- Een sjabloon voor een offerte of bericht
Pas het aan op hun situatie.

## Jouw volgende stap
Geef één concrete actie die de ondernemer vandaag nog kan doen. Sluit af met een aanbod van OpenRegio: wat kan OpenRegio specifiek voor hen uitwerken of regelen?`;

  return { system, user };
}
