import OpenAI from "openai";
import { embedText } from "./embeddings";
import { vectorSearch, searchByRegion } from "./retrieve";

const openai = new OpenAI();

const SYSTEM_PROMPT = `
Jij bent RegioBot. Jij werkt dossier-gedreven.

Regels (hard):
- Gebruik uitsluitend de meegegeven CONTEXT. Niks verzinnen.
- Als iets niet in context staat: zeg 'Niet in dossier' en noem welke documenten je moet opvragen (Woo).
- Citeer bronnen als: [bron: <titel> | datum: <datum>]
- Schrijf compact, zakelijk, in normaal Nederlands.

Focus gebieden:
- Wet- en regelgeving analyse
- WOO-verzoeken en mandaten
- Bevoegdheden en termijnen
- Subsidies en vergunningen

Weiger expliciet:
- Verkeersovertredingen en persoonlijke boetes
- Niet-zakelijke vragen
`;

interface AskParams {
  userId?: string;
  region?: string;
  query: string;
  k?: number;
}

interface AskResult {
  answer: string;
  sources: Array<{
    chunkId: string;
    documentId: string;
    title: string | null;
    letterDate: Date | null;
    score: number;
  }>;
}

export async function ask(params: AskParams): Promise<AskResult> {
  const { userId, region, query, k = 8 } = params;
  
  const queryEmbedding = await embedText(query);
  
  let rows;
  if (userId) {
    rows = await vectorSearch({ userId, embedding: queryEmbedding, k });
  } else if (region) {
    rows = await searchByRegion({ region, embedding: queryEmbedding, k });
  } else {
    throw new Error("userId of region is verplicht");
  }
  
  const context = rows.map(r => {
    const date = r.letterDate ? String(r.letterDate).slice(0, 10) : "onbekend";
    return `BRON [doc: ${r.title || r.documentId} | datum: ${date} | score: ${r.score.toFixed(3)}]\n${r.text}`;
  });
  
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  
  if (context.length > 0) {
    messages.push({ 
      role: "system", 
      content: `CONTEXT (WOO-bibliotheek)\n\n${context.join("\n\n---\n\n")}` 
    });
  } else {
    messages.push({
      role: "system",
      content: "GEEN DOCUMENTEN GEVONDEN IN DE WOO-BIBLIOTHEEK. Geef aan dat de gebruiker eerst documenten moet uploaden."
    });
  }
  
  messages.push({ role: "user", content: query });
  
  const response = await openai.chat.completions.create({
    model: process.env.CHAT_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    messages,
  });
  
  const answer = response.choices?.[0]?.message?.content?.trim() || "";
  
  return {
    answer,
    sources: rows.map(r => ({
      chunkId: r.chunkId,
      documentId: r.documentId,
      title: r.title,
      letterDate: r.letterDate,
      score: r.score,
    })),
  };
}
