import Tesseract from "tesseract.js";

interface OcrResult {
  text: string;
  confidence: number;
}

export async function extractTextFromImage(buffer: Buffer): Promise<OcrResult> {
  try {
    const result = await Tesseract.recognize(
      buffer,
      "nld+eng",
      {
        logger: () => {},
      }
    );
    
    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error("OCR extraction error:", error);
    return { text: "", confidence: 0 };
  }
}
