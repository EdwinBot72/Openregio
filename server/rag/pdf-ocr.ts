import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { extractTextFromImage } from "./ocr";

const execFileP = promisify(execFile);

/**
 * OCR-fallback voor gescande PDF's (geen tekstlaag).
 * Rendert de eerste `maxPages` pagina's naar PNG met `pdftoppm` (poppler-utils)
 * en herkent de tekst met tesseract. Vereist dat poppler-utils in de container zit.
 * Geeft de gecombineerde tekst terug (leeg als er niets te herkennen viel).
 */
export async function ocrScannedPdf(buffer: Buffer, maxPages = 8): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "ocrpdf-"));
  const pdfPath = path.join(dir, "in.pdf");
  const prefix = path.join(dir, "page");
  try {
    await fs.writeFile(pdfPath, buffer);
    // Render pagina 1..maxPages naar PNG (200 dpi geeft goede OCR zonder te zwaar te worden).
    await execFileP(
      "pdftoppm",
      ["-png", "-r", "200", "-f", "1", "-l", String(maxPages), pdfPath, prefix],
      { timeout: 180000 },
    );
    const files = (await fs.readdir(dir))
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort();
    let text = "";
    for (const f of files) {
      const img = await fs.readFile(path.join(dir, f));
      try {
        const ocr = await extractTextFromImage(img);
        if (ocr?.text) text += ocr.text + "\n";
      } catch (e: any) {
        console.error(`[pdf-ocr] OCR van ${f} mislukt:`, e?.message || e);
      }
    }
    return text.trim();
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
