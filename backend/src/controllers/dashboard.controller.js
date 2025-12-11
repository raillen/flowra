import { dashboardService } from '../services/dashboard.service.js';

class DashboardController {
    async getGlobalDashboard(req, reply) {
        try {
            const userId = req.user.id;
            const data = await dashboardService.getGlobalData(userId);
            return { success: true, data };
        } catch (error) {
            req.log.error(error);
            reply.status(500).send({ success: false, error: 'Internal server error' });
        }
    }
}

export const dashboardController = new DashboardController();
