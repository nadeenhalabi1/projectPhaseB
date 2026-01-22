import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from '../config/constants.js';

/**
 * Configure storage for uploaded files
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid-originalname
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = Object.keys(ALLOWED_FILE_TYPES);

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).join(', ');
    cb(
      new Error(`Invalid file type. Only ${allowedExtensions} files are allowed.`),
      false
    );
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per request
  },
});

/**
 * Middleware for single file upload
 */
export const uploadSingle = upload.single('resume');

/**
 * Middleware for multiple files upload
 */
export const uploadMultiple = upload.array('resumes', 10);
