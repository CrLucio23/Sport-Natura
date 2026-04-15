import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/liberatorie';

// crea la cartella se non esiste
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `liberatoria_${timestamp}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF accettati'), false);
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});