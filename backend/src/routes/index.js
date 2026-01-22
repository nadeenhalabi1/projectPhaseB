import express from 'express';
import authRoutes from './auth.routes.js';
import jobsRoutes from './jobs.routes.js';
import resumesRoutes from './resumes.routes.js';
import candidatesRoutes from './candidates.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/jobs', jobsRoutes);
router.use('/', resumesRoutes); // Resume routes include /jobs/:jobId/resumes
router.use('/', candidatesRoutes); // Candidate routes include /jobs/:jobId/candidates
router.use('/dashboard', dashboardRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CV Screening System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      resumes: '/api/jobs/:jobId/resumes',
      candidates: '/api/jobs/:jobId/candidates',
      dashboard: '/api/dashboard',
    },
  });
});

export default router;
