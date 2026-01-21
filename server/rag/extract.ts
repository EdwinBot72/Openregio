import pdf from "pdf-parse/lib/pdf-parse.js";

interface ExtractResult {
  text: string;
  needsOcr: boolean;
  pages: number | null;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractResult> {
  try {
    const data = await pdf(buffer);
    const text = (data.text || "").trim();
    const needsOcr = text.length < 200;
    return { text, needsOcr, pages: data.numpages || null };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return { text: "", needsOcr: true, pages: null };
  }
}
