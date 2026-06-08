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
  const dangerousExtensions = [
    '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
    '.exe', '.bat', '.cmd', '.sh', '.bash',
    '.js', '.jsx', '.ts', '.tsx',
    '.asp', '.aspx', '.jsp',
    '.cgi', '.pl', '.py', '.rb',
    '.htaccess', '.htpasswd'
  ];

  const lowerFilename = filename.toLowerCase();

  for (const ext of dangerousExtensions) {
    const idx = lowerFilename.indexOf(ext);
    if (idx !== -1) {
      return true;
    }
  }

  return false;
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

export function getDocumentType(mimeType: string): "doc" | "image" {
  const imageMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  return imageMimes.includes(mimeType) ? 'image' : 'doc';
}
