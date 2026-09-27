import OpenAI from "openai";

const openai = new OpenAI();

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // Lokaal model via Ollama (zelfde OpenAI-compatibele koppeling als de rest van de AI). 768 dimensies.
  const model = process.env.EMBEDDING_MODEL || "nomic-embed-text";
  
  const response = await openai.embeddings.create({
    model,
    input: texts,
  });
  
  return response.data.map(d => d.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}
