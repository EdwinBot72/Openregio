// Tekst uit een geüpload bestand halen. Alles lokaal op de eigen server.
//  • PDF (met OCR voor scans), TIFF (via PDF, ook meerdere pagina's)
//  • Foto's: JPG/JPEG/JFIF, PNG, WebP, BMP (OCR) en HEIC/HEIF van iPhones (eerst omgezet)
//  • Word (.docx en oud .doc), OpenDocument (.odt), RTF en platte tekst
// Het type wordt bepaald aan de hand van de inhoud (magic bytes) en de extensie,
// niet alleen het mimetype: browsers sturen voor HEIC of JFIF vaak iets anders mee.
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const run = promisify(execFile);
type Bestand = { buffer: Buffer; mimetype: string; originalname?: string };

type Soort = "pdf" | "docx" | "doc" | "odt" | "rtf" | "txt" | "afbeelding" | "heic" | "tiff";

function bepaalSoort(f: Bestand): Soort | null {
  const b = f.buffer;
  const ext = (f.originalname || "").split(".").pop()?.toLowerCase() || "";
  const hex = b.subarray(0, 12).toString("hex");
  const ascii = b.subarray(0, 12).toString("latin1");
  if (ascii.startsWith("%PDF")) return "pdf";
  if (hex.startsWith("49492a00") || hex.startsWith("4d4d002a")) return "tiff";
  if (ascii.slice(4, 8) === "ftyp" && /heic|heix|hevc|hevx|mif1|msf1|heim|heis/.test(ascii.slice(8, 12))) return "heic";
  if (hex.startsWith("ffd8ff") || hex.startsWith("89504e47") || (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") || ascii.startsWith("BM")) return "afbeelding";
  if (hex.startsWith("d0cf11e0")) return "doc"; // oud Word-formaat (OLE)
  if (ascii.startsWith("{\\rtf")) return "rtf";
  if (hex.startsWith("504b0304")) return ext === "odt" ? "odt" : "docx"; // zip-container
  if (ext === "txt" || f.mimetype === "text/plain") return "txt";
  return null;
}

async function metTijdelijkBestand<T>(buffer: Buffer, ext: string, fn: (pad: string, map: string) => Promise<T>): Promise<T> {
  const map = await fs.mkdtemp(path.join(os.tmpdir(), "brief-"));
  const pad = path.join(map, `invoer.${ext}`);
  try {
    await fs.writeFile(pad, buffer);
    return await fn(pad, map);
  } finally {
    await fs.rm(map, { recursive: true, force: true }).catch(() => {});
  }
}

async function ocrAfbeelding(buffer: Buffer): Promise<string> {
  const { extractTextFromImage } = await import("../rag/ocr");
  return ((await extractTextFromImage(buffer)).text || "").trim();
}

/** Eenvoudige RTF → tekst: stuurcodes en groepen weg, alinea's en speciale tekens behouden. */
function rtfNaarTekst(rtf: string): string {
  return rtf
    .replace(/\\'([0-9a-f]{2})/gi, (_, h) => Buffer.from([parseInt(h, 16)]).toString("latin1"))
    .replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode(((Number(n) % 65536) + 65536) % 65536))
    .replace(/\{\\\*[^{}]*\}/g, "")
    .replace(/\{\\(fonttbl|colortbl|stylesheet|info)[\s\S]*?\}\}?/g, "")
    .replace(/\\(par|line)\b ?/g, "\n")
    .replace(/\\tab\b ?/g, "\t")
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function tekstUitBestand(file: Bestand): Promise<string> {
  const soort = bepaalSoort(file);
  switch (soort) {
    case "txt":
      return file.buffer.toString("utf-8").trim();
    case "docx": {
      const mammoth = await import("mammoth");
      const r = await mammoth.extractRawText({ buffer: file.buffer });
      return (r.value || "").trim();
    }
    case "doc":
      return metTijdelijkBestand(file.buffer, "doc", async (pad) => (await run("antiword", ["-w", "0", pad], { maxBuffer: 20 * 1024 * 1024 })).stdout.trim());
    case "odt":
      return metTijdelijkBestand(file.buffer, "odt", async (pad) => {
        const xml = (await run("unzip", ["-p", pad, "content.xml"], { maxBuffer: 50 * 1024 * 1024 })).stdout;
        return xml
          .replace(/<text:(p|h)[^>]*>/g, "\n").replace(/<text:line-break\/>/g, "\n").replace(/<text:tab\/>/g, "\t")
          .replace(/<[^>]+>/g, "")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&")
          .replace(/\n{3,}/g, "\n\n").trim();
      });
    case "rtf":
      return rtfNaarTekst(file.buffer.toString("latin1"));
    case "afbeelding":
      return ocrAfbeelding(file.buffer);
    case "heic":
      return metTijdelijkBestand(file.buffer, "heic", async (pad, map) => {
        const uit = path.join(map, "omgezet.jpg");
        await run("heif-convert", ["-q", "90", pad, uit]);
        return ocrAfbeelding(await fs.readFile(uit));
      });
    case "tiff":
      return metTijdelijkBestand(file.buffer, "tif", async (pad, map) => {
        const pdf = path.join(map, "omgezet.pdf");
        await run("tiff2pdf", ["-o", pdf, pad]);
        const { ocrScannedPdf } = await import("../rag/pdf-ocr");
        return ocrScannedPdf(await fs.readFile(pdf), 20);
      });
    case "pdf": {
      const { extractTextFromPDF } = await import("../rag/extract");
      let t = ((await extractTextFromPDF(file.buffer)).text || "").trim();
      if (t.length < 20) {
        const { ocrScannedPdf } = await import("../rag/pdf-ocr");
        t = await ocrScannedPdf(file.buffer, 20);
      }
      return t;
    }
    default:
      throw Object.assign(
        new Error("Dit bestandstype kunnen we niet lezen. Upload een PDF, Word (.docx/.doc), OpenDocument (.odt), RTF, TXT of een foto (JPG, PNG, HEIC, WebP, TIFF), of plak de tekst."),
        { status: 400 },
      );
  }
}

/** Meerdere bestanden (bijv. een foto per pagina) na elkaar uitlezen tot één brieftekst. */
export async function tekstUitBestanden(files: Bestand[]): Promise<string> {
  const delen: string[] = [];
  for (const f of files) delen.push(await tekstUitBestand(f));
  return delen.filter(Boolean).join("\n\n");
}
