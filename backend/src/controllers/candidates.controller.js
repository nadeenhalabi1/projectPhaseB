import candidatesService from '../services/candidates.service.js';
import { HTTP_STATUS } from '../config/constants.js';

class CandidatesController {
  /**
   * Get ranked candidates for a job
   * GET /api/jobs/:jobId/candidates
   */
  async getRankedCandidates(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;
      const { status } = req.query;

      const candidates = await candidatesService.getRankedCandidates(
        jobId,
        userId,
        { status }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { candidates },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Re-rank all candidates for a job
   * POST /api/jobs/:jobId/candidates/rerank
   */
  async rerankCandidates(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;

      const candidates = await candidatesService.rerankCandidates(jobId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Candidates re-ranked successfully',
        data: { candidates },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Smart re-rank - detects criteria changes and re-evaluates if needed
   * POST /api/jobs/:jobId/candidates/smart-rerank
   */
  async smartRerankCandidates(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;

      const candidates = await candidatesService.smartRerankCandidates(jobId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Candidates re-ranked with smart detection',
        data: { candidates },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get candidate by ID
   * GET /api/candidates/:id
   */
  async getCandidateById(req, res, next) {
    try {
      const user = req.user; // Pass whole user object (includes role)
      const { id } = req.params;

      const candidate = await candidatesService.getCandidateById(id, user);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { candidate },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update candidate status
   * PATCH /api/candidates/:id/status
   */
  async updateCandidateStatus(req, res, next) {
    try {
      const user = req.user; // Pass whole user object (includes role)
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Status is required',
        });
      }

      const candidate = await candidatesService.updateCandidateStatus(
        id,
        user,
        status
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Candidate status updated successfully',
        data: { candidate },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get candidate statistics for a job
   * GET /api/jobs/:jobId/candidates/stats
   */
  async getCandidateStats(req, res, next) {
    try {
      const userId = req.user._id;
      const { jobId } = req.params;

      const stats = await candidatesService.getCandidateStats(jobId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a candidate
   * DELETE /api/candidates/:id
   */
  async deleteCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      await candidatesService.deleteCandidate(id, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Candidate deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update candidate extracted data
   * PATCH /api/candidates/:id
   */
  async updateCandidateData(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const updates = req.body;

      const candidate = await candidatesService.updateCandidateData(id, userId, updates);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { candidate },
        message: 'Candidate updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up ghost candidates stuck in PROCESSING state
   * DELETE /api/jobs/:jobId/candidates/cleanup-processing
   */
  async cleanupProcessingCandidates(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user._id;

      const result = await candidatesService.cleanupProcessingCandidates(jobId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Removed ${result.deletedCount} ghost candidate(s)`,
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete multiple candidates at once
   * POST /api/candidates/bulk-delete
   */
  async bulkDeleteCandidates(req, res, next) {
    try {
      const userId = req.user._id;
      const { candidateIds } = req.body;

      const result = await candidatesService.bulkDeleteCandidates(candidateIds, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} candidate(s)`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidatesController();
