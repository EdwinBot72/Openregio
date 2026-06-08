export type RegioBotIntent =
  | "klanten_krijgen"
  | "administratie_verminderen"
  | "ai_tool_kiezen"
  | "automatisering"
  | "teksten_en_communicatie"
  | "website_en_aanbod"
  | "social_media_en_content"
  | "offertes_en_facturen"
  | "planning_en_productiviteit"
  | "gemeente_en_regels"
  | "verkoop_en_lancering"
  | "bedrijf_organiseren"
  | "onbekend";

export const INTENT_LABELS: Record<RegioBotIntent, string> = {
  klanten_krijgen: "Klanten krijgen",
  administratie_verminderen: "Administratie verminderen",
  ai_tool_kiezen: "AI-tool kiezen",
  automatisering: "Automatisering",
  teksten_en_communicatie: "Teksten & communicatie",
  website_en_aanbod: "Website & aanbod",
  social_media_en_content: "Social media & content",
  offertes_en_facturen: "Offertes & facturen",
  planning_en_productiviteit: "Planning & productiviteit",
  gemeente_en_regels: "Gemeente & regels",
  verkoop_en_lancering: "Verkoop & lancering",
  bedrijf_organiseren: "Bedrijf organiseren",
  onbekend: "Algemene vraag",
};

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

export function detectRegioBotIntent(input: string): RegioBotIntent {
  const text = input.toLowerCase();

  if (containsAny(text, ["meer klanten", "klanten krijgen", "omzet verhogen", "boekingen", "leads", "nieuwe klanten", "klanten vinden", "meer opdrachten"])) {
    return "klanten_krijgen";
  }
  if (containsAny(text, ["administratie", "bonnen", "facturen bewaren", "boekhouding", "papierwerk", "minder tijd kwijt aan"])) {
    return "administratie_verminderen";
  }
  if (containsAny(text, ["welke ai", "ai gebruiken", "ai tool", "chatgpt", "welke tool", "tool kiezen", "ai voor mijn"])) {
    return "ai_tool_kiezen";
  }
  if (containsAny(text, ["automatiseren", "workflow", "zapier", "make", "koppelen", "automatisch", "zelf laten draaien"])) {
    return "automatisering";
  }
  if (containsAny(text, ["mail schrijven", "tekst maken", "klantmail", "brief sturen", "reactie schrijven", "bericht opstellen", "klacht", "review beantwoorden"])) {
    return "teksten_en_communicatie";
  }
  if (containsAny(text, ["website", "homepage", "aanbod verbeteren", "landingspagina", "seo", "vindbaarheid", "online zichtbaar"])) {
    return "website_en_aanbod";
  }
  if (containsAny(text, ["instagram", "facebook", "social", "post", "content", "video", "reel", "social media", "tiktok"])) {
    return "social_media_en_content";
  }
  if (containsAny(text, ["offerte", "factuur", "prijsvoorstel", "aanbetaling", "betaallink", "minder tijd kwijt aan facturen"])) {
    return "offertes_en_facturen";
  }
  if (containsAny(text, ["planning", "taken", "agenda", "overzicht houden", "productiviteit", "to do", "prioriteiten"])) {
    return "planning_en_productiviteit";
  }
  if (containsAny(text, ["gemeente", "vergunning", "regels", "apv", "stoepbord", "terras", "reclamebord", "bezwaar", "handhaving", "boete", "bestemmingsplan"])) {
    return "gemeente_en_regels";
  }
  if (containsAny(text, ["lanceren", "verkopen", "actie starten", "campagne", "aanbieding", "betaallink", "product verkopen", "dienst verkopen"])) {
    return "verkoop_en_lancering";
  }
  if (containsAny(text, ["organiseren", "structuur", "bedrijf opzetten", "proces", "systeem", "bedrijfsvoering", "groeien als bedrijf"])) {
    return "bedrijf_organiseren";
  }

  return "onbekend";
}
