import resumesService from '../services/resumes.service.js';
import { HTTP_STATUS } from '../config/constants.js';

class ResumesController {
  /**
   * Upload and process resume(s)
   * POST /api/jobs/:jobId/resumes/upload
   */
  async uploadResumes(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;
      const files = req.files;

      console.log('=== UPLOAD DEBUG ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Uploaded files:', files);
      console.log('Request body:', req.body);
      console.log('==================');
      if (!files || files.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const result = await resumesService.processResumes(jobId, userId, files);

      const statusCode = result.errorCount > 0
        ? HTTP_STATUS.OK // Partial success
        : HTTP_STATUS.CREATED;

      res.status(statusCode).json({
        success: true,
        message: `Processed ${result.successCount} resume(s) successfully${result.errorCount > 0 ? `, ${result.errorCount} failed` : ''}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all resumes for a job
   * GET /api/jobs/:jobId/resumes
   */
  async getJobResumes(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;

      const resumes = await resumesService.getJobResumes(jobId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { resumes },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a resume
   * DELETE /api/resumes/:id
   */
  async deleteResume(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      await resumesService.deleteResume(id, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Resume deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResumesController();
