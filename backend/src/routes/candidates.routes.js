import express from 'express';
import candidatesController from '../controllers/candidates.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All candidate routes require authentication
router.use(authenticate);

// Candidate ranking and management
router.get('/jobs/:jobId/candidates', candidatesController.getRankedCandidates);
router.post('/jobs/:jobId/candidates/rerank', candidatesController.rerankCandidates);
router.post('/jobs/:jobId/candidates/smart-rerank', candidatesController.smartRerankCandidates);
router.get('/jobs/:jobId/candidates/stats', candidatesController.getCandidateStats);
router.delete('/jobs/:jobId/candidates/cleanup-processing', candidatesController.cleanupProcessingCandidates);
router.get('/candidates/:id', candidatesController.getCandidateById);
router.patch('/candidates/:id/status', candidatesController.updateCandidateStatus);
router.patch('/candidates/:id', candidatesController.updateCandidateData);
router.delete('/candidates/:id', candidatesController.deleteCandidate);
router.post('/candidates/bulk-delete', candidatesController.bulkDeleteCandidates);

export default router;
