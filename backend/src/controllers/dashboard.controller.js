import dashboardService from '../services/dashboard.service.js';
import { HTTP_STATUS } from '../config/constants.js';

class DashboardController {
  /**
   * Get dashboard (role-adaptive)
   * GET /api/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user._id;

      // All users are recruiters now
      const data = await dashboardService.getRecruiterDashboard(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
