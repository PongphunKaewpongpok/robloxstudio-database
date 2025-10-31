import authMiddleware from "../middlewares/authMiddleware.js"
import apiController from "../controllers/apiController.js"



const useApiRoutes = async (router) => {
  router.get('/api/players', authMiddleware.authMiddleware(), apiController.getPlayers);
  router.post("/api/generateToken", authMiddleware.authMiddleware(), apiController.generateToken);
  router.get("/api/getToken", authMiddleware.authMiddleware(), apiController.getToken);
  router.post("/api/updatePlayerData", authMiddleware.authMiddleware(), apiController.updatePlayerData);
  router.get('/api/logtypes', authMiddleware.authMiddleware(), apiController.getLogTypes);
  router.post('/api/logtypes/add', authMiddleware.authMiddleware(), apiController.addLogType);
  router.post('/api/logtypes/remove', authMiddleware.authMiddleware(), apiController.removeLogType);
  router.post("/login", apiController.login);
  router.post("/register", apiController.register);
  router.post("/logout", apiController.logout);
}

export default useApiRoutes