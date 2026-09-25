// Tekst uit een geüpload bestand halen: PDF (met OCR-fallback voor scans),
// foto (OCR), Word (.docx) of platte tekst. Alles lokaal op de eigen server.
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function tekstUitBestand(file: { buffer: Buffer; mimetype: string; originalname?: string }): Promise<string> {
  const ext = (file.originalname || "").split(".").pop()?.toLowerCase();
  if (file.mimetype === DOCX_MIME || ext === "docx") {
    const mammoth = await import("mammoth");
    const r = await mammoth.extractRawText({ buffer: file.buffer });
    return (r.value || "").trim();
  }
  if (file.mimetype.startsWith("image/")) {
    const { extractTextFromImage } = await import("../rag/ocr");
    return ((await extractTextFromImage(file.buffer)).text || "").trim();
  }
  if (file.mimetype === "text/plain" || ext === "txt") return file.buffer.toString("utf-8").trim();
  if (file.mimetype === "application/pdf" || ext === "pdf") {
    const { extractTextFromPDF } = await import("../rag/extract");
    let t = ((await extractTextFromPDF(file.buffer)).text || "").trim();
    if (t.length < 20) {
      const { ocrScannedPdf } = await import("../rag/pdf-ocr");
      t = await ocrScannedPdf(file.buffer);
    }
    return t;
  }
  throw Object.assign(new Error("Bestandstype niet ondersteund. Upload een PDF, Word-bestand, foto (JPG/PNG) of plak de tekst."), { status: 400 });
}
