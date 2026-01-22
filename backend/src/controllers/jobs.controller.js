import jobsService from '../services/jobs.service.js';
import { HTTP_STATUS } from '../config/constants.js';

class JobsController {
  /**
   * Get all jobs for current user
   * GET /api/jobs
   */
  async getJobs(req, res, next) {
    try {
      const userId = req.user._id;
      const { status } = req.query;

      const jobs = await jobsService.getUserJobs(userId, { status });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new job with criteria
   * POST /api/jobs
   */
  async createJob(req, res, next) {
    try {
      const userId = req.user._id;
      const jobData = req.body;

      // Validation handled by Mongoose pre-save hook
      const job = await jobsService.createJob(userId, jobData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Job created successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job by ID
   * GET /api/jobs/:id
   */
  async getJobById(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const job = await jobsService.getJobById(id, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update job
   * PUT /api/jobs/:id
   */
  async updateJob(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updates = req.body;

      // Validation handled by Mongoose pre-update hook
      const job = await jobsService.updateJob(id, userId, updates);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Job updated successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete job
   * DELETE /api/jobs/:id
   */
  async deleteJob(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      await jobsService.deleteJob(id, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Job and associated candidates deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

}

export default new JobsController();
