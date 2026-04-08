import { createRequire } from "module";

const require = createRequire(import.meta.url);

interface ExtractResult {
  text: string;
  needsOcr: boolean;
  pages: number | null;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractResult> {
  try {
    const pdfModule = require("pdf-parse");
    const pdf = typeof pdfModule === "function" ? pdfModule : (pdfModule.default ?? pdfModule);
    const data = await pdf(buffer);
    const text = (data.text || "").trim();
    const needsOcr = text.length < 200;
    return { text, needsOcr, pages: data.numpages || null };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return { text: "", needsOcr: true, pages: null };
  }
}
