import authMiddleware from "../middlewares/authMiddleware.js"
import dashboardController from "../controllers/dashboardController.js"



const useDashboardRoutes = async (router) => {
  router.get('/dashboard/player', authMiddleware.authMiddleware(), dashboardController.dashboard_player);
  router.get('/dashboard/settings', authMiddleware.authMiddleware(), dashboardController.dashboard_settings);
  router.get('/dashboard/logs', authMiddleware.authMiddleware(), dashboardController.dashboard_logs);
  router.get('/dashboard/analytics', authMiddleware.authMiddleware(), dashboardController.dashboard_analytics);
}

export default useDashboardRoutes;