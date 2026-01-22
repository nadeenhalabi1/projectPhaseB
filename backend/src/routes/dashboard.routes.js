import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard (role-adaptive - requires authentication)
router.get('/', authenticate, dashboardController.getDashboard);

export default router;
