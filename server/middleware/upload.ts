import multer from "multer";
import path from "path";

const ALLOWED_MIMES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

function isValidFileExtension(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allowedExts = ALLOWED_MIMES[mimeType];
  return allowedExts ? allowedExts.includes(ext) : false;
}

function hasDangerousExtension(filename: string): boolean {
  // Per naamdeel na een punt: "virus.php.jpg" is gevaarlijk, "offerte.planning.pdf" niet.
  const dangerous = new Set([
    'php', 'phtml', 'php3', 'php4', 'php5', 'phps',
    'exe', 'bat', 'cmd', 'sh', 'bash',
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    'asp', 'aspx', 'jsp',
    'cgi', 'pl', 'py', 'rb',
    'htaccess', 'htpasswd', 'html', 'htm', 'svg',
  ]);
  const delen = filename.toLowerCase().split('.').slice(1);
  return delen.some((d) => dangerous.has(d.trim()));
}

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIMES[file.mimetype]) {
    cb(new Error('Ongeldig bestandstype. Toegestaan: PDF, DOC, DOCX, TXT, JPG, PNG'));
    return;
  }

  if (!isValidFileExtension(file.originalname, file.mimetype)) {
    cb(new Error('Bestandsextensie komt niet overeen met bestandstype'));
    return;
  }

  if (hasDangerousExtension(file.originalname)) {
    cb(new Error('Ongeldige bestandsnaam'));
    return;
  }

  cb(null, true);
};

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

// ── Brieven en contracten: ruimere set bestandstypen ──────────────────────
// De echte typebepaling gebeurt op de inhoud (magic bytes) in server/rechten/tekst.ts;
// hier alleen een eerste zeef op extensie, omdat browsers voor HEIC/JFIF vaak een leeg
// of algemeen mimetype meesturen.
const BRIEF_EXTENSIES = new Set([
  '.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt',
  '.jpg', '.jpeg', '.jfif', '.png', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.heif',
]);

const briefFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!BRIEF_EXTENSIES.has(ext)) {
    cb(new Error('Dit bestandstype wordt niet ondersteund. Toegestaan: PDF, Word (.docx/.doc), OpenDocument (.odt), RTF, TXT en foto\'s (JPG, PNG, HEIC, WebP, TIFF, BMP).'));
    return;
  }
  if (hasDangerousExtension(file.originalname)) {
    cb(new Error('Ongeldige bestandsnaam'));
    return;
  }
  cb(null, true);
};

export const uploadBrief = multer({
  storage: multer.memoryStorage(),
  fileFilter: briefFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

export function getDocumentType(mimeType: string): "doc" | "image" {
  const imageMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  return imageMimes.includes(mimeType) ? 'image' : 'doc';
}

/** Leesbare Nederlandse melding bij een mislukte upload (multer-foutcodes). */
export function uploadFoutTekst(err: any): string {
  if (err?.code === "LIMIT_FILE_SIZE") return "Een bestand is groter dan 10 MB. Verklein de foto of scan, of splits de PDF.";
  if (err?.code === "LIMIT_FILE_COUNT" || err?.code === "LIMIT_UNEXPECTED_FILE") return "Je kunt maximaal 10 bestanden tegelijk uploaden.";
  return err?.message || "Upload mislukt";
}
