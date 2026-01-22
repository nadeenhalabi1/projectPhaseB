import { Job, Candidate } from '../models/index.js';

class DashboardService {
  /**
   * Get recruiter dashboard
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getRecruiterDashboard(userId) {
    const totalJobs = await Job.countDocuments({ userId });
    const activeJobs = await Job.countDocuments({ userId, status: 'OPEN' });

    const jobs = await Job.find({ userId }).lean();
    const jobIds = jobs.map((j) => j._id);

    const totalCandidates = await Candidate.countDocuments({
      jobId: { $in: jobIds },
    });

    const recentJobs = await Job.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      stats: {
        totalJobs,
        activeJobs,
        totalCandidates,
      },
      recentJobs,
    };
  }
}

export default new DashboardService();
