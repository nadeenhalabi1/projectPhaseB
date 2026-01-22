import express from 'express';
import resumesController from '../controllers/resumes.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// All resume routes require authentication
router.use(authenticate);

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('=== PRE-MULTER DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('=====================');
  next();
};

// Resume upload and management
router.post('/jobs/:jobId/resumes/upload', debugMiddleware, uploadMultiple, resumesController.uploadResumes);
router.get('/jobs/:jobId/resumes', resumesController.getJobResumes);
router.delete('/resumes/:id', resumesController.deleteResume);

export default router;
