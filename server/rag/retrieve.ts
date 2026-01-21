import { db } from "db";
import { sql } from "drizzle-orm";

interface SearchResult {
  chunkId: string;
  text: string;
  metadataJson: Record<string, unknown>;
  documentId: string;
  title: string | null;
  letterDate: Date | null;
  score: number;
}

export async function vectorSearch(params: {
  userId: string;
  embedding: number[];
  k?: number;
}): Promise<SearchResult[]> {
  const { userId, embedding, k = 8 } = params;
  
  const embeddingStr = `[${embedding.join(",")}]`;
  
  const result = await db.execute(sql`
    SELECT
      c.id as chunk_id,
      c.text,
      c.metadata_json,
      d.id as document_id,
      d.title,
      d.letter_date,
      1 - (e.embedding <=> ${embeddingStr}::vector) AS score
    FROM rag_embeddings e
    JOIN rag_chunks c ON c.id = e.chunk_id
    JOIN rag_documents d ON d.id = c.document_id
    WHERE d.user_id = ${userId}
    ORDER BY e.embedding <=> ${embeddingStr}::vector
    LIMIT ${k}
  `);
  
  return (result.rows as any[]).map(row => ({
    chunkId: row.chunk_id,
    text: row.text,
    metadataJson: row.metadata_json || {},
    documentId: row.document_id,
    title: row.title,
    letterDate: row.letter_date,
    score: Number(row.score),
  }));
}

export async function searchByRegion(params: {
  region: string;
  embedding: number[];
  k?: number;
}): Promise<SearchResult[]> {
  const { region, embedding, k = 8 } = params;
  
  const embeddingStr = `[${embedding.join(",")}]`;
  
  const result = await db.execute(sql`
    SELECT
      c.id as chunk_id,
      c.text,
      c.metadata_json,
      d.id as document_id,
      d.title,
      d.letter_date,
      1 - (e.embedding <=> ${embeddingStr}::vector) AS score
    FROM rag_embeddings e
    JOIN rag_chunks c ON c.id = e.chunk_id
    JOIN rag_documents d ON d.id = c.document_id
    WHERE d.region = ${region}
    ORDER BY e.embedding <=> ${embeddingStr}::vector
    LIMIT ${k}
  `);
  
  return (result.rows as any[]).map(row => ({
    chunkId: row.chunk_id,
    text: row.text,
    metadataJson: row.metadata_json || {},
    documentId: row.document_id,
    title: row.title,
    letterDate: row.letter_date,
    score: Number(row.score),
  }));
}
