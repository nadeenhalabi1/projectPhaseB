import express from 'express';
import jobsController from '../controllers/jobs.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Job CRUD
router.get('/', jobsController.getJobs);
router.post('/', jobsController.createJob);
router.get('/:id', jobsController.getJobById);
router.put('/:id', jobsController.updateJob);
router.delete('/:id', jobsController.deleteJob);

export default router;
