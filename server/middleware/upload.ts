import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Genereer volledig random bestandsnaam voor privacy
 * Geen originele bestandsnaam of klantnaam in de URL
 */
function generateRandomFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36); // Compact timestamp
  return `${timestamp}-${randomBytes}${ext}`;
}

// Configure multer storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user-specific folder met random-achtige userId
    const userId = (req as any).user?.id || "anonymous";
    const userDir = path.join(uploadsDir, userId);
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Volledig random bestandsnaam - geen originele naam voor privacy
    cb(null, generateRandomFilename(file.originalname));
  }
});

// Allowed MIME types met strikte validatie
const ALLOWED_MIMES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

/**
 * Valideer bestandsextensie tegen MIME type (voorkom polyglot attacks)
 */
function isValidFileExtension(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allowedExts = ALLOWED_MIMES[mimeType];
  return allowedExts ? allowedExts.includes(ext) : false;
}

/**
 * Controleer op gevaarlijke dubbele extensies (bijv. .php.jpg, .exe.pdf)
 * Laat normale bestandsnamen met punten door (bijv. offerte.2025.pdf)
 */
function hasDangerousExtension(filename: string): boolean {
  const dangerousExtensions = [
    '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
    '.exe', '.bat', '.cmd', '.sh', '.bash',
    '.js', '.jsx', '.ts', '.tsx',
    '.asp', '.aspx', '.jsp',
    '.cgi', '.pl', '.py', '.rb',
    '.htaccess', '.htpasswd'
  ];
  
  const lowerFilename = filename.toLowerCase();
  
  // Check of een gevaarlijke extensie ergens in de bestandsnaam voorkomt (niet op het einde)
  for (const ext of dangerousExtensions) {
    // Check of de extensie in het midden staat (niet aan het einde)
    const idx = lowerFilename.indexOf(ext);
    if (idx !== -1 && idx + ext.length < lowerFilename.length) {
      // Er is nog een extensie na deze gevaarlijke extensie
      return true;
    }
  }
  
  return false;
}

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIMES[file.mimetype]) {
    cb(new Error('Ongeldig bestandstype. Toegestaan: PDF, DOC, DOCX, TXT, JPG, PNG'));
    return;
  }
  
  // Check extensie vs MIME type (security)
  if (!isValidFileExtension(file.originalname, file.mimetype)) {
    cb(new Error('Bestandsextensie komt niet overeen met bestandstype'));
    return;
  }
  
  // Check gevaarlijke dubbele extensies (security)
  if (hasDangerousExtension(file.originalname)) {
    cb(new Error('Ongeldige bestandsnaam'));
    return;
  }
  
  cb(null, true);
};

// Configure multer upload (disk storage for general uploads)
export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Memory storage for RAG document uploads (need buffer for processing)
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Helper function to determine document type from mime type
export function getDocumentType(mimeType: string): "doc" | "image" {
  const imageMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  return imageMimes.includes(mimeType) ? 'image' : 'doc';
}
