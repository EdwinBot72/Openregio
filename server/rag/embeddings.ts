import OpenAI from "openai";

const openai = new OpenAI();

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  
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
